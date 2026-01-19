// sanity/schemas/championshipResult.js
export default {
  name: 'championshipResult',
  title: 'Championship Results',
  type: 'document',
  fields: [
    // Tournament Info
    {
      name: 'tournamentName',
      title: 'Tournament Name',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g., "Fall 2024 State Championship"',
    },
    {
      name: 'game',
      title: 'Game Name',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'Full game name (e.g., "Rocket League", "League of Legends")',
    },
    {
      name: 'gameLogo',
      title: 'Game Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Upload game logo (especially for games no longer offered)',
    },
    
    // Championship Level
    {
      name: 'championshipLevel',
      title: 'Championship Level',
      type: 'string',
      options: {
        list: [
          { title: 'State Championship', value: 'state' },
          { title: 'Regional Championship', value: 'regional' },
          { title: 'District Championship', value: 'district' },
        ],
      },
      initialValue: 'state',
      validation: Rule => Rule.required(),
      description: 'Type of championship',
    },
    
    // Season & Year
    {
      name: 'season',
      title: 'Season',
      type: 'string',
      options: {
        list: [
          { title: 'Spring', value: 'spring' },
          { title: 'Summer', value: 'summer' },
          { title: 'Fall', value: 'fall' },
          { title: 'Winter', value: 'winter' },
        ],
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: Rule => Rule.required().min(2020).max(2050),
    },
    {
      name: 'eventDate',
      title: 'Championship Date',
      type: 'date',
      validation: Rule => Rule.required(),
      description: 'Date the championship concluded',
    },
    
    // Division
    {
      name: 'division',
      title: 'Division',
      type: 'string',
      description: 'e.g., "High School", "Middle School", "JV", "Varsity"',
    },
    
    // First Place (Required)
    {
      name: 'firstPlace',
      title: '🥇 First Place',
      type: 'object',
      validation: Rule => Rule.required(),
      fields: [
        {
          name: 'teamName',
          title: 'Team Name',
          type: 'string',
          validation: Rule => Rule.required(),
          description: 'e.g., "Lightning Strikers" or just school name if no team name',
        },
        {
          name: 'schoolName',
          title: 'School Name',
          type: 'string',
          validation: Rule => Rule.required(),
        },
        {
          name: 'schoolLogo',
          title: 'School Logo',
          type: 'image',
          options: { hotspot: true },
        },
        {
          name: 'roster',
          title: 'Team Roster',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Player names (optional, one per line)',
        },
        {
          name: 'coachName',
          title: 'Coach Name',
          type: 'string',
        },
      ],
    },
    
    // Second Place (Optional)
    {
      name: 'secondPlace',
      title: '🥈 Second Place',
      type: 'object',
      fields: [
        {
          name: 'teamName',
          title: 'Team Name',
          type: 'string',
        },
        {
          name: 'schoolName',
          title: 'School Name',
          type: 'string',
        },
        {
          name: 'schoolLogo',
          title: 'School Logo',
          type: 'image',
          options: { hotspot: true },
        },
        {
          name: 'roster',
          title: 'Team Roster',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'coachName',
          title: 'Coach Name',
          type: 'string',
        },
      ],
    },
    
    // Third Place (Optional)
    {
      name: 'thirdPlace',
      title: '🥉 Third Place',
      type: 'object',
      fields: [
        {
          name: 'teamName',
          title: 'Team Name',
          type: 'string',
        },
        {
          name: 'schoolName',
          title: 'School Name',
          type: 'string',
        },
        {
          name: 'schoolLogo',
          title: 'School Logo',
          type: 'image',
          options: { hotspot: true },
        },
        {
          name: 'roster',
          title: 'Team Roster',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'coachName',
          title: 'Coach Name',
          type: 'string',
        },
      ],
    },
    
    // Additional Info
    {
      name: 'totalParticipants',
      title: 'Total Participating Teams',
      type: 'number',
      description: 'How many teams competed?',
    },
    {
      name: 'highlights',
      title: 'Tournament Highlights',
      type: 'text',
      rows: 4,
      description: 'Brief description or memorable moments (optional)',
    },
    {
      name: 'bracketImage',
      title: 'Bracket/Results Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional: Upload final bracket screenshot',
    },
    {
      name: 'videoHighlight',
      title: 'Video Highlight URL',
      type: 'url',
      description: 'Optional: Link to tournament highlight video (YouTube, Twitch, etc.)',
    },
  ],
  
  // Preview in Sanity Studio
  preview: {
    select: {
      title: 'tournamentName',
      game: 'game',
      year: 'year',
      season: 'season',
      level: 'championshipLevel',
      winner: 'firstPlace.schoolName',
      media: 'gameLogo',
    },
    prepare({ title, game, year, season, level, winner, media }) {
      const levelEmoji = {
        state: '🏆',
        regional: '🎖️',
        district: '🏅',
      };
      
      return {
        title: `${levelEmoji[level] || '🏆'} ${game} - ${season} ${year}`,
        subtitle: `Champion: ${winner || 'TBD'}`,
        media: media,
      };
    },
  },
  
  // Default ordering: newest first
  orderings: [
    {
      title: 'Newest First',
      name: 'dateDesc',
      by: [
        { field: 'year', direction: 'desc' },
        { field: 'eventDate', direction: 'desc' },
      ],
    },
    {
      title: 'Oldest First',
      name: 'dateAsc',
      by: [
        { field: 'year', direction: 'asc' },
        { field: 'eventDate', direction: 'asc' },
      ],
    },
  ],
};