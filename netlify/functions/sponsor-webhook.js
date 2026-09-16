import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.PROJECT_ID,
  dataset: process.env.DATASET || 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
});

export const handler = async (event) => {
    // Allow CORS for OBS browser sources
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // Parse query parameters
        const params = event.queryStringParameters || {};
        const tier = params.tier; // Optional: filter by sponsor tier

        // Build Sanity query
        let query = '*[_type == "sponsor" && active == true && displayOnStream == true';
        if (tier) {
            query += ` && tier == "${tier}"`;
        }
        query += '] { _id, name, "logoUrl": logo.asset->url, streamDuration }';

        const sponsors = await sanityClient.fetch(query);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                sponsors: sponsors.map(s => ({
                    id: s._id,
                    name: s.name,
                    logo: s.logoUrl,
                    duration: s.streamDuration || 5, // Default 5 seconds
                })),
                totalCount: sponsors.length,
            }),
        };

    } catch (error) {
        console.error('Sponsor webhook error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch sponsors' }),
        };
    }
};