export default {
  name: 'nonprofitInfo',
  title: 'Non-Profit Information',
  type: 'document',
  // Only allow one document
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'legalName',
      title: 'Legal Organization Name',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'Official registered name',
    },
    {
      name: 'ein',
      title: 'EIN (Tax ID)',
      type: 'string',
      description: 'Employer Identification Number (e.g., 12-3456789)',
    },
    {
      name: 'registeredAddress',
      title: 'Registered Address',
      type: 'text',
      rows: 3,
      description: 'Official mailing address',
    },
    {
      name: 'incorporationDate',
      title: 'Date of Incorporation',
      type: 'date',
      description: 'When was the organization officially incorporated?',
    },
    {
      name: 'incorporationState',
      title: 'State of Incorporation',
      type: 'string',
      description: 'e.g., Idaho',
    },
    {
      name: 'taxExemptStatus',
      title: '501(c)(3) Status',
      type: 'string',
      options: {
        list: [
          { title: 'Approved', value: 'approved' },
          { title: 'Pending', value: 'pending' },
          { title: 'In Application', value: 'application' },
        ],
      },
    },
    {
      name: 'taxExemptDate',
      title: 'Tax Exempt Approval Date',
      type: 'date',
      description: 'Date IRS granted 501(c)(3) status',
    },
    {
      name: 'missionStatement',
      title: 'Mission Statement',
      type: 'text',
      rows: 5,
      validation: Rule => Rule.required(),
      description: 'Official mission statement',
    },
    {
      name: 'bylawsPDF',
      title: 'Organization Bylaws',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
      description: 'Upload organizational bylaws (optional)',
    },
    {
      name: 'articlesOfIncorporation',
      title: 'Articles of Incorporation',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
      description: 'Upload articles of incorporation (optional)',
    },
    {
      name: 'conflictOfInterestPolicy',
      title: 'Conflict of Interest Policy',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
      description: 'Upload conflict of interest policy (optional)',
    },
    {
      name: 'annualReportURL',
      title: 'Latest Annual Report URL',
      type: 'url',
      description: 'Link to most recent annual report',
    },
    {
      name: 'guidestarURL',
      title: 'GuideStar/Candid Profile',
      type: 'url',
      description: 'Link to GuideStar/Candid profile if available',
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Non-Profit Organization Information',
      };
    },
  },
};