export default {
  name: 'meetingAgenda',
  title: 'Board Meeting Agendas',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Meeting Title',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g., "January 2024 Board Meeting"',
    },
    {
      name: 'meetingDate',
      title: 'Meeting Date & Time',
      type: 'datetime',
      validation: Rule => Rule.required(),
    },
    {
      name: 'location',
      title: 'Meeting Location',
      type: 'string',
      description: 'Physical location or "Virtual via Zoom"',
    },
    {
      name: 'meetingType',
      title: 'Meeting Type',
      type: 'string',
      options: {
        list: [
          { title: 'Regular Board Meeting', value: 'regular' },
          { title: 'Special Board Meeting', value: 'special' },
          { title: 'Annual Meeting', value: 'annual' },
          { title: 'Committee Meeting', value: 'committee' },
        ],
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'status',
      title: 'Meeting Status',
      type: 'string',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: 'In Progress', value: 'inprogress' },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
      },
      initialValue: 'upcoming',
      validation: Rule => Rule.required(),
    },
    {
      name: 'agenda',
      title: 'Agenda',
      type: 'array',
      of: [{
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'H3', value: 'h3' },
        ],
        lists: [
          { title: 'Bullet', value: 'bullet' },
          { title: 'Numbered', value: 'number' },
        ],
      }],
      description: 'Meeting agenda items',
    },
    {
      name: 'agendaPDF',
      title: 'Agenda PDF',
      type: 'file',
      description: 'Optional: Upload agenda as PDF',
      options: {
        accept: 'application/pdf',
      },
    },
    {
      name: 'minutesPDF',
      title: 'Meeting Minutes PDF',
      type: 'file',
      description: 'Upload approved meeting minutes after the meeting',
      options: {
        accept: 'application/pdf',
      },
    },
    {
      name: 'publicAccess',
      title: 'Public Meeting',
      type: 'boolean',
      description: 'Is this meeting open to the public?',
      initialValue: true,
    },
    {
      name: 'publicJoinInfo',
      title: 'Public Join Information',
      type: 'text',
      rows: 3,
      description: 'How can the public join? (Zoom link, physical address, etc.)',
      hidden: ({ parent }) => !parent?.publicAccess,
    },
  ],
  orderings: [
    {
      title: 'Meeting Date (Newest First)',
      name: 'dateDesc',
      by: [{ field: 'meetingDate', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'meetingDate',
      status: 'status',
      type: 'meetingType',
    },
    prepare({ title, date, status, type }) {
      const statusEmoji = {
        upcoming: '📅',
        inprogress: '▶️',
        completed: '✓',
        cancelled: '✗',
      };
      
      return {
        title: `${statusEmoji[status] || ''} ${title}`,
        subtitle: `${type} - ${new Date(date).toLocaleDateString()}`,
      };
    },
  },
};