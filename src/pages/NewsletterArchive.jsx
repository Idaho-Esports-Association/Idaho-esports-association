import React, { useEffect, useState, useMemo } from 'react';
import { Mail, Tag, ExternalLink, Search, Calendar, ChevronRight, Inbox } from 'lucide-react';
import { sanityClient } from '../services/sanity';

// ─── Sanity Query ─────────────────────────────────────────────────────────────
// This query lives here for self-containment.
// You can optionally move it into src/services/sanity.js as:
//   getNewsletterEmails: () => sanityClient.fetch(NEWSLETTER_QUERY)
const NEWSLETTER_QUERY = `
  *[_type == "newsletterEmail" && published == true] | order(sentAt desc) {
    _id,
    subject,
    "slug": slug.current,
    sentAt,
    previewText,
    mailerliteUrl,
    audienceTags,
    customTags,
    highlightedLinks[] {
      label,
      url
    }
  }
`;

// ─── Preset tag display config ────────────────────────────────────────────────
const TAG_META = {
  'everyone':             { label: 'Everyone',              emoji: '🏫' },
  'high-school':          { label: 'High School',           emoji: '🎓' },
  'middle-school':        { label: 'Middle School',         emoji: '📚' },
  'coaches':              { label: 'Coaches',               emoji: '🏆' },
  'sponsors':             { label: 'Sponsors & Partners',   emoji: '🤝' },
  'outside-opportunities':{ label: 'Outside Opportunities', emoji: '🌐' },
  'announcements':        { label: 'Announcements',         emoji: '📢' },
  'events':               { label: 'Events',                emoji: '🗓️' },
  'fundraising':          { label: 'Fundraising',           emoji: '💰' },
  'admin':                { label: 'Admin & Operations',    emoji: '⚙️' },
};

function getTagDisplay(tag) {
  if (TAG_META[tag]) return TAG_META[tag];
  // Custom tags: title-case the slug
  const label = tag
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { label, emoji: '🏷️' };
}

