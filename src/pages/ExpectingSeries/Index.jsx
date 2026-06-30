import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Calendar } from "lucide-react";
import { queries } from "../../services/sanity";

export const ExpectingIndex = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    queries
      .getExpectingArticles()
      .then((data) => {
        setArticles(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load articles:", err);
        setError(
          "Unable to load articles. Please check your Sanity configuration."
        );
        setLoading(false);
      });
  }, []);

  // Group articles by category
  const articlesByCategory = articles.reduce((acc, article) => {
    const category = article.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(article);
    return acc;
  }, {});

  const categoryInfo = {
    "getting-started": {
      title: "Getting Started",
      description: "First steps to launching your esports program",
      icon: "🚀",
    },
    equipment: {
      title: "Equipment & Setup",
      description: "What you need to get your program running",
      icon: "🖥️",
    },
    "team-management": {
      title: "Team Management",
      description: "Building and leading successful teams",
      icon: "👥",
    },
    competition: {
      title: "Competition Prep",
      description: "Preparing for tournaments and matches",
      icon: "🏆",
    },
    fundraising: {
      title: "Fundraising",
      description: "Securing funding and resources",
      icon: "💰",
    },
    legal: {
      title: "Legal & Administration",
      description: "Policies, permissions, and paperwork",
      icon: "📋",
    },
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <BookOpen className="w-16 h-16 text-purple-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          What to Expect When You're Expecting...
        </h1>
        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          An Esports Team
        </p>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          A comprehensive guide for educators, coaches, and schools looking to
          start or improve their esports programs. From first steps to
          competitive success.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
          <p className="text-red-200 mb-2">{error}</p>
          <p className="text-sm text-red-300">
            CORS Error: Add http://localhost:5174 to your Sanity project's CORS
            origins at manage.sanity.io
          </p>
        </div>
      )}

      {/* Introduction */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 md:p-12">
        <h2 className="text-2xl font-bold text-white mb-4">
          Welcome to the Guide
        </h2>
        <div className="space-y-4 text-gray-300">
          <p>
            Starting an esports program can feel overwhelming. We've created
            this comprehensive guide to walk you through every step of the
            process, from initial planning to running competitive tournaments.
          </p>
          <p>
            Whether you're a teacher exploring esports for the first time, an
            administrator evaluating program viability, or a coach looking to
            level up your existing team, you'll find practical advice and
            real-world examples from Idaho schools.
          </p>
          <p className="font-semibold text-purple-300">
            This guide is constantly evolving based on feedback from our
            community. Have suggestions?
            <a
              href="/contact"
              className="text-purple-400 hover:text-purple-300 ml-1"
            >
              Let us know!
            </a>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-purple-400 py-12">
          Loading articles...
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-6">
            Articles are coming soon! Check back regularly as we add new
            content.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Request Specific Topics
          </a>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(categoryInfo).map(([categoryKey, info]) => {
            const categoryArticles = articlesByCategory[categoryKey];
            if (!categoryArticles || categoryArticles.length === 0) return null;

            return (
              <div key={categoryKey} className="space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{info.icon}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {info.title}
                    </h2>
                    <p className="text-gray-400">{info.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {categoryArticles.map((article) => (
                    <Link
                      key={article._id}
                      to={`/expecting/${article.slug.current}`}
                      className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-500 hover:scale-105 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                          {article.title}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </div>

                      {article.excerpt && (
                        <p className="text-gray-400 mb-4">{article.excerpt}</p>
                      )}

                      {article.publishedAt && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(article.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Additional Resources */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Need More Help?</h2>
        <p className="text-gray-300 mb-6">
          These articles are just the beginning. We're here to support you
          throughout your journey.
        </p>
        <div className="flex flex-wrap gap-4">
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
            className="px-6 py-3 bg-slate-700 rounded-lg text-white font-semibold hover:bg-slate-600 transition-all border border-purple-500/50"
          >
            Join Discord Community
          </a>
          <a
            href="/rules"
            className="px-6 py-3 bg-slate-700 rounded-lg text-white font-semibold hover:bg-slate-600 transition-all border border-purple-500/50"
          >
            Read Tournament Rules
          </a>
        </div>
      </div>
    </div>
  );
};
