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
        try {
          const session = event.data.object as Stripe.Checkout.Session;
          logStep("Checkout session completed", { sessionId: session.id, customerEmail: session.customer_details?.email });

          if (session.mode === 'subscription' && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            logStep("Subscription retrieved", { subscriptionId: subscription.id, status: subscription.status });
            
            const priceId = subscription.items.data[0].price.id;
            const price = await stripe.prices.retrieve(priceId);
            const amount = price.unit_amount || 0;
            logStep("Price details", { priceId, amount });

            const subscriptionTier = 'premium'; // Solo piano Premium disponibile

            // Validate subscription end timestamp
            if (!subscription.current_period_end || subscription.current_period_end <= 0) {
              throw new Error(`Invalid subscription period end: ${subscription.current_period_end}`);
            }
            
            const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
            const customerEmail = session.customer_details?.email || session.customer_email;

            if (!customerEmail) {
              throw new Error("No customer email found in session");
            }

            logStep("About to update database", { 
              email: customerEmail, 
              tier: subscriptionTier, 
              subscriptionId: subscription.id,
              subscriptionEnd 
            });

            // Try to get user_id from metadata or by looking up the user with this email
            let userId = session.metadata?.user_id || null;
            
            if (!userId && customerEmail) {
              // Find user by email using service role
              const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers();
              if (authError) {
                logStep("Error fetching users", { error: authError.message });
              } else {
                const user = authUsers.users.find(u => u.email === customerEmail);
                if (user) {
                  userId = user.id;
                  logStep("Found user by email", { userId, email: customerEmail });
                } else {
                  logStep("No user found with email", { email: customerEmail });
                }
              }
            }

            // Update subscriber in database using correct column names
            const { data, error } = await supabaseClient.from("subscribers").upsert({
              email: customerEmail,
              user_id: userId,
              stripe_customer_id: session.customer,
              subscription_status: 'active',
              subscription_plan: 'premium',
              subscription_end_date: subscriptionEnd,
              is_cancelled: false,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            if (error) {
              logStep("Database update error", { 
                error: error.message, 
                code: error.code, 
                details: error.details,
                hint: error.hint 
              });
              throw new Error(`Database error: ${error.message} (${error.code})`);
            }

            logStep("Updated database with subscription info", { subscription_status: 'active', subscription_plan: 'premium' });

            // Log successful checkout completion
            logStep("Subscription checkout completed successfully", { 
              email: customerEmail, 
              userId: userId,
              subscriptionId: subscription.id,
              tier: subscriptionTier
            });
          } else {
            logStep("Session is not subscription mode or missing subscription", { 
              mode: session.mode, 
              subscription: session.subscription 
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logStep("Error processing checkout session", { 
            error: errorMessage,
            errorType: error?.constructor?.name,
            stack: error instanceof Error ? error.stack : undefined
          });
          throw new Error(`Checkout session processing failed: ${errorMessage}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        logStep("Subscription updated", { 
          subscriptionId: subscription.id, 
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          current_period_start: subscription.current_period_start 
        });

        // ⚠️ SAFE TIMESTAMP CONVERSION - con logging dettagliato
        let subscriptionEnd: string | null = null;
        let currentPeriodStart: string | null = null;
        
        try {
          if (subscription.current_period_end) {
            logStep("Converting current_period_end", { timestamp: subscription.current_period_end });
            subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
            logStep("Converted subscriptionEnd", { subscriptionEnd });
          }
          
          if (subscription.current_period_start) {
            logStep("Converting current_period_start", { timestamp: subscription.current_period_start });
            currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
            logStep("Converted currentPeriodStart", { currentPeriodStart });
          }
        } catch (timeError) {
          logStep("ERROR during timestamp conversion", { 
            error: timeError.message,
            current_period_end: subscription.current_period_end,
            current_period_start: subscription.current_period_start
          });
          throw timeError;
        }

        let customer: Stripe.Customer;
        try {
          customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
          logStep("Customer retrieved", { customerId: customer.id, email: customer.email });
        } catch (customerError) {
          logStep("ERROR retrieving customer", { 
            error: customerError.message,
            customerId: subscription.customer 
          });
          throw customerError;
        }

        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        logStep("Price details", { priceId, amount });

        const subscriptionTier = 'premium';
        const isActive = subscription.status === 'active';

        // Ottieni user_id dai metadata della subscription o cerca per email
        let userId = subscription.metadata?.user_id || null;
        
        if (!userId && customer.email) {
          // Cerca utente per email
          const { data: authUsers } = await supabaseClient.auth.admin.listUsers();
          const user = authUsers.users.find(u => u.email === customer.email);
          
          if (user) {
            userId = user.id;
          }
        }

        logStep("About to update database", { 
          email: customer.email, 
          userId: userId,
          tier: subscriptionTier, 
          subscriptionId: subscription.id,
          subscriptionEnd,
          status: subscription.status
        });

        try {
          logStep("About to update database", { 
            email: customer.email, 
            userId: userId,
            tier: subscriptionTier, 
            subscriptionId: subscription.id,
            subscriptionEnd,
            currentPeriodStart,
            status: subscription.status
          });

          await supabaseClient.from("subscribers").upsert({
            email: customer.email,
            user_id: userId,
            stripe_customer_id: subscription.customer,
            subscription_status: subscription.status,
            subscription_plan: isActive ? 'premium' : null,
            subscription_end_date: subscriptionEnd,
            current_period_start: currentPeriodStart,
            current_period_end: subscriptionEnd,
            is_cancelled: !isActive,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

          logStep("Updated database with subscription info", { subscription_status: subscription.status, subscription_plan: isActive ? 'premium' : null });
        } catch (dbError) {
          logStep("ERROR during database update", { 
            error: dbError.message,
            data: {
              email: customer.email,
              userId: userId,
              subscriptionEnd,
              currentPeriodStart
            }
          });
          throw dbError;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        // Get user_id for this customer
        let userId = subscription.metadata?.user_id || null;
        
        if (!userId && customer.email) {
          const { data: authUsers } = await supabaseClient.auth.admin.listUsers();
          const user = authUsers.users.find(u => u.email === customer.email);
          if (user) {
            userId = user.id;
          }
        }

        await supabaseClient.from("subscribers").upsert({
          email: customer.email,
          user_id: userId,
          stripe_customer_id: subscription.customer,
          subscription_status: 'canceled',
          subscription_plan: null,
          subscription_end_date: null,
          is_cancelled: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

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