import React, { useEffect, useState } from "react";
import { BookOpen, Clock, ChevronDown, ChevronUp, Search } from "lucide-react";
import { queries } from "../services/sanity";

const slugify = (text) =>
  text
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "") // remove non-word chars
    .replace(/\-\-+/g, "-");

// Simple Markdown renderer
const MarkdownRenderer = ({ content }) => {
  const parseMarkdown = (text) => {
    if (!text) return "";

    // Headers
    text = text.replace(
      /^### (.*$)/gim,
      '<h3 class="text-xl font-bold text-purple-300 mt-4 mb-2">$1</h3>'
    );
    text = text.replace(
      /^## (.*$)/gim,
      '<h2 class="text-2xl font-bold text-purple-200 mt-6 mb-3">$1</h2>'
    );
    text = text.replace(
      /^# (.*$)/gim,
      '<h1 class="text-3xl font-bold text-purple-100 mt-8 mb-4">$1</h1>'
    );

    // Bold and italic
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    text = text.replace(
      /\*\*(.+?)\*\*\*/g,
      '<strong class="text-cyan-300">$1</strong>'
    );
    text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Links
    text = text.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-purple-400 hover:text-purple-300 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Lists
    text = text.replace(/^\* (.+)$/gim, '<li class="ml-4 mb-1">$1</li>');
    text = text.replace(
      /^\d+\. (.+)$/gim,
      '<li class="ml-4 mb-1 list-decimal">$1</li>'
    );

    // Line breaks
    text = text.replace(/\n\n/g, '</p><p class="mb-3">');

    return `<p class="mb-3">${text}</p>`;
  };

  return (
    <div
      className="prose prose-invert max-w-none text-gray-300"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

// Individual Rule Card Component
const RuleCard = ({ rule, isOpen, onToggle }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500 transition-all">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{rule.category}</h3>
          {rule.gameName && (
            <span className="text-sm text-purple-400">{rule.gameName}</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {rule.lastUpdated && (
            <span className="text-sm text-gray-500 hidden sm:block">
              Updated{" "}
              {new Date(rule.lastUpdated).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-purple-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 py-6 border-t border-purple-500/30 bg-slate-900/30">
          <MarkdownRenderer content={rule.content} />
        </div>
      )}
    </div>
  );
};

export const Rules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [openRules, setOpenRules] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");

  useEffect(() => {
    const loadRules = async () => {
      try {
        const data = await queries.getRules();
        setRules(data);

        // Find most recent update
        if (data.length > 0) {
          const dates = data
            .map((r) => new Date(r.lastUpdated))
            .filter((d) => !isNaN(d));
          if (dates.length > 0) {
            setLastUpdated(new Date(Math.max(...dates)));
          }
        }
      } catch (error) {
        console.error("Failed to load rules:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  useEffect(() => {
    if (!loading && rules.length > 0 && window.location.hash) {
      setTimeout(() => {
        const hash = window.location.hash.slice(1);
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [loading, rules]);

  const toggleRule = (ruleId) => {
    setOpenRules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setOpenRules(new Set(filteredRules.map((r) => r._id)));
  };

  const collapseAll = () => {
    setOpenRules(new Set());
  };

  // Get unique games for filter - now using gameName instead of game
  const games = [
    "all",
    ...new Set(rules.map((r) => r.gameName).filter(Boolean)),
  ].sort();

  // Filter rules by search and game
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      searchTerm === "" ||
      rule.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGame =
      selectedGame === "all" || rule.gameName === selectedGame;

    return matchesSearch && matchesGame;
  });

  // Group rules by game - now using gameName
  const rulesByGame = filteredRules.reduce((acc, rule) => {
    const game = rule.gameName || "General Rules";
    if (!acc[game]) acc[game] = [];
    acc[game].push(rule);
    return acc;
  }, {});

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <BookOpen className="w-12 h-12 text-purple-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Tournament Rules
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Official rules and regulations for all Idaho Esports Association
          tournaments. Click any section to expand and view detailed rules.
        </p>
        {lastUpdated && (
          <div className="flex items-center justify-center space-x-2 text-purple-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Last updated:{" "}
              {lastUpdated.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center text-purple-400 py-12">
          Loading rules...
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
          <p className="text-gray-400">
            Rules are currently being updated. Please check back soon or contact
            us for more information.
          </p>
        </div>
      ) : (
        <>
          {/* Search and Filter Bar */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Game Filter */}
              <div className="flex items-center space-x-3">
                <label
                  htmlFor="game-filter"
                  className="text-gray-300 font-semibold whitespace-nowrap"
                >
                  Filter by Game:
                </label>
                <select
                  id="game-filter"
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {games.map((game) => (
                    <option key={game} value={game}>
                      {game === "all" ? "All Games" : game}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expand/Collapse All */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                {filteredRules.length}{" "}
                {filteredRules.length === 1 ? "rule" : "rules"} found
              </p>
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-semibold transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-semibold transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          {/* Rules Organized by Game */}
          {filteredRules.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
              <p className="text-gray-400">
                No rules match your search criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(rulesByGame)
                .sort()
                .map(([game, gameRules]) => (
                  <div key={game} className="space-y-4">
                    {/* Game Header */}
                    <div className="flex items-center space-x-3">
                      <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                      <h2
                        id={slugify(game)}
                        className="text-2xl font-bold text-cyan-400 whitespace-nowrap px-4"
                      >
                        {game}
                      </h2>
                      <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                    </div>

                    {/* Rule Cards for this Game */}
                    <div className="space-y-3">
                      {gameRules.map((rule) => (
                        <RuleCard
                          key={rule._id}
                          rule={rule}
                          isOpen={openRules.has(rule._id)}
                          onToggle={() => toggleRule(rule._id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      {/* Important Notice */}
      <div className="bg-purple-900/30 border-l-4 border-purple-500 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-300 mb-2">
          Important Notice
        </h3>
        <p className="text-gray-300 mb-2">
          All participants are required to read and understand these rules
          before competing. Failure to comply with tournament rules may result
          in penalties or disqualification.
        </p>
        <p className="text-gray-400 text-sm">
          Rules are subject to change. We will notify all registered
          participants of any rule updates via email and our Discord server.
        </p>
      </div>

      {/* Questions CTA */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">
          Have Questions About the Rules?
        </h3>
        <p className="text-gray-300 mb-6">
          If you need clarification on any rule or have suggestions for
          improvements, we'd love to hear from you.
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
