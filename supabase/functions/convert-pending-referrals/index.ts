import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONVERT-PENDING-REFERRALS] ${step}${detailsStr}`);
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

    // Trova tutti i referral "registered" che hanno pagato ma non sono stati convertiti
    const { data: pendingReferrals, error: selectError } = await supabaseClient
      .from('referrals')
      .select(`
        id,
        referred_email,
        referrer_id,
        created_at,
        user_referrals!inner(referral_code)
      `)
      .eq('status', 'registered');

    if (selectError) {
      logStep("Error fetching pending referrals", { error: selectError });
      throw selectError;
    }

    logStep("Found pending referrals", { count: pendingReferrals?.length || 0 });

    if (!pendingReferrals || pendingReferrals.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No pending referrals found",
        converted: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const results = [];

    // Per ogni referral, controlla se l'utente ha un abbonamento attivo
    for (const referral of pendingReferrals) {
      logStep("Processing referral", { email: referral.referred_email });

      // Controlla se l'utente ha un abbonamento attivo
      const { data: subscriber } = await supabaseClient
        .from('subscribers')
        .select('email, subscription_status, user_id')
        .eq('email', referral.referred_email)
        .eq('subscription_status', 'active')
        .single();

      if (subscriber) {
        logStep("Found active subscriber, converting referral", { 
          email: referral.referred_email 
        });

        // Chiama la funzione RPC per convertire il referral
        const { data: conversionResult, error: conversionError } = await supabaseClient
          .rpc('convert_referral_on_payment', { 
            user_email: referral.referred_email 
          });

        if (conversionError) {
          logStep("Conversion error", { 
            email: referral.referred_email,
            error: conversionError.message 
          });
          results.push({
            email: referral.referred_email,
            status: 'error',
            error: conversionError.message
          });
        } else {
          logStep("Conversion successful", { 
            email: referral.referred_email,
            result: conversionResult 
          });
          results.push({
            email: referral.referred_email,
            status: 'converted',
            result: conversionResult
          });
        }
      } else {
        logStep("No active subscription found", { email: referral.referred_email });
        results.push({
          email: referral.referred_email,
          status: 'no_subscription'
        });
      }
    }

    const converted = results.filter(r => r.status === 'converted').length;
    
    logStep("Conversion process completed", { 
      total: results.length,
      converted,
      results 
    });

    return new Response(JSON.stringify({ 
      message: `Processed ${results.length} referrals, converted ${converted}`,
      converted,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in convert-pending-referrals", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});