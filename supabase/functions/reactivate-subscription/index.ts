import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REACTIVATE-SUBSCRIPTION] ${step}${detailsStr}`);
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

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get current subscriber data
    const { data: subscriber, error: subError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscriber) {
      throw new Error("Subscriber not found");
    }

    // Allow reactivation if there's a cancellation_type set (even if not cancelled yet)
    if (!subscriber.cancellation_type || subscriber.cancellation_type !== 'end_of_period') {
      throw new Error("Subscription is not scheduled for cancellation or was cancelled immediately");
    }

    logStep("Found cancelled subscriber", { subscription_tier: subscriber.subscription_tier });

    // Get Stripe subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: subscriber.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active Stripe subscription found");
    }

    const stripeSubscription = subscriptions.data[0];
    logStep("Found Stripe subscription", { subscriptionId: stripeSubscription.id });

    // Reactivate on Stripe by removing cancel_at_period_end
    await stripe.subscriptions.update(stripeSubscription.id, {
      cancel_at_period_end: false
    });
    logStep("Reactivated subscription on Stripe");

    const now = new Date().toISOString();

    // Update database - remove cancellation
    await supabaseClient
      .from("subscribers")
      .update({
        is_cancelled: false,
        cancellation_type: null,
        cancellation_date: null,
        cancellation_effective_date: null,
        updated_at: now,
      })
      .eq("user_id", user.id);

    logStep("Updated database - removed cancellation info");

    return new Response(JSON.stringify({
      success: true,
      message: "Subscription reactivated successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in reactivate-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});