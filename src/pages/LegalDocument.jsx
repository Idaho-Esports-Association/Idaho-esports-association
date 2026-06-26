import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { queries } from "../services/sanity";

const renderBody = (text) => {
  if (!text) return null;
  return text.split("\n\n").map((para, i) => {
    // Bullet list block
    if (para.trim().startsWith("- ")) {
      const items = para
        .split("\n")
        .filter((l) => l.trim().startsWith("- "))
        .map((l) => l.replace(/^- /, ""));
      return (
        <ul key={i} className="list-disc list-inside space-y-1 mb-4 text-gray-300">
          {items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inlineMarkdown(item) }} />
          ))}
        </ul>
      );
    }
    return (
      <p
        key={i}
        className="text-gray-300 mb-4 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: inlineMarkdown(para) }}
      />
    );
  });
};

const inlineMarkdown = (text) =>
  text
    .replace(/\*\*(.+?)\*\*/g, "<strong class=\"text-white\">$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

export const LegalDocument = ({ slug }) => {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    queries
      .getLegalDocument(slug)
      .then((data) => {
        setDoc(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">Document not found</p>
          <p className="text-sm">This document hasn't been published yet.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })
      : null;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">{doc.title}</h1>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            {doc.effectiveDate && (
              <span>Effective: {formatDate(doc.effectiveDate)}</span>
            )}
            {doc.lastUpdated && (
              <span>Last updated: {formatDate(doc.lastUpdated)}</span>
            )}
          </div>
          {doc.intro && (
            <p className="mt-6 text-gray-300 leading-relaxed border-l-4 border-purple-500/50 pl-4">
              {doc.intro}
            </p>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {doc.sections?.map((section, i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-purple-300 mb-4">
                {section.heading}
              </h2>
              {renderBody(section.body)}
            </div>
          ))}
        </div>

        {/* Contact */}
        {doc.contactEmail && (
          <div className="mt-10 text-center text-gray-400 text-sm">
            Questions? Contact us at{" "}
            <a
              href={`mailto:${doc.contactEmail}`}
              className="text-purple-400 hover:text-purple-300"
            >
              {doc.contactEmail}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
