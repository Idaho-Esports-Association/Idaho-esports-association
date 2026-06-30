import React, { useEffect, useState } from 'react';
import { queries } from '../services/sanity';
import { GameCard } from '../components/games/GameCard';
import { GameModal } from '../components/games/GameModal';

export const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');

  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await queries.getGames();
        setGames(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load games. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  const platforms = ['all', ...Array.from(new Set(games.flatMap(g => g.platforms || [])))].sort();

  const filtered = games.filter(g => {
    const matchesSearch = !searchTerm || (g.title + ' ' + (g.description || '')).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || (g.platforms || []).includes(filterPlatform);
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Games We Offer</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">Browse games, see ESRB, pricing and quick links to rules. Click "View Details" to learn more.</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-4 pr-4 py-3 bg-slate-900 border border-purple-500/30 rounded-lg text-white placeholder-gray-400"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-3">
            <label className="text-gray-300 font-semibold whitespace-nowrap">Platform</label>
            <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="flex-1 px-4 py-3 bg-slate-900 border border-purple-500/30 rounded-lg text-white">
              {platforms.map(p => <option key={p} value={p}>{p === 'all' ? 'All Platforms' : p}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 text-gray-400">{filtered.length} {filtered.length === 1 ? 'game' : 'games'} found</div>
      </div>

      {loading ? (
        <div className="text-center text-purple-400">Loading games...</div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 text-center text-red-300">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
          <p className="text-gray-400">No games match your search criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(game => (
            <GameCard key={game._id} game={game} onView={(g) => setSelectedGame(g)} />
          ))}
        </div>
      )}

      {selectedGame && <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />}
    </div>
  );
};
