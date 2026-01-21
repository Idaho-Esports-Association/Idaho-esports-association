export default {
  name: 'rule',
  title: 'Rules',
  type: 'document',
  fields: [
    {
      name: 'game',
      title: 'Game',
      type: 'reference',
      to: [{ type: 'gameOffering' }],
      description: 'Select a specific game, or leave empty for general rules that apply to all games',
    },
    {
      name: 'category',
      title: 'Rule Category',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g., General Rules, Match Procedures, Technical Requirements',
    },
    {
      name: 'content',
      title: 'Rule Content (Markdown)',
      type: 'text',
      rows: 20,
      validation: Rule => Rule.required(),
      description: 'Write rules in Markdown format',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which rules appear within the game (lower numbers first)',
      initialValue: 1,
    },
  ],
  orderings: [
    {
      title: 'Game, Order',
      name: 'gameOrder',
      by: [
        { field: 'game', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      category: 'category',
      gameName: 'game.name',
      date: '_updatedAt',
    },
    prepare({ category, gameName, date }) {
      return {
        title: gameName || '🌐 General Rules',
        subtitle: `${category} - Updated: ${new Date(date).toLocaleDateString()}`,
      };
    },
  },
};