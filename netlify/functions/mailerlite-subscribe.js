exports.handler = async (event) => {
  // Log for debugging
  console.log('MailerLite function called');
  console.log('Method:', event.httpMethod);

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { email, name, phone, smsOptIn, groups } = JSON.parse(event.body);
    console.log('Received data:', { email, name, phone, smsOptIn, groups });

    // Validate email
    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Valid email is required' }),
      };
    }
    if (phone) subscriberFields.phone = phone;
    if (smsOptIn && phone) {
      subscriberFields.sms_consent = 'yes';
      subscriberFields.sms_consent_timestamp = new Date().toISOString();
    }
    // Check if API key exists
    if (!process.env.MAILERLITE_API_KEY) {
      console.error('MAILERLITE_API_KEY not set in environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Security: Only allow 'general' group from public signups
    const allowedGroups = ['general'];
    const safeGroups = (groups || []).filter(g => allowedGroups.includes(g));

    // Get group ID from environment variable
    const groupId = process.env.MAILERLITE_GROUP_GENERAL;
    if (!groupId && safeGroups.length > 0) {
      console.error('MAILERLITE_GROUP_GENERAL not set in environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    console.log('Calling MailerLite API...');

    // Determine which API version to use based on API key format
    // New MailerLite tokens are longer (usually 64+ characters)
    const isNewMailerLite = process.env.MAILERLITE_API_KEY.length > 40;

    let response;

    if (isNewMailerLite) {
      // NEW MailerLite API (accounts created after March 22, 2022)
      console.log('Using NEW MailerLite API');
      response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
        },
        body: JSON.stringify({
          email: email,
          fields: {
            name: name || '',
          },
          groups: safeGroups.length > 0 && groupId ? [groupId] : [],
        }),
      });
    } else {
      // CLASSIC MailerLite API (accounts created before March 22, 2022)
      console.log('Using CLASSIC MailerLite API v2');
      response = await fetch('https://api.mailerlite.com/api/v2/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MailerLite-ApiKey': process.env.MAILERLITE_API_KEY,
        },
        body: JSON.stringify({
          email: email,
          name: name || '',
          groups: safeGroups.length > 0 && groupId ? [groupId] : [],
        }),
      });
    }

    const data = await response.json();
    console.log('MailerLite response status:', response.status);
    console.log('MailerLite response:', data);

    if (!response.ok) {
      console.error('MailerLite API error:', data);

      // Handle specific error cases
      if (response.status === 401) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'API authentication failed' }),
        };
      }

      if (response.status === 422) {
        // Validation error - possibly already subscribed
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: data.message || 'Email may already be subscribed'
          }),
        };
      }

      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.message || 'Failed to subscribe' }),
      };
    }

    console.log('Successfully subscribed:', email);
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Successfully subscribed to newsletter'
      }),
    };

  } catch (error) {
    console.error('Newsletter signup error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
    };
  }
};