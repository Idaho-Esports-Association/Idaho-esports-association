import React, { useEffect, useState } from "react";
import { queries } from "../../services/sanity";

export const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    queries
      .getSiteSettings()
      .then(setSettings)
      .catch((err) => {
        console.warn("Failed to load footer settings:", err);
        setSettings({}); // Set empty object to prevent hanging
      });
  }, []);

  return (
    <footer className="relative z-10 mt-20 border-t border-purple-500/30 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">Organization</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/about" className="hover:text-purple-400">
                  About Us
                </a>
              </li>
              <li>
                <a href="/transparency" className="hover:text-purple-400">
                  Transparency & Governance
                </a>
              </li>
              <li>
                <a href="/schools" className="hover:text-purple-400">
                  Schools
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-purple-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/expecting" className="hover:text-purple-400">
                  Getting Started Guide
                </a>
              </li>
              <li>
                <a href="/rules" className="hover:text-purple-400">
                  Tournament Rules
                </a>
              </li>
              {settings?.tournamentPlatformUrl && (
                <li>
                  <a
                    href={settings.tournamentPlatformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-400"
                  >
                    Tournament Platform
                  </a>
                </li>
              )}
              {settings?.merchStoreUrl && (
                <li>
                  <a
                    href={settings.merchStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-400"
                  >
                    Merch Store
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/support" className="hover:text-purple-400">
                  Become a Sponsor
                </a>
              </li>
              <li>
                <a href="/support#donate" className="hover:text-purple-400">
                  Donate
                </a>
              </li>
              <li>
                <a href="/sponsors" className="hover:text-purple-400">
                  Our Sponsors
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Connect</h3>
            <ul className="space-y-2 text-gray-400">
              {settings?.discordInvite && (
                <li>
                  <a
                    href={settings.discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-400"
                  >
                    Discord Community
                  </a>
                </li>
              )}
              <li>
                <a href="/contact" className="hover:text-purple-400">
                  Email Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-purple-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left side - Badge */}
            <div className="flex items-center space-x-4">
              <a
                href="https://app.candid.org/profile/15079270/idaho-esports-association-93-2128403/?pkId=dbdcfbf4-f040-410f-814a-f3ec72eaa509"
                target="_blank"
              >
                <img src="https://widgets.guidestar.org/prod/v1/pdp/transparency-seal/15079270/svg" />{" "}
              </a>
              <div className="text-left">
                <p className="text-sm text-gray-400">Verified Non-Profit</p>
                <p className="text-xs text-gray-500">
                  GuideStar/Candid Certified
                </p>
              </div>
            </div>

            {/* Right side - 501(c)(3) info */}
            <div className="text-center md:text-right text-gray-400 text-sm">
              <p className="font-semibold">501(c)(3) Non-Profit Organization</p>
              <p className="text-xs text-gray-500 mt-1">
                Tax ID: 93-2128403 • Donations are tax-deductible
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Idaho Esports Association.
            Non-Profit Organization.
          </p>
          <p className="mt-2 text-sm">
            Committed to transparency and fair play in Idaho gaming.
          </p>
        </div>
      </div>
    </footer>
  );
};
