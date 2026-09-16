export const handler = async (event) => {
  console.log('Discord contact function called');
  console.log('Method:', event.httpMethod);
  
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { name, email, subject, message } = JSON.parse(event.body);
    console.log('Received contact form:', { name, email, subject });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'All fields are required' }),
      };
    }

    // Validate email format
    if (!email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email address' }),
      };
    }

    // Check if webhook URL exists
    if (!process.env.DISCORD_WEBHOOK_URL) {
      console.error('DISCORD_WEBHOOK_URL not set in environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    console.log('Sending to Discord webhook...');

    // Send to Discord webhook
    const discordPayload = {
      // For forum channels, we need to specify a thread name
      thread_name: `Contact: ${subject}`,
      embeds: [{
        title: '📧 New Contact Form Submission',
        color: 0x8B5CF6, // Purple
        fields: [
          { name: 'Name', value: name, inline: true },
          { name: 'Email', value: email, inline: true },
          { name: 'Subject', value: subject, inline: false },
          { 
            name: 'Message', 
            value: message.substring(0, 1000) + (message.length > 1000 ? '...' : ''), 
            inline: false 
          },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Idaho Esports Contact Form' },
      }],
    };

    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    console.log('Discord response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook failed:', errorText);
      
      if (response.status === 404) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Discord webhook not found' }),
        };
      }
      
      throw new Error(`Discord webhook failed: ${response.status}`);
    }

    console.log('Successfully sent to Discord');
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully' 
      }),
    };

  } catch (error) {
    console.error('Contact form error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send message',
        details: error.message 
      }),
    };
  }
};
