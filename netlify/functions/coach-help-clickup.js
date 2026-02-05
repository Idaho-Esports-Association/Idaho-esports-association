const CLICKUP_API = 'https://api.clickup.com/api/v2';

// Create a ClickUp task for coach help request
async function createCoachHelpTask(formData) {
    const { coachName, email, schoolName, phone, requestType, urgencyLevel, subject, description } = formData;

    // Map urgency level to ClickUp priority
    const priorityMap = {
        'low': 4,      // Low
        'normal': 3,   // Normal
        'high': 2,     // High
        'urgent': 1,   // Urgent
    };

    const priority = priorityMap[urgencyLevel] || 3;

    // Build task description
    const taskDescription = `
**Coach Information:**
- Name: ${coachName}
- Email: ${email}
- School: ${schoolName}
- Phone: ${phone || 'Not provided'}

**Request Type:** ${requestType}
**Urgency Level:** ${urgencyLevel.toUpperCase()}

**Subject:** ${subject}

**Description:**
${description}

---
*Submitted: ${new Date().toLocaleString()}*
*Source: Website Coach Help Form*
  `.trim();

    // Auto-tag based on request type and content
    const tags = ['coach-request', requestType];

    // Add additional tags based on content
    const content = (subject + ' ' + description).toLowerCase();

    if (content.includes('tournament') || content.includes('competition')) {
        tags.push('tournament');
    }
    if (content.includes('team') || content.includes('player')) {
        tags.push('team-management');
    }
    if (content.includes('register') || content.includes('registration')) {
        tags.push('registration');
    }
    if (content.includes('rule') || content.includes('eligibility')) {
        tags.push('rules-eligibility');
    }
    if (content.includes('technical') || content.includes('error') || content.includes('bug')) {
        tags.push('technical');
    }
    if (content.includes('schedule') || content.includes('time')) {
        tags.push('scheduling');
    }

    const taskData = {
        name: `[COACH] ${subject}`,
        description: taskDescription,
        priority: priority,
        tags: tags,
        status: 'NEW', // Default status
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

// Optional: Send confirmation email to coach
async function sendCoachConfirmationEmail(formData, taskId) {
    if (!process.env.MAILERSEND_API_TOKEN) {
        console.log('MailerSend not configured, skipping email notification');
        return;
    }

    const { coachName, email, schoolName } = formData;

    const emailData = {
        from: {
            email: process.env.CONTACT_FROM_EMAIL || 'noreply@idahoesports.gg',
            name: 'Idaho Esports Association',
        },
        to: [
            {
                email: email,
                name: coachName,
            },
        ],
        subject: 'Your Coach Help Request Has Been Received',
        html: `
      <h2>Thank you for reaching out!</h2>
      <p>Hi ${coachName},</p>
      <p>We've received your help request for <strong>${schoolName}</strong> and it's now in our system.</p>
      
      <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #00a8e8; margin: 20px 0;">
        <p><strong>Request Details:</strong></p>
        <p>Request ID: <code>${taskId}</code></p>
        <p>Our team will review your request and get back to you within 24 hours.</p>
      </div>
      
      <p>In the meantime, feel free to reach out on our <a href="https://discord.gg/REySEYwFEr">Discord server</a> for quick questions.</p>
      
      <p>Best regards,<br/>Idaho Esports Association Team</p>
    `,
    };

    try {
        const response = await fetch('https://api.mailersend.com/v1/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MAILERSEND_API_TOKEN}`,
            },
            body: JSON.stringify(emailData),
        });

        if (!response.ok) {
            console.warn('Failed to send confirmation email:', response.statusText);
        } else {
            console.log('Confirmation email sent to coach');
        }
    } catch (error) {
        console.warn('Error sending confirmation email:', error.message);
    }
}

// Optional: Store submission in Sanity
async function storeCoachSubmission(formData, clickupTask) {
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
        _type: 'coachHelpRequest',
        coachName: formData.coachName,
        email: formData.email,
        schoolName: formData.schoolName,
        phone: formData.phone || null,
        requestType: formData.requestType,
        urgencyLevel: formData.urgencyLevel,
        subject: formData.subject,
        description: formData.description,
        submittedAt: new Date().toISOString(),
        clickupTaskId: clickupTask?.id || null,
        clickupTaskUrl: clickupTask?.url || null,
        status: 'pending',
    };

    return await sanityClient.create(doc);
}

exports.handler = async (event) => {
    console.log('Coach help form handler called');

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
        const { coachName, email, schoolName, requestType, urgencyLevel, subject, description } = formData;

        // Validation
        if (!coachName || !email || !schoolName || !requestType || !subject || !description) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' }),
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
                    error: 'Coach help form is not properly configured. Please email us directly at support@idahoesports.gg',
                }),
            };
        }

        // Create ClickUp task
        console.log('Creating ClickUp task for coach help request...');
        const clickupTask = await createCoachHelpTask(formData);
        console.log('ClickUp task created:', clickupTask.id);

        // Send confirmation email
        try {
            await sendCoachConfirmationEmail(formData, clickupTask.id);
        } catch (emailError) {
            console.warn('Failed to send confirmation email (non-critical):', emailError.message);
        }

        // Optional: Store in Sanity
        try {
            await storeCoachSubmission(formData, clickupTask);
            console.log('Coach submission stored in Sanity');
        } catch (sanityError) {
            console.warn('Failed to store in Sanity (non-critical):', sanityError.message);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Thank you for your help request! Our team will respond within 24 hours.',
                taskId: clickupTask.id,
            }),
        };

    } catch (error) {
        console.error('Coach help form error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to submit coach help request. Please try again or email us directly.',
                details: error.message,
            }),
        };
    }
};
