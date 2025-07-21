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

  try {
    logStep("Function started - test version");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Trova referrals registered con subscription attiva
    const { data: referrals, error } = await supabaseClient
      .from("referrals")
      .select("id, referred_email, status, referred_user_id, referrer_id")
      .eq("status", "registered");

    logStep("Query executed", { error, count: referrals?.length || 0 });

    if (error) {
      throw error;
    }

    let convertedCount = 0;
    
    if (referrals && referrals.length > 0) {
      for (const referral of referrals) {
        try {
          // Controlla se ha subscription attiva
          const { data: subscriber } = await supabaseClient
            .from("subscribers")
            .select("subscription_status")
            .eq("user_id", referral.referred_user_id)
            .single();
          
          if (subscriber && subscriber.subscription_status === 'active') {
            logStep("Processing referral with active subscription", { id: referral.id });
            
            // Aggiorna referral a converted
            const { error: updateError } = await supabaseClient
              .from("referrals")
              .update({ 
                status: "converted", 
                converted_at: new Date().toISOString() 
              })
              .eq("id", referral.id);

            if (updateError) {
              logStep("Update error", { error: updateError });
              continue;
            }

            // Calcola tier e commissione
            const { data: referrerStats } = await supabaseClient
              .from("referrer_stats")
              .select("*")
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
            
            // Crea commissione
            const { error: commissionError } = await supabaseClient
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

            if (commissionError) {
              logStep("Commission creation error", { error: commissionError });
              continue;
            }

            // Aggiorna statistiche referrer
            const { error: statsError } = await supabaseClient
              .from("referrer_stats")
              .update({
                total_conversions: totalConversions,
                available_credits: (referrerStats?.available_credits || 0) + commissionAmount,
                total_credits_earned: (referrerStats?.total_credits_earned || 0) + commissionAmount,
                current_tier: tier,
                updated_at: new Date().toISOString()
              })
              .eq("user_id", referral.referrer_id);

            if (statsError) {
              logStep("Stats update error", { error: statsError });
              continue;
            }

            convertedCount++;
            logStep("Successfully converted referral with credits", { 
              id: referral.id, 
              commission: commissionAmount, 
              tier: tier 
            });
          }
        } catch (error) {
          logStep("Error processing referral", { error: error.message });
        }
      }
    }

    return new Response(JSON.stringify({ 
      converted: convertedCount,
      total: referrals?.length || 0,
      message: `Test function - converted ${convertedCount} referrals` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage, stack: error?.stack });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error?.stack || "No stack trace available"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});