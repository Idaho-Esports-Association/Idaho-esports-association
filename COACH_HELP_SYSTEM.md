# Coach Help Request System - Setup Complete

## Overview
A new dedicated help request system has been created for coaches that automatically feeds into ClickUp. This allows coaches to submit requests for help and have them tracked and managed in your ClickUp workspace.

## What Was Created

### 1. **New Page: Coach Help** (`src/pages/CoachHelp.jsx`)
A dedicated form page with:
- **Coach Information Fields:**
  - Coach Name
  - Email
  - School Name
  - Phone (optional)

- **Request Details:**
  - Request Type dropdown (8 options: General Question, Tournament Issue, Team Registration, Rule Clarification, Technical Support, Schedule Conflict, Player Eligibility, Other)
  - Urgency Level (Low, Normal, High, Urgent)
  - Subject line
  - Detailed description

- **Features:**
  - Real-time form validation
  - Success/error feedback messages
  - Responsive design matching your site's aesthetic (cyan/blue color scheme)
  - Auto-tagging based on request type
  - Info boxes explaining the benefits

### 2. **Netlify Function: Coach Help Handler** (`netlify/functions/coach-help-clickup.js`)
Handles form submissions with:
- ClickUp task creation with:
  - Auto-priority based on urgency level (Urgent → Priority 1, Low → Priority 4)
  - Auto-tagging (coach-request, request type, and context-based tags)
  - Formatted task description with all coach info
  - "[COACH]" prefix in task title for easy filtering

- Optional features (require additional config):
  - Confirmation email to coach via MailerSend
  - Storage of submissions in Sanity CMS

### 3. **Updated Navigation** (`src/App.jsx` & `src/components/layout/Header.jsx`)
- Added `/coach-help` route
- Added "Coach Help" link in the About section of the header navigation
- Works on both desktop and mobile

## How Coaches Access It
1. Navigate to the website
2. Go to **About** dropdown → **Coach Help**
3. Or directly visit: `yoursite.com/coach-help`

## How It Works

### Request Flow:
```
Coach submits form
        ↓
Request sent to /.netlify/functions/coach-help-clickup
        ↓
Task created in ClickUp with auto-tagging & prioritization
        ↓
(Optional) Confirmation email sent to coach
        ↓
(Optional) Submission logged in Sanity CMS
        ↓
Your team sees it in ClickUp and responds
```

## Configuration Required

### Essential (Already Have):
- `CLICKUP_API_TOKEN` - Your ClickUp API token
- `CLICKUP_LIST_ID` - The ClickUp list ID where coach requests should go

### Optional:
- `MAILERSEND_API_TOKEN` - For sending confirmation emails to coaches
- `CONTACT_FROM_EMAIL` - Email address to send from
- `SANITY_PROJECT_ID`, `SANITY_TOKEN`, `SANITY_DATASET` - For storing submissions

### Setup in Netlify:
1. Go to your Netlify site settings
2. Add environment variables (if not already set):
   - Make sure `CLICKUP_API_TOKEN` and `CLICKUP_LIST_ID` are configured
   - Optionally add MailerSend credentials for confirmations

## Auto-Tagging Examples

The system automatically tags requests based on content:
- **"tournament"** - If subject/description mentions tournaments or competitions
- **"team-management"** - If it mentions teams or players
- **"registration"** - If it mentions registration or registering
- **"rules-eligibility"** - If it mentions rules or eligibility
- **"technical"** - If it mentions errors, bugs, or technical issues
- **"scheduling"** - If it mentions schedule or timing issues

Plus the request type selected (general-question, tournament-issue, etc.)

## Priority Mapping

Urgency Level → ClickUp Priority:
- **Low** → Priority 4 (Low)
- **Normal** → Priority 3 (Normal)
- **High** → Priority 2 (High)
- **Urgent** → Priority 1 (Urgent)

## Custom Fields (Advanced)

If you have custom fields set up in ClickUp for coaches or schools, you can add them to the task creation by updating the `taskData` object in `coach-help-clickup.js`:

```javascript
custom_fields: [
  {
    id: 'your_field_id_here',
    value: schoolName,
  },
]
```

## Testing

To test the form:
1. Navigate to `/coach-help` on your site
2. Fill out all required fields
3. Submit the form
4. Check your ClickUp workspace - the task should appear in your configured list
5. Verify it has the correct priority and tags

## Notes

- Form uses same styling as your Contact page but with cyan/blue accents
- All required fields are marked with *
- Phone number is optional
- The form resets after successful submission
- Success/error messages auto-dismiss after 5 seconds
- Mobile responsive with proper touch targets

## Future Enhancements

Possible additions:
- Integration with Sanity CMS to track request history
- Email notifications to specific team members based on request type
- Webhook to Discord for urgent requests
- Request status tracking page for coaches
- File attachment support for screenshots/docs

## Support

If coaches have issues with the form, they can still use the alternative contact methods listed at the bottom of the Coach Help page:
- Discord: https://discord.gg/REySEYwFEr
- Email: support@idahoesports.gg
