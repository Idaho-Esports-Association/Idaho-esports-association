import React, { useState } from "react";
import { Mail } from "lucide-react";
import { subscribeToNewsletter } from "../../services/mailerlite";

const PHONE_REGEX = /^\+?[1-9]\d{9,14}$/;

const normalizePhone = (value) => value.replace(/[\s\-().]/g, "");

export const NewsletterSignup = ({ inline = false }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      setStatus("error");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (smsOptIn && !PHONE_REGEX.test(normalizedPhone)) {
      setErrorMessage("Please enter a valid phone number to opt in to SMS.");
      setStatus("error");
      setTimeout(() => setStatus(""), 4000);
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await subscribeToNewsletter(
        email,
        name,
        smsOptIn ? normalizePhone(phone) : null,
        smsOptIn,
      );
      setStatus("success");
      setEmail("");
      setName("");
      setPhone("");
      setSmsOptIn(false);
      setTimeout(() => setStatus(""), 5000);
    } catch (error) {
      console.error("Subscription error:", error);
      setStatus("error");
      setErrorMessage(
        error.message || "Failed to subscribe. Please try again.",
      );
      setTimeout(() => {
        setStatus("");
        setErrorMessage("");
      }, 5000);
    }
  };

  if (inline) {
    return (
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            required
          />
          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
        {status === "success" && (
          <p className="text-green-400 text-sm">✓ Successfully subscribed!</p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm">✗ {errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Mail className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Stay Updated</h3>
      </div>
      <p className="text-gray-400 mb-4">
        Get the latest news, tournament announcements, and Idaho esports
        updates.
      </p>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
          required
        />
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={smsOptIn}
              onChange={(e) => setSmsOptIn(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-purple-500 cursor-pointer flex-shrink-0"
            />
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              I'd like to receive SMS text alerts from Idaho Esports Association
              for tournament updates and announcements.
            </span>
          </label>

          {smsOptIn && (
            <div className="space-y-2 pl-7">
              <input
                type="tel"
                placeholder="Phone number (e.g. 208-555-0100)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 leading-relaxed">
                By checking this box and providing your phone number, you
                consent to receive recurring automated text messages from Idaho
                Esports Association. Message frequency varies. Msg &amp; data
                rates may apply. Reply{" "}
                <strong className="text-gray-400">STOP</strong> to cancel,{" "}
                <strong className="text-gray-400">HELP</strong> for help.
                Consent is not a condition of purchase or participation.
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>

        {status === "success" && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm">
            ✓ Successfully subscribed! Check your email to confirm.
          </div>
        )}
        {status === "error" && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
            ✗ {errorMessage || "Something went wrong. Please try again."}
          </div>
        )}
      </div>
    </div>
  );
};
