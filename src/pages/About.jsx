import React from "react";
import { Heart, Target, Users, Award, TrendingUp, Shield } from "lucide-react";
import { NewsletterSignup } from "../components/newsletter/NewsletterSignup";

export const About = () => {
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          About Idaho Esports
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          We're building the future of competitive gaming in Idaho, one
          tournament at a time.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 md:p-12">
        <div className="flex items-start space-x-4 mb-6">
          <Target className="w-12 h-12 text-purple-400 flex-shrink-0" />
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-xl text-gray-200 leading-relaxed">
              To provide accessible, fair, and competitive esports opportunities
              for all Idaho students while fostering sportsmanship, teamwork,
              and personal growth through gaming.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-white text-center">
          Our Core Values
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <Shield className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Integrity</h3>
            <p className="text-gray-400">
              Fair play, transparent operations, and honest communication are
              the foundation of everything we do.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <Users className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Inclusivity</h3>
            <p className="text-gray-400">
              Esports is for everyone. We create welcoming spaces where all
              students can compete regardless of skill level or background.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <TrendingUp className="w-12 h-12 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Growth</h3>
            <p className="text-gray-400">
              We're committed to continuous improvement, both in our
              organization and in helping students develop as competitors and
              individuals.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Idaho Esports Association was founded by passionate educators and
            gamers who saw the incredible potential of competitive gaming to
            engage students, teach valuable life skills, and create community
            connections across our state.
          </p>
          <p>
            What started as informal tournaments between a handful of schools
            has grown into a statewide organization supporting dozens of schools
            and hundreds of student athletes. We've watched students who were
            shy or disengaged find their voice and their community through
            esports.
          </p>
          <p>
            As a non-profit organization, every dollar we receive goes directly
            back into supporting our tournaments, providing resources for
            schools, and growing the Idaho esports community. We're grateful for
            the support of our sponsors, volunteers, and most importantly, the
            students and educators who make this all possible.
          </p>
        </div>
      </div>

      {/* What We Do */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-white text-center">
          What We Do
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <Award className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">
              Organize Tournaments
            </h3>
            <p className="text-gray-400 mb-4">
              We run regular competitive tournaments across multiple games,
              providing structured competition for Idaho schools.
            </p>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center space-x-2">
                <span className="text-purple-400">•</span>
                <span>Seasonal championships</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-purple-400">•</span>
                <span>Weekly practice scrimmages</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-purple-400">•</span>
                <span>Special event tournaments</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <Users className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">
              Support Schools
            </h3>
            <p className="text-gray-400 mb-4">
              We help schools start and grow their esports programs with
              resources, guidance, and community support.
            </p>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center space-x-2">
                <span className="text-cyan-400">•</span>
                <span>Program setup guides</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-cyan-400">•</span>
                <span>Coach training and resources</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-cyan-400">•</span>
                <span>Equipment recommendations</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <Heart className="w-10 h-10 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">
              Build Community
            </h3>
            <p className="text-gray-400 mb-4">
              We foster connections between players, coaches, and schools across
              Idaho through events and online platforms.
            </p>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center space-x-2">
                <span className="text-pink-400">•</span>
                <span>Active Discord server</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-pink-400">•</span>
                <span>Community meetups</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-pink-400">•</span>
                <span>Player development programs</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <Target className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">
              Advocate for Esports
            </h3>
            <p className="text-gray-400 mb-4">
              We work to increase recognition and support for esports programs
              in Idaho schools and communities.
            </p>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center space-x-2">
                <span className="text-purple-400">•</span>
                <span>Education advocacy</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-purple-400">•</span>
                <span>Parent and administrator resources</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-purple-400">•</span>
                <span>Partnership development</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Non-Profit Commitment */}
      <div className="bg-purple-900/30 border-l-4 border-purple-500 rounded-xl p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">
              Our Non-Profit Commitment
            </h2>
            <p className="text-gray-300 mb-4">
              Idaho Esports Association is a 501(c)(3) non-profit organization.
              This means:
            </p>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li className="flex items-start space-x-3">
                <span className="text-purple-400 mt-1">✓</span>
                <span>
                  All revenue goes directly toward supporting Idaho esports
                  programs
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-purple-400 mt-1">✓</span>
                <span>We operate with full financial transparency</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-purple-400 mt-1">✓</span>
                <span>
                  Donations are tax-deductible to the fullest extent allowed by
                  law
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-purple-400 mt-1">✓</span>
                <span>
                  Our focus is on impact and community benefit, not profit
                </span>
              </li>
            </ul>
            <a
              href="/transparency"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-all"
            >
              View Our Transparency & Governance
            </a>
          </div>

          {/* GuideStar Badge */}
          <div className="flex flex-col items-center justify-center md:w-64">
            <a
              href="https://app.candid.org/profile/15079270/idaho-esports-association-93-2128403/?pkId=dbdcfbf4-f040-410f-814a-f3ec72eaa509"
              target="_blank"
            >
              <img src="https://widgets.guidestar.org/prod/v1/pdp/transparency-seal/15079270/svg" />{" "}
            </a>
            <p className="text-center text-sm text-gray-400 mt-3">
              Verified by
              <br />
              GuideStar/Candid
            </p>
          </div>
        </div>
      </div>

      {/* Get Involved CTA */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Get Involved</h2>
        <p className="text-gray-300 mb-8">
          Whether you're a student, educator, sponsor, or supporter, there's a
          place for you in the Idaho esports community.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="/expecting"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Start a Team
          </a>
          <a
            href="/support"
            className="px-6 py-3 bg-slate-700 rounded-lg text-white font-semibold hover:bg-slate-600 transition-all border border-purple-500/50"
          >
            Become a Sponsor
          </a>
          <a
            href="/contact"
            className="px-6 py-3 bg-slate-700 rounded-lg text-white font-semibold hover:bg-slate-600 transition-all border border-purple-500/50"
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="max-w-2xl mx-auto">
        <NewsletterSignup />
      </div>
    </div>
  );
};
