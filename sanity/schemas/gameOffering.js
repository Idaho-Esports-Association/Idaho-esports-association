import { defineType, defineField, defineArrayMember } from "sanity";

export default defineType({
  name: "gameOffering",
  title: "Game Offering",
  type: "document",
  fields: [
    // --- Required basic fields ---
    defineField({
      name: "name",
      title: "Game Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Game Logo",
      type: "image",
      options: { hotspot: true },
    }),

    // External Logo URL
    defineField({
      name: "externalLogoUrl",
      title: "External Logo URL",
      type: "url",
      description: "Used only if no Sanity image is uploaded",
    }),

    // ESRB Rating
    defineField({
      name: "esrbRating",
      title: "ESRB Rating",
      type: "string",
      options: { list: ["E", "E10+", "T", "M"], layout: "dropdown" },
    }),

    // Short Description
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
    }),

    // --- Season Availability ---
    defineField({
      name: "seasonAvailability",
      title: "Season Availability",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Fall", value: "fall" },
          { title: "Spring", value: "spring" },
          { title: "Summer", value: "summer" },
          { title: "Year Round", value: "yearRound" },
        ],
      },
    }),

    // --- Platforms ---
    defineField({
      name: "platforms",
      title: "Platforms",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: ["PC", "Xbox", "PlayStation", "Nintendo Switch", "Mobile", "Cross-Play"],
      },
    }),

    // --- Sponsored / Supported By ---
    defineField({
      name: "supportedBy",
      title: "Supported / Sponsored By",
      type: "reference",
      to: [{ type: "sponsor" }],
    }),

    // --- Genre ---
    defineField({
      name: "genre",
      title: "Game Genre",
      type: "string",
      options: {
        list: ["Sports", "Action", "Shooter", "Battle Royale", "Fighting", "MOBA", "Strategy", "Racing", "Simulation"],
      },
    }),

    // --- Match Formats ---
    defineField({
      name: "regularSeasonFormat",
      title: "Regular Season Match Format",
      type: "string",
      options: { list: ["Bo1", "Bo3", "Bo5", "Time-Based", "Points-Based"] },
    }),
    defineField({
      name: "postSeasonFormat",
      title: "Post-Season Match Format",
      type: "string",
      options: { list: ["Bo1", "Bo3", "Bo5", "Time-Based", "Points-Based"] },
    }),

    // --- Match Length ---
    defineField({
      name: "matchLength",
      title: "Typical Match Length (minutes)",
      type: "number",
      description: "Average duration per match in minutes",
    }),

    // --- Game Type ---
    defineField({
      name: "gameType",
      title: "Game Type",
      type: "object",
      fields: [
        defineField({ name: "isTeamBased", title: "Team Based?", type: "boolean" }),
        defineField({ name: "minPlayers", title: "Minimum Players", type: "number" }),
        defineField({ name: "maxPlayers", title: "Maximum Players", type: "number" }),
        defineField({ name: "recommendedPlayers", title: "Recommended Players", type: "number" }),
        defineField({ name: "substitutesAllowed", title: "Substitutes Allowed?", type: "boolean" }),
      ],
    }),

    // --- Pricing ---
    defineField({
      name: "pricing",
      title: "Pricing",
      type: "object",
      fields: [
        defineField({ name: "costPerTeam", title: "Cost Per Team (USD)", type: "number" }),
        defineField({ name: "costPerIndividual", title: "Cost Per Individual (USD)", type: "number" }),
        defineField({ name: "notes", title: "Pricing Notes", type: "text" }),
      ],
    }),

    // --- Equipment Requirements ---
    defineField({
      name: "equipmentRequirements",
      title: "Equipment Requirements",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),

    // --- SCHEDULE CONFIGURATION ---
    defineField({
      name: "schedules",
      title: "Game Schedules",
      type: "array",
      description: "Configure schedules for different divisions/leagues",
      of: [
        defineArrayMember({
          type: "object",
          name: "schedule",
          title: "Schedule",
          fields: [
            defineField({
              name: "division",
              title: "Division/League",
              type: "string",
              description: "e.g., High School, Middle School, JV, Varsity",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "isActive",
              title: "Schedule Active?",
              type: "boolean",
              description: "Toggle to show/hide this schedule on the schedule page",
              initialValue: true,
            }),
            defineField({
              name: "timingMode",
              title: "Timing Mode",
              type: "string",
              description: "How time zones are handled",
              options: {
                list: [
                  { 
                    title: "Separate Times (Each timezone at their own local time)", 
                    value: "separate" 
                  },
                  { 
                    title: "Unified Time (All timezones at same Mountain time)", 
                    value: "unified" 
                  },
                ],
                layout: "radio",
              },
              initialValue: "separate",
            }),
            defineField({
              name: "mountainTime",
              title: "Mountain Time",
              type: "string",
              description: "Time in Mountain timezone (e.g., '3:45 PM', '4:00 PM')",
              validation: (Rule) => Rule.custom((value, context) => {
                const isActive = context.parent?.isActive;
                if (isActive && !value) {
                  return 'Mountain time is required when schedule is active';
                }
                return true;
              }),
            }),
            defineField({
              name: "pacificTime",
              title: "Pacific Time",
              type: "string",
              description: "Time in Pacific timezone (only used in 'Separate Times' mode)",
              hidden: ({ parent }) => parent?.timingMode === "unified",
            }),
            defineField({
              name: "daysOfWeek",
              title: "Days of Week",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              description: "Select all days this schedule runs",
              options: {
                list: [
                  { title: "Monday", value: "monday" },
                  { title: "Tuesday", value: "tuesday" },
                  { title: "Wednesday", value: "wednesday" },
                  { title: "Thursday", value: "thursday" },
                  { title: "Friday", value: "friday" },
                ],
                layout: "grid",
              },
              validation: (Rule) => Rule.custom((value, context) => {
                const isActive = context.parent?.isActive;
                if (isActive && (!value || value.length === 0)) {
                  return 'At least one day must be selected when schedule is active';
                }
                return true;
              }),
            }),
            defineField({
              name: "notes",
              title: "Schedule Notes",
              type: "text",
              description: "Additional information about this schedule (optional)",
              rows: 2,
            }),
          ],
          preview: {
            select: {
              division: "division",
              isActive: "isActive",
              days: "daysOfWeek",
              time: "mountainTime",
            },
            prepare({ division, isActive, days, time }) {
              const dayCount = days?.length || 0;
              const status = isActive ? "✓" : "✗";
              return {
                title: `${status} ${division}`,
                subtitle: time ? `${time} - ${dayCount} day(s)` : "Not configured",
              };
            },
          },
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: "name",
      media: "logo",
      schedules: "schedules",
    },
    prepare({ title, media, schedules }) {
      const activeCount = schedules?.filter(s => s.isActive)?.length || 0;
      const totalCount = schedules?.length || 0;
      
      let subtitle = "No schedules";
      if (totalCount > 0) {
        subtitle = activeCount > 0 
          ? `📅 ${activeCount} active schedule(s)`
          : `${totalCount} inactive schedule(s)`;
      }
      
      return {
        title: title,
        subtitle: subtitle,
        media: media,
      };
    },
  },
});