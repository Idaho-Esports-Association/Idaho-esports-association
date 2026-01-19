// src/pages/Champions.jsx
import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Calendar, Users, ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import { queries, urlFor } from '../services/sanity';

// Individual Championship Card Component
const ChampionshipCard = ({ result, isExpanded, onToggle }) => {
  const gameLogo = result.gameLogo ? urlFor(result.gameLogo).width(80).height(80).url() : null;
  
  const getLevelBadge = (level) => {
    const badges = {
      state: { icon: Trophy, color: 'from-yellow-400 to-yellow-600', text: 'State Champion' },
      regional: { icon: Award, color: 'from-purple-400 to-purple-600', text: 'Regional Champion' },
      district: { icon: Medal, color: 'from-cyan-400 to-cyan-600', text: 'District Champion' },
    };
    return badges[level] || badges.state;
  };

  const badge = getLevelBadge(result.championshipLevel);
  const BadgeIcon = badge.icon;

  const PlacementCard = ({ placement, data, medalColor }) => {
    if (!data || !data.schoolName) return null;

    const schoolLogo = data.schoolLogo ? urlFor(data.schoolLogo).width(60).height(60).url() : null;

    return (
      <div className={`bg-slate-900/50 border-2 ${medalColor} rounded-xl p-4 hover:scale-102 transition-transform`}>
        <div className="flex items-start gap-4">
          {/* School Logo */}
          {schoolLogo ? (
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
              <img src={schoolLogo} alt={data.schoolName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${medalColor.replace('border-', 'from-').replace('/50', '')} to-slate-700 flex items-center justify-center flex-shrink-0`}>
              <span className="text-2xl font-bold text-white">{placement}</span>
            </div>
          )}

          {/* Team Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{placement === 1 ? '🥇' : placement === 2 ? '🥈' : '🥉'}</span>
              <h4 className="font-bold text-white text-lg">{data.teamName || data.schoolName}</h4>
            </div>
            <p className="text-purple-400 font-semibold">{data.schoolName}</p>
            
            {data.coachName && (
              <p className="text-sm text-gray-400 mt-1">Coach: {data.coachName}</p>
            )}

            {/* Roster - Only show when expanded */}
            {isExpanded && data.roster && data.roster.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-gray-500 mb-1">Roster:</p>
                <div className="flex flex-wrap gap-1">
                  {data.roster.map((player, idx) => (
                    <span key={idx} className="text-xs bg-slate-800 text-gray-300 px-2 py-1 rounded">
                      {player}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500 transition-all">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Game Logo */}
            {gameLogo && (
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                <img src={gameLogo} alt={result.game} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Tournament Info */}
            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${badge.color} text-white text-sm font-bold mb-2`}>
                <BadgeIcon className="w-4 h-4" />
                {badge.text}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">{result.game}</h3>
              <p className="text-gray-400">
                {result.season.charAt(0).toUpperCase() + result.season.slice(1)} {result.year}
                {result.division && ` • ${result.division}`}
              </p>
              
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(result.eventDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
                {result.totalParticipants && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {result.totalParticipants} teams
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Expand Button */}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-purple-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-400" />
            )}
          </button>
        </div>
      </div>

      {/* Placements */}
      <div className="p-6 space-y-3">
        <PlacementCard 
          placement={1} 
          data={result.firstPlace} 
          medalColor="border-yellow-500/50"
        />
        
        {result.secondPlace?.schoolName && (
          <PlacementCard 
            placement={2} 
            data={result.secondPlace} 
            medalColor="border-gray-400/50"
          />
        )}
        
        {result.thirdPlace?.schoolName && (
          <PlacementCard 
            placement={3} 
            data={result.thirdPlace} 
            medalColor="border-orange-600/50"
          />
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-purple-500/30 pt-4">
          {result.highlights && (
            <div>
              <h5 className="text-sm font-semibold text-purple-300 mb-2">Tournament Highlights</h5>
              <p className="text-gray-300 text-sm">{result.highlights}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {result.bracketImage && (
              <a
                href={urlFor(result.bracketImage).url()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
              >
                <Trophy className="w-4 h-4" />
                View Bracket
              </a>
            )}
            
            {result.videoHighlight && (
              <a
                href={result.videoHighlight}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors border border-purple-500/50"
              >
                <span>▶</span>
                Watch Highlights
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Champions = () => {
  const [championships, setChampionships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterGame, setFilterGame] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    const loadChampionships = async () => {
      try {
        const data = await queries.getChampionshipResults();
        setChampionships(data);
      } catch (error) {
        console.error('Failed to load championship results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChampionships();
  }, []);

  const toggleExpanded = (id) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredChampionships.map(c => c._id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Get unique values for filters
  const years = ['all', ...new Set(championships.map(c => c.year))].sort((a, b) => b - a);
  const games = ['all', ...new Set(championships.map(c => c.game))].sort();
  const levels = ['all', 'state', 'regional', 'district'];

  // Filter championships
  const filteredChampionships = championships.filter(champ => {
    const matchesSearch = searchTerm === '' || 
      champ.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
      champ.firstPlace?.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      champ.firstPlace?.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      champ.secondPlace?.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      champ.thirdPlace?.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = filterYear === 'all' || champ.year === parseInt(filterYear);
    const matchesGame = filterGame === 'all' || champ.game === filterGame;
    const matchesLevel = filterLevel === 'all' || champ.championshipLevel === filterLevel;

    return matchesSearch && matchesYear && matchesGame && matchesLevel;
  });

  // Group by year
  const championshipsByYear = filteredChampionships.reduce((acc, champ) => {
    if (!acc[champ.year]) acc[champ.year] = [];
    acc[champ.year].push(champ);
    return acc;
  }, {});

  const sortedYears = Object.keys(championshipsByYear).sort((a, b) => b - a);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Trophy className="w-12 h-12 text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">Idaho Esports Champions</h1>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Celebrating excellence in competitive gaming across Idaho. 
          These teams have proven themselves as the best in the state.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-purple-400 py-12">
          Loading championship results...
        </div>
      ) : championships.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            Championship results will be posted here after each tournament season.
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by game, school, or team..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Filter Row */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year === 'all' ? 'All Years' : year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={filterGame}
                    onChange={(e) => setFilterGame(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {games.map(game => (
                      <option key={game} value={game}>
                        {game === 'all' ? 'All Games' : game}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>
                        {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count & Actions */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-gray-400 text-sm">
                  {filteredChampionships.length} {filteredChampionships.length === 1 ? 'championship' : 'championships'} found
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={expandAll}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm transition-colors"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={collapseAll}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm transition-colors"
                  >
                    Collapse All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Championships by Year */}
          {filteredChampionships.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
              <p className="text-gray-400">No championships match your filters.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {sortedYears.map(year => (
                <div key={year} className="space-y-6">
                  {/* Year Header */}
                  <div className="flex items-center gap-4">
                    <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                    <h2 className="text-3xl font-bold text-cyan-400">{year}</h2>
                    <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                  </div>

                  {/* Championships for this year */}
                  <div className="space-y-4">
                    {championshipsByYear[year]
                      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
                      .map(champ => (
                        <ChampionshipCard
                          key={champ._id}
                          result={champ}
                          isExpanded={expandedIds.has(champ._id)}
                          onToggle={() => toggleExpanded(champ._id)}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Think Your Team Has What It Takes?</h3>
        <p className="text-gray-300 mb-6">
          Join Idaho's premier esports competition and compete for the state championship title!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="/expecting"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Get Started
          </a>
          <a
            href="/rules"
            className="px-6 py-3 bg-slate-800 rounded-lg text-white font-semibold hover:bg-slate-700 transition-all border border-purple-500/50"
          >
            View Tournament Rules
          </a>
        </div>
      </div>
    </div>
  );
};