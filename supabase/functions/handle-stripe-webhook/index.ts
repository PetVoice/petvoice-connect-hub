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

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }
    
    logStep("Verifying webhook signature");
    
    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
    
    logStep("Webhook verified", { type: event.type, id: event.id });

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription event", { 
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status 
        });
        
        await handleSubscriptionChange(supabaseClient, subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription deletion", { 
          subscriptionId: subscription.id,
          customerId: subscription.customer 
        });
        
        await handleSubscriptionDeletion(supabaseClient, subscription);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing successful payment", { 
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.subscription 
        });
        
        if (invoice.subscription) {
          // Fetch the subscription to get updated info
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await handleSubscriptionChange(supabaseClient, subscription);
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing failed payment", { 
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.subscription 
        });
        
        if (invoice.subscription) {
          // Fetch the subscription to check status
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await handleSubscriptionChange(supabaseClient, subscription);
        }
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
    logStep("ERROR in webhook handler", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionChange(supabaseClient: any, subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const isActive = subscription.status === 'active';
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    
    // Determine subscription tier from price
    let subscriptionTier = "premium"; // Default
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      const amount = subscription.items.data[0].price.unit_amount || 0;
      
      if (amount <= 999) {
        subscriptionTier = "basic";
      } else if (amount <= 1999) {
        subscriptionTier = "premium";
      } else {
        subscriptionTier = "family";
      }
    }
    
    logStep("Updating subscription in database", {
      customerId,
      isActive,
      subscriptionTier,
      subscriptionEnd
    });
    
    // Update subscriber record
    const { error } = await supabaseClient
      .from("subscribers")
      .update({
        subscribed: isActive,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        subscription_status: subscription.status,
        is_cancelled: subscription.cancel_at_period_end || false,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", customerId);
    
    if (error) {
      logStep("Database update error", { error: error.message });
      throw error;
    }
    
    logStep("Subscription updated successfully");
    
  } catch (error) {
    logStep("Error in handleSubscriptionChange", { error: error.message });
    throw error;
  }
}

async function handleSubscriptionDeletion(supabaseClient: any, subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    
    logStep("Marking subscription as cancelled", { customerId });
    
    // Mark subscription as cancelled
    const { error } = await supabaseClient
      .from("subscribers")
      .update({
        subscribed: false,
        subscription_status: "cancelled",
        is_cancelled: true,
        cancellation_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", customerId);
    
    if (error) {
      logStep("Database deletion error", { error: error.message });
      throw error;
    }
    
    logStep("Subscription deletion processed successfully");
    
  } catch (error) {
    logStep("Error in handleSubscriptionDeletion", { error: error.message });
    throw error;
  }
}