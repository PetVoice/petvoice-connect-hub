import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-STRIPE] ${step}${detailsStr}`);
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
    logStep("Starting Stripe sync");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Prendi tutti i referral registrati degli ultimi 30 giorni
    const { data: pendingReferrals, error: referralError } = await supabaseClient
      .from('referrals')
      .select('referred_email, status, created_at')
      .eq('status', 'registered')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (referralError) {
      logStep("Error fetching referrals", { error: referralError });
      throw referralError;
    }

    logStep("Found pending referrals", { count: pendingReferrals?.length || 0 });

    let syncedCount = 0;
    let convertedCount = 0;

    // Per ogni email, controlla se ha un abbonamento attivo in Stripe
    for (const referral of pendingReferrals || []) {
      try {
        logStep("Checking Stripe for email", { email: referral.referred_email });

        // Cerca clienti Stripe con questa email
        const customers = await stripe.customers.list({
          email: referral.referred_email,
          limit: 1
        });

        if (customers.data.length === 0) {
          logStep("No Stripe customer found", { email: referral.referred_email });
          continue;
        }

        const customer = customers.data[0];
        
        // Cerca abbonamenti attivi per questo cliente
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1
        });

        if (subscriptions.data.length === 0) {
          logStep("No active subscription found", { email: referral.referred_email });
          continue;
        }

        const subscription = subscriptions.data[0];
        logStep("Found active subscription", { 
          email: referral.referred_email, 
          subscriptionId: subscription.id 
        });

        // Controlla se già esiste nella tabella subscribers
        const { data: existingSubscriber } = await supabaseClient
          .from('subscribers')
          .select('email')
          .eq('email', referral.referred_email)
          .maybeSingle();

        if (!existingSubscriber) {
          // Crea record subscriber
          const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
          
          const { error: insertError } = await supabaseClient
            .from('subscribers')
            .insert({
              email: referral.referred_email,
              stripe_customer_id: customer.id,
              subscription_status: 'active',
              subscription_plan: 'premium',
              subscription_end_date: subscriptionEnd,
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            logStep("Error creating subscriber record", { 
              email: referral.referred_email, 
              error: insertError 
            });
            continue;
          }

          syncedCount++;
          logStep("Created subscriber record", { email: referral.referred_email });
        }

        // Ora converti il referral
        const { data: conversionResult, error: conversionError } = await supabaseClient
          .rpc('convert_referral_on_payment', { 
            user_email: referral.referred_email 
          });

        if (conversionError) {
          logStep("Conversion error", { 
            email: referral.referred_email,
            error: conversionError.message 
          });
        } else {
          logStep("Conversion successful", { 
            email: referral.referred_email,
            result: conversionResult 
          });
          convertedCount++;
        }

      } catch (error) {
        logStep("Error processing referral", { 
          email: referral.referred_email,
          error: error.message 
        });
      }
    }

    const result = {
      success: true,
      message: `Sync completed: ${syncedCount} subscribers synced, ${convertedCount} referrals converted`,
      synced_subscribers: syncedCount,
      converted_referrals: convertedCount,
      processed_at: new Date().toISOString()
    };

    logStep("Sync completed", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in sync", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});