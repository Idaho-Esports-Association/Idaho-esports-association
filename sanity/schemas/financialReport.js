export default {
  name: 'financialReport',
  title: 'Financial Reports',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Report Title',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g., "2024 Annual Financial Report" or "Q1 2024 Financials"',
    },
    {
      name: 'reportType',
      title: 'Report Type',
      type: 'string',
      options: {
        list: [
          { title: 'Annual Report', value: 'annual' },
          { title: 'Quarterly Report', value: 'quarterly' },
          { title: 'IRS Form 990', value: 'irs990' },
          { title: 'Budget', value: 'budget' },
          { title: 'Audit', value: 'audit' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'fiscalYear',
      title: 'Fiscal Year',
      type: 'number',
      validation: Rule => Rule.required().min(2020).max(2050),
      description: 'e.g., 2024',
    },
    {
      name: 'fiscalPeriod',
      title: 'Fiscal Period',
      type: 'string',
      description: 'e.g., "Q1", "Q2", or leave blank for annual',
    },
    {
      name: 'reportDate',
      title: 'Report Date',
      type: 'date',
      validation: Rule => Rule.required(),
      description: 'Date this report was published',
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,
      description: 'Brief overview of the financial report',
    },
    {
      name: 'reportPDF',
      title: 'Financial Report PDF',
      type: 'file',
      validation: Rule => Rule.required(),
      options: {
        accept: 'application/pdf',
      },
      description: 'Upload the complete financial report',
    },
    {
      name: 'totalRevenue',
      title: 'Total Revenue',
      type: 'number',
      description: 'Total revenue for this period (optional for display)',
    },
    {
      name: 'totalExpenses',
      title: 'Total Expenses',
      type: 'number',
      description: 'Total expenses for this period (optional for display)',
    },
    {
      name: 'highlights',
      title: 'Key Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key financial highlights or achievements',
    },
    {
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description: 'Make this report visible on the website',
      initialValue: false,
    },
  ],
  orderings: [
    {
      title: 'Year & Period (Newest First)',
      name: 'yearDesc',
      by: [
        { field: 'fiscalYear', direction: 'desc' },
        { field: 'reportDate', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      year: 'fiscalYear',
      type: 'reportType',
      published: 'published',
    },
    prepare({ title, year, type, published }) {
      return {
        title: `${published ? '✓' : '✗'} ${title}`,
        subtitle: `${type} - ${year}`,
      };
    },
  },
};