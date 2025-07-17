import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        user_id: user.id,
        stripe_customer_id: null,
        subscription_status: 'inactive',
        subscription_plan: 'free',
        subscription_end_date: null,
        is_cancelled: false,
        cancellation_type: null,
        cancellation_date: null,
        cancellation_effective_date: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        subscription_tier: 'free',
        subscription_end: null,
        is_cancelled: false,
        cancellation_type: null,
        cancellation_date: null,
        cancellation_effective_date: null,
        usage: await getUserUsage(supabaseClient, user.id)
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determine subscription tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      // Premium: €0.97 = 97 cents, Family: €1.97 = 197 cents
      if (amount === 97) {
        subscriptionTier = "premium";
      } else if (amount === 197) {
        subscriptionTier = "family";
      } else {
        // Default based on amount range for flexibility
        if (amount <= 100) {
          subscriptionTier = "premium";
        } else {
          subscriptionTier = "family";
        }
      }
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
    } else {
      logStep("No active subscription found");
    }

    // Get current subscriber data to check cancellation status
    const { data: existingSubscriber } = await supabaseClient
      .from("subscribers")
      .select("is_cancelled, cancellation_type, cancellation_date, cancellation_effective_date, can_reactivate, immediate_cancellation_after_period_end")
      .eq("user_id", user.id)
      .single();

    await supabaseClient.from("subscribers").upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      subscription_status: hasActiveSub ? 'active' : 'inactive',
      subscription_plan: subscriptionTier || 'free',
      subscription_end_date: subscriptionEnd,
      // MANTIENI SEMPRE i dati di cancellazione dal database (non resetare!)
      is_cancelled: existingSubscriber?.is_cancelled || false,
      cancellation_type: existingSubscriber?.cancellation_type || null,
      cancellation_date: existingSubscriber?.cancellation_date || null,
      cancellation_effective_date: existingSubscriber?.cancellation_effective_date || null,
      can_reactivate: existingSubscriber?.can_reactivate !== false,
      immediate_cancellation_after_period_end: existingSubscriber?.immediate_cancellation_after_period_end || false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    const usage = await getUserUsage(supabaseClient, user.id);

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier || 'free',
      subscription_end: subscriptionEnd,
      // MANTIENI SEMPRE i dati di cancellazione reali dal database
      is_cancelled: existingSubscriber?.is_cancelled || false,
      cancellation_type: existingSubscriber?.cancellation_type || null,
      cancellation_date: existingSubscriber?.cancellation_date || null,
      cancellation_effective_date: existingSubscriber?.cancellation_effective_date || null,
      can_reactivate: existingSubscriber?.can_reactivate !== false,
      immediate_cancellation_after_period_end: existingSubscriber?.immediate_cancellation_after_period_end || false,
      usage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function getUserUsage(supabaseClient: any, userId: string) {
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  // Count analyses this month
  const { count: analysesCount } = await supabaseClient
    .from('pet_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', currentMonth.toISOString());

  // Count pets
  const { count: petsCount } = await supabaseClient
    .from('pets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);

  return {
    analyses_this_month: analysesCount || 0,
    total_pets: petsCount || 0,
    last_updated: new Date().toISOString()
  };
}