import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Filter } from 'lucide-react';
import { queries } from '../services/sanity';
import { urlFor } from '../services/sanity';

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
};

// Individual Game Schedule Card Component
const GameScheduleCard = ({ game, schedule }) => {
  const logoUrl = game.logo 
    ? urlFor(game.logo).width(80).height(80).url()
    : game.externalLogoUrl;

  const getTimeDisplay = () => {
    if (schedule.timingMode === 'unified') {
      return (
        <div className="text-sm">
          <div className="font-semibold text-cyan-400">All Leagues:</div>
          <div className="text-gray-300">
            {schedule.mountainTime} MT / 
            {convertMountainToPacific(schedule.mountainTime)} PT
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold text-purple-400">Mountain:</span>
            <span className="text-gray-300 ml-2">{schedule.mountainTime} MT</span>
          </div>
          <div>
            <span className="font-semibold text-pink-400">Pacific:</span>
            <span className="text-gray-300 ml-2">{schedule.pacificTime} PT</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20">
      {/* Top Section - Logo and Game Info */}
      <div className="p-4 flex items-start gap-4">
        {/* Game Logo */}
        {logoUrl && (
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-900/50 border border-purple-500/20">
            <img 
              src={logoUrl} 
              alt={game.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Game Name and Division */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-lg mb-2">{game.name}</h4>
          
          {/* Division Badge and Genre */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-block px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded font-semibold text-white">
              {schedule.division}
            </span>
            {game.genre && (
              <span className="px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded text-purple-300">
                {game.genre}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Time Info (Full Width) */}
      <div className="px-4 py-3 bg-slate-900/50 border-t border-purple-500/20">
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            {getTimeDisplay()}
            
            {/* Schedule Notes */}
            {schedule.notes && (
              <div className="mt-2 pt-2 border-t border-slate-700">
                <p className="text-xs text-gray-400">{schedule.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Day Column Component
const DayColumn = ({ day, scheduleItems }) => {
  return (
    <div className="bg-slate-900/30 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-center">
        <h3 className="text-xl font-bold text-white">{DAY_LABELS[day]}</h3>
      </div>

      {/* Games List */}
      <div className="p-4 space-y-3">
        {scheduleItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No games scheduled
          </div>
        ) : (
          scheduleItems.map((item, idx) => (
            <GameScheduleCard 
              key={`${item.game._id}-${item.schedule.division}-${idx}`} 
              game={item.game} 
              schedule={item.schedule}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Helper function to convert Mountain time to Pacific
const convertMountainToPacific = (mountainTime) => {
  if (!mountainTime) return '';
  
  const match = mountainTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return mountainTime;
  
  let [, hours, minutes, period] = match;
  hours = parseInt(hours);
  
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  hours -= 1;
  
  const newPeriod = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${displayHours}:${minutes} ${newPeriod}`;
};

export const Schedule = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('week');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [availableDivisions, setAvailableDivisions] = useState([]);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await queries.getScheduledGames();
        setGames(data);
        
        // Extract unique divisions
        const divisions = new Set();
        data.forEach(game => {
          game.schedules?.forEach(schedule => {
            if (schedule.isActive) {
              divisions.add(schedule.division);
            }
          });
        });
        setAvailableDivisions(['all', ...Array.from(divisions).sort()]);
      } catch (error) {
        console.error('Failed to load schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  // Flatten games and schedules into individual schedule items
  const getScheduleItems = () => {
    const items = [];
    games.forEach(game => {
      game.schedules?.forEach(schedule => {
        if (schedule.isActive) {
          // Filter by division if selected
          if (selectedDivision !== 'all' && schedule.division !== selectedDivision) {
            return;
          }
          items.push({ game, schedule });
        }
      });
    });
    return items;
  };

  const scheduleItems = getScheduleItems();

  // Organize schedule items by day
  const itemsByDay = DAYS_ORDER.reduce((acc, day) => {
    acc[day] = scheduleItems.filter(item => 
      item.schedule.daysOfWeek?.includes(day)
    );
    return acc;
  }, {});

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Calendar className="w-12 h-12 text-purple-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">Game Schedule</h1>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Weekly schedule for all Idaho Esports Association competitive games. 
          Times shown are for regular season play.
        </p>
      </div>

      {/* League Info Banner */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Users className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-white mb-2">League Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-purple-400">Mountain Timezone:</span>
                <span className="text-gray-300 ml-2">Teams in Mountain League</span>
              </div>
              <div>
                <span className="font-semibold text-pink-400">Pacific Timezone:</span>
                <span className="text-gray-300 ml-2">Teams in Pacific League</span>
              </div>
            </div>
            <p className="text-gray-400 mt-2 text-sm">
              Some games run at the same local time for each timezone, while others run simultaneously across all timezones.
              Use the division filter to view specific leagues (High School, Middle School, etc.).
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-purple-400 py-12">
          Loading schedule...
        </div>
      ) : scheduleItems.length === 0 && selectedDivision === 'all' ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            No games currently scheduled
          </p>
          <p className="text-gray-500 text-sm">
            Check back soon for the latest schedule, or contact us for more information.
          </p>
        </div>
      ) : (
        <>
          {/* Controls Bar */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Division Filter */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <Filter className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <label htmlFor="division-filter" className="text-gray-300 font-semibold whitespace-nowrap">
                  Division:
                </label>
                <select
                  id="division-filter"
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="flex-1 lg:w-64 px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {availableDivisions.map(div => (
                    <option key={div} value={div}>
                      {div === 'all' ? 'All Divisions' : div}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="inline-flex rounded-lg bg-slate-900 border border-purple-500/30 p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    viewMode === 'week'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Week View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  List View
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-center lg:text-left">
              <p className="text-gray-400 text-sm">
                {scheduleItems.length} {scheduleItems.length === 1 ? 'game schedule' : 'game schedules'} 
                {selectedDivision !== 'all' && ` in ${selectedDivision}`}
              </p>
            </div>
          </div>

          {scheduleItems.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
              <p className="text-gray-400">No schedules found for {selectedDivision}.</p>
            </div>
          ) : (
            <>
              {/* Week View - Desktop Grid */}
              {viewMode === 'week' && (
                <>
                  <div className="hidden lg:grid lg:grid-cols-5 gap-4">
                    {DAYS_ORDER.map(day => (
                      <DayColumn key={day} day={day} scheduleItems={itemsByDay[day]} />
                    ))}
                  </div>

                  {/* Week View - Mobile Stack */}
                  <div className="lg:hidden space-y-4">
                    {DAYS_ORDER.map(day => (
                      <DayColumn key={day} day={day} scheduleItems={itemsByDay[day]} />
                    ))}
                  </div>
                </>
              )}

              {/* List View - All Games */}
              {viewMode === 'list' && (
                <div className="space-y-6">
                  {DAYS_ORDER.map(day => {
                    const dayItems = itemsByDay[day];
                    if (dayItems.length === 0) return null;

                    return (
                      <div key={day} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                          <h2 className="text-2xl font-bold text-cyan-400 px-4">{DAY_LABELS[day]}</h2>
                          <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {dayItems.map((item, idx) => (
                            <GameScheduleCard 
                              key={`${item.game._id}-${item.schedule.division}-${idx}`}
                              game={item.game} 
                              schedule={item.schedule}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Important Notes */}
      <div className="bg-purple-900/30 border-l-4 border-purple-500 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-300 mb-2">Schedule Notes</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>• All times are shown for regular season play</li>
          <li>• Post-season and tournament schedules may vary</li>
          <li>• Schedule is subject to change - check here for updates</li>
          <li>• Contact your coach or league coordinator with questions</li>
        </ul>
      </div>

      {/* Contact CTA */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Questions About the Schedule?</h3>
        <p className="text-gray-300 mb-6">
          Need clarification on match times or want to discuss schedule conflicts? 
          We're here to help!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="/contact"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Contact Us
          </a>
          <a
            href="https://discord.gg/REySEYwFEr"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-slate-800 rounded-lg text-white font-semibold hover:bg-slate-700 transition-all border border-purple-500/50"
          >
            Join Discord
          </a>
        </div>
      </div>
    </div>
  );
};