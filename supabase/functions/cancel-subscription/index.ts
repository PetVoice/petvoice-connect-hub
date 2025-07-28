import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { cancellation_type } = await req.json();
    if (!cancellation_type || !['immediate', 'end_of_period'].includes(cancellation_type)) {
      throw new Error("Invalid cancellation type");
    }

    logStep("User authenticated", { userId: user.id, email: user.email, cancellation_type });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get current subscriber data
    const { data: subscriber, error: subError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    logStep("Subscriber query result", { subscriber, subError });

    if (subError) {
      logStep("Subscriber query error", { error: subError });
      throw new Error(`Subscriber query failed: ${subError.message}`);
    }
    
    if (!subscriber) {
      logStep("No subscriber found");
      throw new Error("Subscriber not found");
    }

    if (subscriber.subscription_status !== 'active' || subscriber.subscription_plan === 'free') {
      logStep("No active subscription", { status: subscriber.subscription_status, plan: subscriber.subscription_plan });
      throw new Error("No active subscription to cancel");
    }

    if (!subscriber.stripe_customer_id) {
      logStep("No stripe customer ID found");
      throw new Error("No Stripe customer ID found");
    }

    logStep("Found subscriber", { subscription_plan: subscriber.subscription_plan });

    // Get Stripe subscription - try active first, then any status
    let subscriptions = await stripe.subscriptions.list({
      customer: subscriber.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    // If no active subscription found, try looking for any subscription
    if (subscriptions.data.length === 0) {
      logStep("No active subscription found, trying any status");
      subscriptions = await stripe.subscriptions.list({
        customer: subscriber.stripe_customer_id,
        limit: 1,
      });
    }

    if (subscriptions.data.length === 0) {
      // Force immediate cancellation at database level if no Stripe subscription found
      logStep("No Stripe subscription found - forcing database cancellation");
      
      const effectiveDate = cancellationType === 'immediate' ? new Date() : 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
        
      await supabaseClient.from("subscribers").update({
        is_cancelled: true,
        cancellation_type: cancellationType,
        cancellation_date: new Date().toISOString(),
        cancellation_effective_date: effectiveDate.toISOString(),
        subscription_status: cancellationType === 'immediate' ? 'cancelled' : 'active',
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);

      return new Response(JSON.stringify({
        success: true,
        cancellation_type: cancellationType,
        cancellation_effective_date: effectiveDate.toISOString(),
        message: "Subscription cancelled at database level"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripeSubscription = subscriptions.data[0];
    logStep("Found Stripe subscription", { subscriptionId: stripeSubscription.id });

    const now = new Date().toISOString();
    let effectiveDate = now;

    if (cancellation_type === 'immediate') {
      // CANCELLAZIONE IMMEDIATA - Controlla se era già cancellato a fine periodo
      const wasEndOfPeriod = subscriber.is_cancelled && 
                             subscriber.cancellation_type === 'end_of_period';
      
      // Cancel immediately on Stripe
      await stripe.subscriptions.cancel(stripeSubscription.id);
      logStep("Cancelled subscription immediately on Stripe");

      const updateData: any = {
        subscription_status: 'cancelled',
        subscription_plan: 'free',
        is_cancelled: true,
        cancellation_type: 'immediate',
        cancellation_date: now,
        cancellation_effective_date: now,
        updated_at: now,
      };

      // Se era già cancellato a fine periodo, DISTRUGGI possibilità riattivazione
      if (wasEndOfPeriod) {
        updateData.can_reactivate = false;
        updateData.immediate_cancellation_after_period_end = true;
        logStep("Destroying reactivation capability - was period end cancellation");
      }

      // Update database - immediate cancellation
      await supabaseClient
        .from("subscribers")
        .update(updateData)
        .eq("user_id", user.id);

      // Delete extra pets (keep only the first one)
      const { data: pets } = await supabaseClient
        .from("pets")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (pets && pets.length > 1) {
        const petsToDelete = pets.slice(1).map(pet => pet.id);
        await supabaseClient
          .from("pets")
          .delete()
          .in("id", petsToDelete);
        logStep("Deleted extra pets", { deletedCount: petsToDelete.length });
      }

      logStep("Cancelled subscription immediately", { 
        wasEndOfPeriod, 
        canReactivate: !wasEndOfPeriod 
      });

    } else {
      // CANCELLAZIONE A FINE PERIODO - Mantiene can_reactivate = true
      effectiveDate = new Date(stripeSubscription.current_period_end * 1000).toISOString();
      
      // Cancel at period end on Stripe
      await stripe.subscriptions.update(stripeSubscription.id, {
        cancel_at_period_end: true
      });
      logStep("Set subscription to cancel at period end on Stripe");

      // Update database - end of period cancellation
      await supabaseClient
        .from("subscribers")
        .update({
          is_cancelled: true,
          cancellation_type: 'end_of_period',
          cancellation_date: now,
          cancellation_effective_date: effectiveDate,
          can_reactivate: true, // MANTIENE possibilità riattivazione
          immediate_cancellation_after_period_end: false, // Reset per nuova cancellazione
          updated_at: now,
        })
        .eq("user_id", user.id);

      logStep("Updated database with cancellation info", { 
        cancellation_type: "end_of_period", 
        effective_date: effectiveDate,
        can_reactivate: true
      });
    }

    logStep("Updated database with cancellation info", { 
      cancellation_type, 
      effective_date: effectiveDate 
    });

    return new Response(JSON.stringify({
      success: true,
      cancellation_type,
      cancellation_effective_date: effectiveDate
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
