// Netlify serverless function: send-invite.js
// Sends a Supabase invite email to a new user on behalf of a referrer.
// Required Netlify env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const { createClient } = require('@supabase/supabase-js');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { toEmail, referralCode, fromName } = JSON.parse(event.body || '{}');

    if (!toEmail || !referralCode) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing toEmail or referralCode' }) };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid email address' }) };
    }

    // Create Supabase admin client (service role — backend only)
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Record the invite in the database before sending
    await supabaseAdmin.from('referral_invites').upsert([{
      referrer_code: referralCode,
      invitee_email: toEmail.toLowerCase().trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    }], { onConflict: 'invitee_email' });

    // Send Supabase invite email — user gets a magic link to sign up
    const redirectTo = `${process.env.SITE_URL || 'https://bizcalcindia.netlify.app'}/?ref=${referralCode}`;
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(toEmail, {
      redirectTo,
      data: { referred_by: referralCode },
    });

    if (error) {
      // If user already exists, return a friendly message instead of crashing
      if (error.message?.includes('already been registered')) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true, message: 'User already has an account.' }),
        };
      }
      throw error;
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: `Invite sent to ${toEmail}` }),
    };

  } catch (err) {
    console.error('send-invite error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    };
  }
};
