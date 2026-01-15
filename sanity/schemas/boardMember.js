export default {
  name: 'boardMember',
  title: 'Board Members',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'position',
      title: 'Board Position',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g., President, Vice President, Treasurer, Secretary, Board Member',
    },
    {
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Professional headshot (optional)',
    },
    {
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 5,
      description: 'Brief background and involvement with Idaho Esports',
    },
    {
      name: 'email',
      title: 'Public Email',
      type: 'email',
      description: 'Optional public contact email',
    },
    {
      name: 'linkedIn',
      title: 'LinkedIn Profile',
      type: 'url',
      description: 'Optional LinkedIn URL',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first (President = 1, VP = 2, etc.)',
      validation: Rule => Rule.required().min(1),
      initialValue: 1,
    },
    {
      name: 'active',
      title: 'Active Board Member',
      type: 'boolean',
      description: 'Toggle to show/hide on website',
      initialValue: true,
    },
    {
      name: 'termStart',
      title: 'Term Start Date',
      type: 'date',
      description: 'When this board member\'s term began',
    },
    {
      name: 'termEnd',
      title: 'Term End Date',
      type: 'date',
      description: 'When this board member\'s term ends (leave empty if ongoing)',
    },
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'position',
      media: 'photo',
      active: 'active',
    },
    prepare({ title, subtitle, media, active }) {
      return {
        title: `${active ? '✓' : '✗'} ${title}`,
        subtitle: subtitle,
        media: media,
      };
    },
  },
};