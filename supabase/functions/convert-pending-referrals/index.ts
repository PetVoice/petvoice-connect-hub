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

    // Test semplice - trova referrals registered
    const { data: referrals, error } = await supabaseClient
      .from("referrals")
      .select("id, referred_email, status, referred_user_id")
      .eq("status", "registered");

    logStep("Query executed", { error, count: referrals?.length || 0 });

    if (error) {
      throw error;
    }

    // Convertiamo solo il primo referral per test
    let convertedCount = 0;
    
    if (referrals && referrals.length > 0) {
      const firstReferral = referrals[0];
      
      // Aggiorna status a converted
      const { error: updateError } = await supabaseClient
        .from("referrals")
        .update({ 
          status: "converted", 
          converted_at: new Date().toISOString() 
        })
        .eq("id", firstReferral.id);

      if (updateError) {
        logStep("Update error", { error: updateError });
      } else {
        convertedCount = 1;
        logStep("Successfully converted referral", { id: firstReferral.id });
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