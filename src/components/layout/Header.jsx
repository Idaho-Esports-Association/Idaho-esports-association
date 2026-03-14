import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Trophy } from "lucide-react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  const groups = [
    {
      title: "Compete",
      items: [
        { name: "Games", path: "/games" },
        { name: "Schedule", path: "/schedule" },
        { name: "Rules", path: "/rules" },
        { name: "Champions", path: "/champions" },
      ],
    },
    {
      title: "Learn",
      items: [
        { name: "Getting Started", path: "/expecting" },
        { name: "Schools", path: "/schools" },
      ],
    },
    {
      title: "About",
      items: [
        { name: "About", path: "/about" },
        { name: "Transparency", path: "/transparency" },
        { name: "Contact", path: "/contact" },
        { name: "Coach Help", path: "/coach-help" },
      ],
    },
    {
      title: "Resources",
      items: [
        { name: "Sponsors", path: "/sponsors" },
        { name: "Support Us", path: "/support" },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-purple-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Idaho Esports</span>
          </Link>

          {/* Desktop Navigation - grouped menus */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition-all text-sm ${
                isActive("/")
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Home
            </Link>

            {groups.map((group) => (
              <div
                key={group.title}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(group.title)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === group.title ? null : group.title,
                    )
                  }
                  className={`px-3 py-2 rounded-lg transition-all text-sm ${
                    openDropdown === group.title
                      ? "bg-slate-800 text-white"
                      : "text-gray-300 hover:bg-slate-800 hover:text-white"
                  }`}
                  aria-haspopup="true"
                  aria-expanded={openDropdown === group.title}
                >
                  {group.title}
                </button>

                {openDropdown === group.title && (
                  <div className="absolute left-0 mt-0 w-48 bg-slate-900 border border-purple-500/30 rounded-md shadow-lg z-50 pt-2">
                    <div className="py-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`block px-4 py-2 text-sm ${isActive(item.path) ? "bg-purple-600 text-white" : "text-gray-200 hover:bg-slate-800"}`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-800 border-t border-purple-500/30">
          <div className="px-4 py-4 space-y-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg transition-all ${isActive("/") ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-slate-700"}`}
            >
              Home
            </Link>

            {groups.map((group) => (
              <div key={group.title}>
                <div className="text-sm text-gray-400 px-2 mb-2 font-semibold">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg transition-all ${isActive(item.path) ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-slate-700"}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
