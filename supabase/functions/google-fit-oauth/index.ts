import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { method, url } = req;
  const { searchParams } = new URL(url);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (method === 'GET') {
      // Handle OAuth callback
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      if (!code || !state) {
        return new Response(JSON.stringify({ error: 'Missing code or state' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Decode user ID from state
      const userId = state;
      
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-fit-oauth`
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        return new Response(JSON.stringify({ error: 'Token exchange failed', details: tokenData }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Calculate expiry time
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

      // Store tokens in database
      const { error } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: userId,
          integration_type: 'health',
          provider: 'google',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt.toISOString(),
          is_active: true,
          settings: {
            scopes: tokenData.scope?.split(' ') || [],
            data_types: ['activity', 'sleep', 'location']
          }
        }, {
          onConflict: 'user_id,integration_type,provider'
        });

      if (error) {
        return new Response(JSON.stringify({ error: 'Database error', details: error }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Return success page
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google Fit Connected</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
            .success { color: green; }
            .button { background: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1 class="success">✅ Google Fit Connected Successfully!</h1>
          <p>You can now close this window and return to PetVoice.</p>
          <a href="${Deno.env.get('SITE_URL')}/settings" class="button">Back to Settings</a>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    if (method === 'POST') {
      // Initiate OAuth flow
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Invalid user token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const scopes = [
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.location.read'
      ];

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', Deno.env.get('GOOGLE_CLIENT_ID') ?? '');
      authUrl.searchParams.set('redirect_uri', `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-fit-oauth`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', scopes.join(' '));
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', user.id);

      return new Response(JSON.stringify({ auth_url: authUrl.toString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});