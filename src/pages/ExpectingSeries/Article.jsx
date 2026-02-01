import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Download } from "lucide-react";
import { queries, urlFor } from "../../services/sanity";

// Portable Text renderer for Sanity rich text
const PortableTextRenderer = ({ content }) => {
  if (!content) return null;

  return content.map((block, index) => {
    // Text blocks
    if (block._type === "block") {
      const children = block.children?.map((child, i) => {
        let text = child.text;

        // Apply marks (bold, italic, etc.)
        if (child.marks?.includes("strong")) {
          text = (
            <strong key={i} className="font-bold text-cyan-300">
              {text}
            </strong>
          );
        }
        if (child.marks?.includes("em")) {
          text = <em key={i}>{text}</em>;
        }

        // Handle links
        const link = block.markDefs?.find((def) =>
          child.marks?.includes(def._key),
        );
        if (link) {
          return (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              {text}
            </a>
          );
        }

        return <span key={i}>{text}</span>;
      });

      // Different heading levels
      if (block.style === "h2") {
        return (
          <h2
            key={index}
            className="text-3xl font-bold text-purple-200 mt-8 mb-4"
          >
            {children}
          </h2>
        );
      }
      if (block.style === "h3") {
        return (
          <h3
            key={index}
            className="text-2xl font-bold text-purple-300 mt-6 mb-3"
          >
            {children}
          </h3>
        );
      }
      if (block.style === "blockquote") {
        return (
          <blockquote
            key={index}
            className="border-l-4 border-purple-500 pl-4 italic text-gray-300 my-4"
          >
            {children}
          </blockquote>
        );
      }

      // List items
      if (block.listItem === "bullet") {
        return (
          <li key={index} className="ml-6 mb-2 text-gray-300">
            {children}
          </li>
        );
      }
      if (block.listItem === "number") {
        return (
          <li key={index} className="ml-6 mb-2 text-gray-300 list-decimal">
            {children}
          </li>
        );
      }

      // Normal paragraph
      return (
        <p key={index} className="text-gray-300 mb-4 leading-relaxed">
          {children}
        </p>
      );
    }

    // Images
    if (block._type === "image") {
      return (
        <div key={index} className="my-8">
          <img
            src={urlFor(block).width(800).url()}
            alt={block.alt || ""}
            className="rounded-lg w-full"
          />
          {block.alt && (
            <p className="text-sm text-gray-500 mt-2 text-center italic">
              {block.alt}
            </p>
          )}
        </div>
      );
    }

    return null;
  });
};

export const ExpectingArticle = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const data = await queries.getExpectingArticle(id);
        if (!data) {
          setError("Article not found");
        } else {
          setArticle(data);
        }
      } catch (err) {
        setError("Failed to load article");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-purple-400 py-12">
          Loading article...
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-12 text-center">
          <p className="text-red-300 mb-6">{error || "Article not found"}</p>
          <Link
            to="/expecting"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Back Button */}
      <Link
        to="/expecting"
        className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to All Articles</span>
      </Link>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="inline-block px-3 py-1 bg-purple-900/50 border border-purple-500/50 rounded-full text-purple-300 text-sm font-semibold">
          {article.category}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-gray-400">
          {article.author && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
          )}
          {article.publishedAt && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 md:p-12">
        <div className="prose prose-lg prose-invert max-w-none">
          <PortableTextRenderer content={article.content} />
        </div>
      </div>

      {/* Downloadable Resources */}
      {article.downloadableResources &&
        article.downloadableResources.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Download className="w-5 h-5 text-purple-400" />
              <span>Downloadable Resources</span>
            </h3>
            <div className="space-y-3">
              {article.downloadableResources.map((resource, index) => (
                <a
                  key={index}
                  href={
                    resource.assetUrl ||
                    (resource.asset && resource.asset.url) ||
                    "#"
                  }
                  download
                  className="block px-4 py-3 bg-slate-900 border border-purple-500/30 rounded-lg hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">
                      {resource.title || "Download"}
                    </span>
                    <Download className="w-5 h-5 text-purple-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      {/* Help Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">
          Still Have Questions?
        </h3>
        <p className="text-gray-300 mb-6">
          We're here to help! Reach out to us directly or join our community for
          more support.
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
            className="px-6 py-3 bg-slate-700 rounded-lg text-white font-semibold hover:bg-slate-600 transition-all border border-purple-500/50"
          >
            Join Discord
          </a>
        </div>
      </div>

      {/* Navigate to Next Article */}
      <div className="border-t border-purple-500/30 pt-8">
        <Link
          to="/expecting"
          className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>View All Articles</span>
        </Link>
      </div>
    </div>
  );
};
