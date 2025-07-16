import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("Webhook started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No Stripe signature found");

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret || "");
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    logStep("Processing webhook event", { type: event.type });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id, customerEmail: session.customer_details?.email });

        if (session.mode === 'subscription' && session.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            logStep("Subscription retrieved", { subscriptionId: subscription.id, status: subscription.status });
            
            const priceId = subscription.items.data[0].price.id;
            const price = await stripe.prices.retrieve(priceId);
            const amount = price.unit_amount || 0;
            logStep("Price details", { priceId, amount });

            const subscriptionTier = 'premium'; // Solo piano Premium disponibile

            const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
            const customerEmail = session.customer_details?.email || session.customer_email;

            logStep("About to update database", { 
              email: customerEmail, 
              tier: subscriptionTier, 
              subscriptionId: subscription.id,
              subscriptionEnd 
            });

            // Try to get user_id from metadata or by looking up the user with this email
            let userId = session.metadata?.user_id || null;
            
            if (!userId && customerEmail) {
              // Try to find user by email in auth.users (via profile lookup)
              const { data: profile } = await supabaseClient
                .from('profiles')
                .select('user_id')
                .eq('user_id', (await supabaseClient.auth.admin.getUserByEmail(customerEmail)).data.user?.id)
                .single();
              
              if (profile) {
                userId = profile.user_id;
              }
            }

            // Update subscriber in database
            const { data, error } = await supabaseClient.from("subscribers").upsert({
              email: customerEmail,
              user_id: userId,
              stripe_customer_id: session.customer,
              subscribed: true,
              subscription_tier: subscriptionTier,
              subscription_end: subscriptionEnd,
              stripe_subscription_id: subscription.id,
              is_cancelled: false,
              cancellation_type: null,
              cancellation_date: null,
              cancellation_effective_date: null,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'email' });

            if (error) {
              logStep("Database update error", { error: error.message });
              throw error;
            }

            logStep("Successfully updated subscription", { email: customerEmail, tier: subscriptionTier, data });

            // 🚀 CONVERTI REFERRAL AL PAGAMENTO - CHIAMATA DIRETTA RPC
            if (customerEmail) {
              try {
                logStep("Attempting referral conversion", { email: customerEmail });
                const { data: referralResult, error: referralError } = await supabaseClient
                  .rpc('convert_referral_on_payment', { user_email: customerEmail });
                
                if (referralError) {
                  logStep("Referral conversion error", { error: referralError.message, email: customerEmail });
                } else {
                  logStep("Referral conversion result", { result: referralResult, email: customerEmail });
                }
              } catch (referralError) {
                logStep("Referral conversion exception", { error: referralError.message, email: customerEmail });
                // Non fallire il webhook per errori referral
              }
            }
          } catch (error) {
            logStep("Error processing subscription", { error: error.message });
            throw error;
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        
        logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });

        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;

        let subscriptionTier = 'premium'; // Solo Premium disponibile

        const isActive = subscription.status === 'active';
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

        await supabaseClient.from("subscribers").upsert({
          email: customer.email,
          stripe_customer_id: subscription.customer,
          subscribed: isActive,
          subscription_tier: isActive ? 'premium' : null,
          subscription_end: subscriptionEnd,
          stripe_subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

        logStep("Updated subscription status", { email: customer.email, active: isActive, tier: subscriptionTier });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        await supabaseClient.from("subscribers").upsert({
          email: customer.email,
          stripe_customer_id: subscription.customer,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          stripe_subscription_id: null,
          is_cancelled: true,
          cancellation_type: 'immediate',
          cancellation_date: new Date().toISOString(),
          cancellation_effective_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

        logStep("Subscription cancelled in database", { email: customer.email });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});