import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-TEST-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email } = await req.json();
    if (!email) throw new Error("Email is required");

    logStep("Cancelling subscription for email", { email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // 1. Trova il customer Stripe
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ message: "No customer found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // 2. Trova e cancella tutti gli abbonamenti attivi
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    logStep("Found active subscriptions", { count: subscriptions.data.length });

    for (const subscription of subscriptions.data) {
      logStep("Cancelling subscription", { subscriptionId: subscription.id });
      
      // Cancella immediatamente
      await stripe.subscriptions.cancel(subscription.id);
      
      logStep("Cancelled subscription", { subscriptionId: subscription.id });
    }

    // 3. Aggiorna il database
    logStep("Updating database");
    await supabaseClient
      .from("subscribers")
      .update({
        subscription_status: "cancelled",
        subscription_end_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", customerId);

    logStep("Database updated successfully");

    return new Response(JSON.stringify({ 
      message: "Subscription cancelled successfully",
      cancelledSubscriptions: subscriptions.data.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});