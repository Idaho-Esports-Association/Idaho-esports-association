const CLICKUP_API = 'https://api.clickup.com/api/v2';

// Create a ClickUp task
async function createClickUpTask(formData) {
  const { name, email, subject, message } = formData;
  
  // Determine priority based on subject keywords
  const subjectLower = subject.toLowerCase();
  let priority = 3; // Default: Normal
  
  if (subjectLower.includes('urgent') || subjectLower.includes('emergency')) {
    priority = 1; // Urgent
  } else if (subjectLower.includes('important') || subjectLower.includes('asap')) {
    priority = 2; // High
  } else if (subjectLower.includes('question') || subjectLower.includes('info')) {
    priority = 4; // Low
  }

  // Auto-detect tags based on subject/message
  const tags = [];
  const content = (subject + ' ' + message).toLowerCase();
  
  if (content.includes('school') || content.includes('team')) {
    tags.push('school-inquiry');
  }
  if (content.includes('sponsor') || content.includes('partner')) {
    tags.push('sponsorship');
  }
  if (content.includes('tournament') || content.includes('competition')) {
    tags.push('tournament');
  }
  if (content.includes('volunteer') || content.includes('help')) {
    tags.push('volunteer');
  }
  if (content.includes('bug') || content.includes('error') || content.includes('broken')) {
    tags.push('technical');
  }
  
  // If no tags matched, add 'general-inquiry'
  if (tags.length === 0) {
    tags.push('general-inquiry');
  }

  // Build task description
  const description = `
**Contact Information:**
- Name: ${name}
- Email: ${email}

**Message:**
${message}

---
*Submitted: ${new Date().toLocaleString()}*
*Source: Website Contact Form*
  `.trim();

  const taskData = {
    name: `Contact: ${subject}`,
    description: description,
    priority: priority,
    tags: tags,
    status: 'NEW', // Default status - you can customize this in ClickUp
    // Custom fields can be added here if configured in ClickUp
    // custom_fields: [
    // { id: '1ffb5764-51e2-44be-82ac-3c818b74c8e1', value: name },
    // { id: 'db51b3fe-0d12-4a56-a756-55335e988678', value: email },
    // { id: '3a97db8f-b70c-4122-93e1-b0a7406b7898', value: Date.now() + 24*60*60*1000 }, // 1 day from now (Unix timestamp)
    // { id: 'b3ff9132-a37e-4671-9a57-70611e2211f1', value: 'Website' },
    // ]
  };

  const response = await fetch(`${CLICKUP_API}/list/${process.env.CLICKUP_LIST_ID}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.CLICKUP_API_TOKEN,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('ClickUp API error:', errorData);
    throw new Error(`ClickUp API error: ${response.status}`);
  }

  const result = await response.json();
  return result;
}

// Optional: Store submission in Sanity
async function storeSanitySubmission(formData, clickupTask) {
  if (!process.env.SANITY_PROJECT_ID || !process.env.SANITY_TOKEN) {
    console.log('Sanity not configured, skipping storage');
    return null;
  }

  const { createClient } = require('@sanity/client');
  
  const sanityClient = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    token: process.env.SANITY_TOKEN,
    useCdn: false,
    apiVersion: '2024-01-01',
  });

  const doc = {
    _type: 'contactSubmission',
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
    message: formData.message,
    submittedAt: new Date().toISOString(),
    clickupTaskId: clickupTask?.id || null,
    clickupTaskUrl: clickupTask?.url || null,
    status: 'pending',
  };

  return await sanityClient.create(doc);
}

exports.handler = async (event) => {
  console.log('ClickUp contact form handler called');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const formData = JSON.parse(event.body);
    const { name, email, subject, message } = formData;

    // Validation
    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'All fields are required' }),
      };
    }

    if (!email.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' }),
      };
    }

    // Check if ClickUp is configured
    if (!process.env.CLICKUP_API_TOKEN || !process.env.CLICKUP_LIST_ID) {
      console.error('ClickUp not configured - check environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Contact form is not properly configured. Please email us directly at info@idahoesports.gg',
        }),
      };
    }

    // Create ClickUp task
    console.log('Creating ClickUp task...');
    const clickupTask = await createClickUpTask(formData);
    console.log('ClickUp task created:', clickupTask.id);

    // Optional: Store in Sanity
    try {
      await storeSanitySubmission(formData, clickupTask);
      console.log('Submission stored in Sanity');
    } catch (sanityError) {
      console.warn('Failed to store in Sanity (non-critical):', sanityError.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Thank you for contacting us! We\'ll respond within 24-48 hours.',
        taskId: clickupTask.id,
      }),
    };

  } catch (error) {
    console.error('Contact form error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to submit contact form. Please try again or email us directly at info@idahoesports.gg',
        details: error.message,
      }),
    };
  }
};