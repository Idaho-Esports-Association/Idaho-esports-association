exports.handler = async (event) => {
  console.log('LeagueOS schools function called');

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Check if API key exists
    if (!process.env.LEAGUEOS_API_KEY) {
      console.error('LEAGUEOS_API_KEY not set in environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    console.log('Fetching from LeagueOS API...');

    // Call LeagueOS API from server-side
    const response = await fetch('https://api.leagueos.gg/league/groups?ipp=400', {
      headers: {
        'x-leagueos-api-key': process.env.LEAGUEOS_API_KEY,
      },
    });

    console.log('LeagueOS API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LeagueOS API error:', errorText);

      if (response.status === 401 || response.status === 403) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'API authentication failed' }),
        };
      }

      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch schools' }),
      };
    }

    const data = await response.json();
    console.log('Successfully fetched schools data');

    // Validate data structure
    if (!data || !data.data || !Array.isArray(data.data.results)) {
      console.error('Invalid data format from LeagueOS');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Invalid data format from API' }),
      };
    }

    // Filter out type 5 teams and "Example" team
    const filteredTeams = data.data.results.filter(
      team =>
        team.type !== 5 &&
        team.name !== "Example" &&
        team.teamCount > 0 &&
        team.name !== "Yellow Lemming" &&
        team.leagueData?.["0t09cs7ryuio2onmqfb80wbq2"]?.state !== 0
    );

    // Transform data for frontend
    const schools = filteredTeams.map(team => ({
      id: team.id,
      name: team.schoolData?.name || Object.values(team.eagueData || {})[0]?.name || team.name,
      city: team.city || null,
      logo: team.avatar ? `https://images.leagueos.gg/groups/${team.id}/${team.avatar}` : null,
      teamCount: team.teamCount || null,
      leagueosUrl: `https://idahoesports.leagueos.gg/schools/${team.id}`,
      type: team.type,
    }));

    console.log(`Returning ${schools.length} schools`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
      body: JSON.stringify({
        success: true,
        schools: schools,
        count: schools.length,
      }),
    };

  } catch (error) {
    console.error('Error in LeagueOS function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
    };
  }
};