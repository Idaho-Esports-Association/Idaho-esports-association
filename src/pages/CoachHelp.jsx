import React, { useState } from "react";
import { Headset, AlertCircle, CheckCircle, Send } from "lucide-react";

export const CoachHelp = () => {
  const [formData, setFormData] = useState({
    coachName: "",
    email: "",
    schoolName: "",
    phone: "",
    requestType: "general-question",
    urgencyLevel: "normal",
    subject: "",
    description: "",
  });
  const [status, setStatus] = useState(""); // idle, sending, success, error

  const requestTypes = [
    { value: "general-question", label: "General Question" },
    { value: "tournament-issue", label: "Tournament Issue" },
    { value: "team-registration", label: "Team Registration Help" },
    { value: "rule-clarification", label: "Rule Clarification" },
    { value: "technical-support", label: "Technical Support" },
    { value: "schedule-conflict", label: "Schedule Conflict" },
    { value: "player-eligibility", label: "Player Eligibility Question" },
    { value: "other", label: "Other" },
  ];

  const urgencyOptions = [
    { value: "low", label: "Low - No Rush" },
    { value: "normal", label: "Normal - Routine" },
    { value: "high", label: "High - Soon" },
    { value: "urgent", label: "Urgent - ASAP" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/.netlify/functions/coach-help-clickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit request");

      setStatus("success");
      setFormData({
        coachName: "",
        email: "",
        schoolName: "",
        phone: "",
        requestType: "general-question",
        urgencyLevel: "normal",
        subject: "",
        description: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus(""), 5000);
    } catch (error) {
      console.error("Coach help form error:", error);
      setStatus("error");
      setTimeout(() => setStatus(""), 5000);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Headset className="w-12 h-12 text-cyan-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Coach Help Request
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Need assistance? Submit a help request and our team will respond
          quickly to support your team and athletes.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-purple-500/30">
              Your Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="coachName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Coach Name *
                </label>
                <input
                  type="text"
                  id="coachName"
                  name="coachName"
                  required
                  value={formData.coachName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="schoolName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  School Name *
                </label>
                <input
                  type="text"
                  id="schoolName"
                  name="schoolName"
                  required
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Your school name"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="(208) 555-0000"
                />
              </div>
            </div>
          </div>

          {/* Request Details Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-purple-500/30">
              Request Details
            </h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="requestType"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Type of Request *
                  </label>
                  <select
                    id="requestType"
                    name="requestType"
                    required
                    value={formData.requestType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    {requestTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="urgencyLevel"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Urgency Level *
                  </label>
                  <select
                    id="urgencyLevel"
                    name="urgencyLevel"
                    required
                    value={formData.urgencyLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    {urgencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Brief summary of your request"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows="8"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  placeholder="Please provide detailed information about your request, including any relevant dates, tournaments, or player names..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {status === "sending" ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Help Request</span>
                </>
              )}
            </button>

            {status === "success" && (
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-300 font-semibold">
                    Request submitted successfully!
                  </p>
                  <p className="text-green-400 text-sm mt-1">
                    Our team will review your request and get back to you within
                    24 hours.
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-semibold">
                    Failed to submit request
                  </p>
                  <p className="text-red-400 text-sm mt-1">
                    Please try again or contact us via Discord or email.
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Info Boxes */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">
            ⚡ Fast Response
          </h3>
          <p className="text-gray-400 text-sm">
            Your requests go directly to our management team with automatic task
            creation in our system.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">
            📋 Stay Updated
          </h3>
          <p className="text-gray-400 text-sm">
            We'll respond to the email address you provide with updates on your
            request.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">
            🎯 Right Team
          </h3>
          <p className="text-gray-400 text-sm">
            Requests are automatically tagged and prioritized to reach the right
            person quickly.
          </p>
        </div>
      </div>

      {/* Alternative Contact */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-300 mb-3">
          Prefer Other Contact Methods?
        </h3>
        <p className="text-gray-300 mb-4">
          We're also available through these channels:
        </p>
        <div className="flex flex-col md:flex-row gap-6 text-sm text-gray-400">
          <div>
            <span className="text-blue-300 font-semibold">Discord:</span>{" "}
            <a
              href="https://discord.gg/REySEYwFEr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Join our Server
            </a>
          </div>
          <div>
            <span className="text-blue-300 font-semibold">Email:</span>{" "}
            <a
              href="mailto:support@idahoesports.gg"
              className="text-cyan-400 hover:text-cyan-300"
            >
              support@idahoesports.gg
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
