export default {
  name: 'legalDocument',
  title: 'Legal Documents',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Document Title',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. "Privacy Policy" or "Terms of Service"',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required(),
      description: 'Used in the URL. Use "privacy-policy" or "terms-of-service".',
    },
    {
      name: 'effectiveDate',
      title: 'Effective Date',
      type: 'date',
      validation: Rule => Rule.required(),
    },
    {
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'date',
      validation: Rule => Rule.required(),
    },
    {
      name: 'intro',
      title: 'Introduction Paragraph',
      type: 'text',
      rows: 4,
      description: 'Optional introductory paragraph shown before the sections.',
    },
    {
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'heading',
              title: 'Section Heading',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'body',
              title: 'Section Content',
              type: 'text',
              rows: 8,
              description: 'Supports basic markdown: **bold**, *italic*, bullet lists with "- item"',
            },
          ],
          preview: {
            select: { title: 'heading' },
          },
        },
      ],
    },
    {
      name: 'contactEmail',
      title: 'Contact Email for Policy Questions',
      type: 'string',
      description: 'Email address shown at the bottom of the document.',
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'effectiveDate' },
  },
};
