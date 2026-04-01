// sanity/schemas/newsletterEmail.js
// Add this file to your sanity/schemas/ folder
// Then import and add it in sanity/schemas/index.js

export default {
  name: 'newsletterEmail',
  title: 'Newsletter Emails',
  type: 'document',
  fields: [
    // ─── Basic Info ────────────────────────────────────────────────────────────
    {
      name: 'subject',
      title: 'Email Subject Line',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'The subject line of the email as it appeared in inboxes.',
    },
    {
      name: 'internalName',
      title: 'Internal Name / Nickname',
      type: 'string',
      description: 'Optional short name for finding this email quickly in Sanity (e.g. "Fall Kickoff 2024"). Not shown publicly.',
    },
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'subject',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      description: 'Auto-generated from subject. Used in the web address for this email.',
    },

    // ─── Dates ────────────────────────────────────────────────────────────────
    {
      name: 'sentAt',
      title: 'Date Sent',
      type: 'datetime',
      validation: Rule => Rule.required(),
      description: 'When was this email sent to subscribers?',
      initialValue: () => new Date().toISOString(),
    },

    // ─── Tags ─────────────────────────────────────────────────────────────────
    {
      name: 'audienceTags',
      title: 'Audience Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: '🏫 Everyone', value: 'everyone' },
          { title: '🎓 High School', value: 'high-school' },
          { title: '📚 Middle School', value: 'middle-school' },
          { title: '🏆 Coaches', value: 'coaches' },
          { title: '🤝 Sponsors & Partners', value: 'sponsors' },
          { title: '🌐 Outside Opportunities', value: 'outside-opportunities' },
          { title: '📢 Announcements', value: 'announcements' },
          { title: '🗓️ Events', value: 'events' },
          { title: '💰 Fundraising', value: 'fundraising' },
          { title: '⚙️ Admin & Operations', value: 'admin' },
        ],
        layout: 'grid',
      },
      description: 'Who was this email intended for? Select all that apply.',
    },
    {
      name: 'customTags',
      title: 'Additional Custom Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Add any extra tags that do not fit above. Type a tag and press Enter. These will also appear as filter options on the website.',
      options: {
        layout: 'tags',
      },
    },

    // ─── Content ──────────────────────────────────────────────────────────────
    {
      name: 'previewText',
      title: 'Preview / Summary',
      type: 'text',
      rows: 3,
      description: 'A short summary of what this email covered. Shown on the archive page so readers know if it is relevant to them.',
      validation: Rule => Rule.max(300).warning('Keep the preview under 300 characters so it displays cleanly.'),
    },
    {
      name: 'mailerliteUrl',
      title: 'MailerLite Web View URL',
      type: 'url',
      description: 'Paste the "View in browser" link from MailerLite here. Readers who click "View Email" will be taken to this page.',
    },
    {
      name: 'highlightedLinks',
      title: 'Key Links from This Email',
      type: 'array',
      description: 'Optional: list the most important links from this email so readers can jump straight to them.',
      of: [
        {
          type: 'object',
          name: 'link',
          title: 'Link',
          fields: [
            {
              name: 'label',
              title: 'Link Label',
              type: 'string',
              validation: Rule => Rule.required(),
              description: 'e.g. "Register for Fall Playoffs"',
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: Rule => Rule.required(),
            },
          ],
          preview: {
            select: { title: 'label', subtitle: 'url' },
          },
        },
      ],
    },

    // ─── Visibility ───────────────────────────────────────────────────────────
    {
      name: 'published',
      title: 'Show on Website',
      type: 'boolean',
      description: 'Toggle off to hide this email from the public archive.',
      initialValue: true,
    },
  ],

  // ─── Ordering in Sanity Studio ────────────────────────────────────────────
  orderings: [
    {
      title: 'Newest First',
      name: 'sentAtDesc',
      by: [{ field: 'sentAt', direction: 'desc' }],
    },
    {
      title: 'Oldest First',
      name: 'sentAtAsc',
      by: [{ field: 'sentAt', direction: 'asc' }],
    },
  ],

  // ─── Studio Preview ───────────────────────────────────────────────────────
  preview: {
    select: {
      title: 'subject',
      subtitle: 'sentAt',
      published: 'published',
      internalName: 'internalName',
    },
    prepare({ title, subtitle, published, internalName }) {
      const date = subtitle
        ? new Date(subtitle).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'No date set';
      const status = published ? '✓' : '✗';
      const display = internalName ? `${title} (${internalName})` : title;
      return {
        title: `${status} ${display}`,
        subtitle: `Sent ${date}`,
      };
    },
  },
};
