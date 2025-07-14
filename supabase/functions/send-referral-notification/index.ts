import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReferralNotificationRequest {
  referrer_email: string;
  referrer_name: string;
  referred_email: string;
  referral_code: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { referrer_email, referrer_name, referred_email, referral_code }: ReferralNotificationRequest = await req.json();

    console.log('Sending referral notification:', { referrer_email, referrer_name, referred_email, referral_code });

    const emailResponse = await resend.emails.send({
      from: "PetVoice <noreply@petvoice.com>",
      to: [referrer_email],
      subject: "🎉 Nuovo Referral Registrato su PetVoice!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Fantastico!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Hai ricevuto un nuovo referral!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">Dettagli del Referral</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 10px 0;"><strong>Email del nuovo utente:</strong> ${referred_email}</p>
              <p style="margin: 0 0 10px 0;"><strong>Tuo codice referral:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${referral_code}</code></p>
              <p style="margin: 0;"><strong>Data registrazione:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
            </div>
          </div>
          
          <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #2d5a2d; margin: 0 0 15px 0; font-size: 18px;">💰 Cosa Succede Ora?</h3>
            <ul style="color: #2d5a2d; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Il nuovo utente ha completato la registrazione</li>
              <li style="margin-bottom: 8px;">Riceverai crediti quando sottoscriverà un abbonamento Premium</li>
              <li style="margin-bottom: 8px;">I crediti verranno applicati automaticamente al tuo prossimo rinnovo</li>
              <li style="margin-bottom: 0;">Continuerai a ricevere crediti ad ogni suo rinnovo mensile</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${Deno.env.get("SUPABASE_URL")?.replace('https://', 'https://').replace('.supabase.co', '')}.lovable.app/affiliate" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Visualizza Dashboard Affiliazione
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 25px;">
            <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">💡 Suggerimento</h4>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              Continua a condividere il tuo codice referral per massimizzare i tuoi guadagni! 
              Più persone inviti, più crediti accumuli per i tuoi abbonamenti futuri.
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0;">
              Grazie per essere parte della community PetVoice! 🐾<br>
              <a href="mailto:support@petvoice.com" style="color: #667eea;">Contatta il Supporto</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-referral-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);