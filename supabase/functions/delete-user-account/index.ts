import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    
    const user = userData.user;
    if (!user) throw new Error("User not found");

    console.log(`Starting account deletion for user: ${user.id}`);

    // First, get subscriber info to cancel Stripe subscription if exists
    const { data: subscriberData } = await supabaseClient
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    // Cancel Stripe subscription if customer exists
    if (subscriberData?.stripe_customer_id) {
      try {
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (stripeKey) {
          const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
          
          // Get all active subscriptions for this customer
          const subscriptions = await stripe.subscriptions.list({
            customer: subscriberData.stripe_customer_id,
            status: 'active'
          });

          // Cancel all active subscriptions
          for (const subscription of subscriptions.data) {
            await stripe.subscriptions.cancel(subscription.id);
            console.log(`Cancelled Stripe subscription: ${subscription.id}`);
          }

          console.log(`Cancelled Stripe subscriptions for customer: ${subscriberData.stripe_customer_id}`);
        }
      } catch (stripeError) {
        console.error("Error cancelling Stripe subscription:", stripeError);
        // Continue with account deletion even if Stripe cancellation fails
      }
    }

    // Delete all user-related data in order
    const deletionPromises = [
      // Delete pets and related data
      supabaseClient.from('pets').delete().eq('user_id', user.id),
      
      // Delete analyses
      supabaseClient.from('pet_analyses').delete().eq('user_id', user.id),
      
      // Delete diary entries
      supabaseClient.from('diary_entries').delete().eq('user_id', user.id),
      
      // Delete health metrics
      supabaseClient.from('health_metrics').delete().eq('user_id', user.id),
      
      // Delete pet wellness scores
      supabaseClient.from('pet_wellness_scores').delete().eq('user_id', user.id),
      
      // Delete calendar events
      supabaseClient.from('calendar_events').delete().eq('user_id', user.id),
      
      // Delete medical records
      supabaseClient.from('medical_records').delete().eq('user_id', user.id),
      
      // Delete medications
      supabaseClient.from('medications').delete().eq('user_id', user.id),
      
      // Delete pet insurance
      supabaseClient.from('pet_insurance').delete().eq('user_id', user.id),
      
      // Delete health alerts
      supabaseClient.from('health_alerts').delete().eq('user_id', user.id),
      
      // Delete symptoms
      supabaseClient.from('symptoms').delete().eq('user_id', user.id),
      
      // Delete emergency contacts
      supabaseClient.from('emergency_contacts').delete().eq('user_id', user.id),
      
      
      // Delete community messages
      supabaseClient.from('community_messages').delete().eq('user_id', user.id),
      
      // Delete channel subscriptions
      supabaseClient.from('user_channel_subscriptions').delete().eq('user_id', user.id),
      
      // Delete support tickets
      supabaseClient.from('support_tickets').delete().eq('user_id', user.id),
      
      // Delete feature requests
      supabaseClient.from('support_feature_requests').delete().eq('user_id', user.id),
      
      // Delete activity log
      supabaseClient.from('activity_log').delete().eq('user_id', user.id),
      
      // Delete subscribers
      supabaseClient.from('subscribers').delete().eq('user_id', user.id),
      
      // Delete profiles
      supabaseClient.from('profiles').delete().eq('user_id', user.id)
    ];

    const deletionResults = await Promise.allSettled(deletionPromises);
    
    // Log any failures but don't stop the process
    deletionResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Deletion failed for operation ${index}:`, result.reason);
      }
    });

    // Delete the user account
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    console.log(`Account deletion completed for user: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error deleting account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});