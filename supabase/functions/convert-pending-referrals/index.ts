import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONVERT-REFERRALS] ${step}${detailsStr}`);
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
    logStep("Starting conversion of pending referrals");

    // Prima trova tutti i referrals con status "registered"
    const { data: registeredReferrals, error: referralError } = await supabaseClient
      .from("referrals")
      .select("*")
      .eq("status", "registered");

    if (referralError) {
      logStep("Error fetching registered referrals", { error: referralError });
      throw referralError;
    }

    logStep("Found registered referrals", { count: registeredReferrals?.length || 0 });

    if (!registeredReferrals || registeredReferrals.length === 0) {
      return new Response(JSON.stringify({ converted: 0, message: "No registered referrals found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Filtra solo quelli con subscription attiva
    const pendingReferrals = [];
    for (const referral of registeredReferrals) {
      if (referral.referred_user_id) {
        const { data: subscriber } = await supabaseClient
          .from("subscribers")
          .select("subscription_status")
          .eq("user_id", referral.referred_user_id)
          .single();
        
        if (subscriber && subscriber.subscription_status === 'active') {
          pendingReferrals.push(referral);
        }
      }
    }

    logStep("Found referrals with active subscriptions", { count: pendingReferrals.length });

    if (pendingReferrals.length === 0) {
      return new Response(JSON.stringify({ converted: 0, message: "No referrals with active subscriptions found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let convertedCount = 0;

    for (const referral of pendingReferrals) {
      try {
        logStep("Processing referral", { referralId: referral.id });

        // Calcola tier del referrer
        const { data: referrerStats } = await supabaseClient
          .from("referrer_stats")
          .select("total_conversions")
          .eq("user_id", referral.referrer_id)
          .single();

        const totalConversions = (referrerStats?.total_conversions || 0) + 1;
        
        let tier = 'Bronzo';
        let rate = 0.05;
        
        if (totalConversions >= 20) {
          tier = 'Platino';
          rate = 0.20;
        } else if (totalConversions >= 10) {
          tier = 'Oro';  
          rate = 0.15;
        } else if (totalConversions >= 5) {
          tier = 'Argento';
          rate = 0.10;
        }

        const commissionAmount = 0.97 * rate;

        // Converti referral
        await supabaseClient
          .from("referrals")
          .update({ status: "converted", converted_at: new Date().toISOString() })
          .eq("id", referral.id);

        // Crea commissione
        await supabaseClient
          .from("referral_commissions")
          .insert({
            referrer_id: referral.referrer_id,
            referred_user_id: referral.referred_user_id,
            amount: commissionAmount,
            commission_rate: rate,
            tier: tier,
            commission_type: 'first_payment',
            subscription_amount: 0.97,
            status: 'active',
            billing_period_start: new Date().toISOString().split('T')[0],
            billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });

        // Aggiorna stats
        await supabaseClient
          .from("referrer_stats")
          .update({
            total_conversions: totalConversions,
            available_credits: (referrerStats?.available_credits || 0) + commissionAmount,
            total_credits_earned: (referrerStats?.total_credits_earned || 0) + commissionAmount,
            current_tier: tier,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", referral.referrer_id);

        convertedCount++;
        logStep("Successfully converted referral", { referralId: referral.id });

      } catch (error) {
        logStep("Error processing referral", { error: error.message });
      }
    }

    return new Response(JSON.stringify({ 
      converted: convertedCount,
      total: pendingReferrals.length,
      message: `Successfully converted ${convertedCount} referrals` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in conversion", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});