// ─── Tag Pill Component ───────────────────────────────────────────────────────
const TagPill = ({ tag, active, onClick, small = false }) => {
  const { label, emoji } = getTagDisplay(tag);
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold transition-all select-none
        ${small ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1.5 text-sm'}
        ${active
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
          : 'bg-slate-800 text-gray-400 border border-purple-500/20 hover:border-purple-500/60 hover:text-gray-200'
        }
      `}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
};

// ─── Email Card Component ─────────────────────────────────────────────────────
const EmailCard = ({ email }) => {
  const allTags = [...(email.audienceTags || []), ...(email.customTags || [])];

  return (
    <article className="
      group bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl
      hover:border-purple-500/70 hover:shadow-lg hover:shadow-purple-500/10
      transition-all duration-300 overflow-hidden
    ">
      {/* Top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white leading-snug group-hover:text-purple-200 transition-colors">
              {email.subject}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-400">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <time dateTime={email.sentAt}>
                {new Date(email.sentAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </div>

          {email.mailerliteUrl && (
            <a
              href={email.mailerliteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                bg-gradient-to-r from-purple-600 to-pink-600 text-white
                hover:from-purple-700 hover:to-pink-700
                transition-all duration-200 shadow-md hover:shadow-purple-500/30
              "
              aria-label={`Read full email: ${email.subject}`}
            >
              <span>View Email</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Preview text */}
        {email.previewText && (
          <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
            {email.previewText}
          </p>
        )}

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {allTags.map(tag => (
              <TagPill key={tag} tag={tag} active={false} small onClick={() => {}} />
            ))}
          </div>
        )}

        {/* Highlighted links */}
        {email.highlightedLinks && email.highlightedLinks.length > 0 && (
          <div className="border-t border-slate-700/50 pt-4 mt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Key Links from this Email
            </p>
            <ul className="space-y-1.5">
              {email.highlightedLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex items-center gap-2 text-sm text-purple-400
                      hover:text-purple-300 transition-colors
                    "
                  >
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const NewsletterArchive = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);

  useEffect(() => {
    sanityClient
      .fetch(NEWSLETTER_QUERY)
      .then(data => {
        setEmails(data || []);
      })
      .catch(err => {
        console.error('Failed to load newsletter archive:', err);
        setError('Unable to load the newsletter archive. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Build sorted unique tag list from all emails
  const allTags = useMemo(() => {
    const tagSet = new Set();
    emails.forEach(email => {
      (email.audienceTags || []).forEach(t => tagSet.add(t));
      (email.customTags || []).forEach(t => tagSet.add(t));
    });

    // Sort: known tags first (in TAG_META order), then custom tags alphabetically
    const knownOrder = Object.keys(TAG_META);
    return Array.from(tagSet).sort((a, b) => {
      const ai = knownOrder.indexOf(a);
      const bi = knownOrder.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [emails]);

  // Filter logic
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      // Search filter
      const haystack = [
        email.subject,
        email.previewText || '',
        ...(email.audienceTags || []),
        ...(email.customTags || []),
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !searchTerm || haystack.includes(searchTerm.toLowerCase());

      // Tag filter: email must include ALL active tags
      const emailTags = new Set([
        ...(email.audienceTags || []),
        ...(email.customTags || []),
      ]);
      const matchesTags = activeTags.every(t => emailTags.has(t));

      return matchesSearch && matchesTags;
    });
  }, [emails, searchTerm, activeTags]);

  const toggleTag = tag => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveTags([]);
  };

  const hasFilters = searchTerm || activeTags.length > 0;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <Mail className="w-12 h-12 text-purple-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Newsletter Archive
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Missed an email? Every newsletter we've sent is right here.
          Search, filter by topic, and view any email you may have missed or deleted.
        </p>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="text-center text-purple-400 py-16">
          <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Loading newsletter archive…</p>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 text-center text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Search + Filter Panel ─────────────────────────────────────── */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 space-y-5">

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search emails by subject or content…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="
                  w-full pl-12 pr-4 py-3 bg-slate-900 border border-purple-500/30 rounded-lg
                  text-white placeholder-gray-400
                  focus:outline-none focus:border-purple-500
                  transition-colors
                "
              />
            </div>

            {/* Tag filters */}
            {allTags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Filter by Topic
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <TagPill
                      key={tag}
                      tag={tag}
                      active={activeTags.includes(tag)}
                      onClick={() => toggleTag(tag)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Results count + clear */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-sm text-gray-400">
                {hasFilters
                  ? `${filteredEmails.length} of ${emails.length} emails`
                  : `${emails.length} email${emails.length !== 1 ? 's' : ''} in archive`}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* ── Email Grid ───────────────────────────────────────────────────── */}
          {filteredEmails.length === 0 && emails.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-lg mb-2">No emails match your filters.</p>
              <button
                onClick={clearFilters}
                className="text-purple-400 hover:text-purple-300 text-sm underline underline-offset-2"
              >
                Clear filters
              </button>
            </div>
          )}

          {emails.length === 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
              <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Emails Yet</h3>
              <p className="text-gray-400 mb-6">
                We haven't added any newsletter emails to the archive yet. Check back soon!
              </p>
              <a
                href="/contact"
                className="
                  inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
                  rounded-lg text-white font-semibold
                  hover:from-purple-700 hover:to-pink-700 transition-all
                "
              >
                Sign Up for Emails
              </a>
            </div>
          )}

          {filteredEmails.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredEmails.map(email => (
                <EmailCard key={email._id} email={email} />
              ))}
            </div>
          )}

          {/* ── Subscribe CTA ────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 text-center">
            <Mail className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Never Miss an Update
            </h3>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              Subscribe to our newsletter and get Idaho Esports news,
              tournament announcements, and opportunities delivered to your inbox.
            </p>
            <a
              href="/"
              className="
                inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600
                rounded-lg text-white font-semibold
                hover:from-purple-700 hover:to-pink-700 transition-all
              "
            >
              Subscribe on the Home Page
            </a>
          </div>
        </>
      )}
    </div>
  );
};

/*
──────────────────────────────────────────────────────────────────────────────
SETUP INSTRUCTIONS
──────────────────────────────────────────────────────────────────────────────

4. OPTIONAL: Move the query to sanity.js
   If you prefer, add to the queries object in src/services/sanity.js:

     getNewsletterEmails: () =>
       sanityClient.fetch(`
         *[_type == "newsletterEmail" && published == true] | order(sentAt desc) {
           _id,
           subject,
           "slug": slug.current,
           sentAt,
           previewText,
           mailerliteUrl,
           audienceTags,
           customTags,
           highlightedLinks[] { label, url }
         }
       `),

   Then in NewsletterArchive.jsx replace the sanityClient.fetch call with:
     queries.getNewsletterEmails()

──────────────────────────────────────────────────────────────────────────────
HOW TO ADD A NEW EMAIL IN SANITY STUDIO
──────────────────────────────────────────────────────────────────────────────

1. Log in to your Sanity Studio (usually manage.sanity.io or your studio URL)
2. Click "Newsletter Emails" in the left sidebar
3. Click the "+" button to create a new document
4. Fill in:
   - Email Subject Line (required)
   - Date Sent (required)
   - Preview / Summary  ← what readers see on the archive page
   - MailerLite Web View URL  ← paste the "View in browser" link from MailerLite
   - Audience Tags  ← check all that apply
   - Custom Tags  ← type any extra tags and press Enter
   - Key Links  ← optional shortcut links from the email
5. Make sure "Show on Website" is toggled ON
6. Click Publish

──────────────────────────────────────────────────────────────────────────────
*/
