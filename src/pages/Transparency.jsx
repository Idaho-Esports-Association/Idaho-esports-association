import React, { useEffect, useState } from "react";
import {
  Shield,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Download,
  ExternalLink,
  Mail,
  Linkedin,
} from "lucide-react";
import { queries, urlFor } from "../services/sanity";

export const Transparency = () => {
  const [boardMembers, setBoardMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [nonprofitInfo, setNonprofitInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("board");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [board, agendas, reports, info] = await Promise.all([
          queries.getBoardMembers(),
          queries.getMeetingAgendas(),
          queries.getFinancialReports(),
          queries.getNonprofitInfo(),
        ]);

        setBoardMembers(board);
        setMeetings(agendas);
        setFinancials(reports);
        setNonprofitInfo(info);
      } catch (error) {
        console.error("Failed to load transparency data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const tabs = [
    { id: "board", label: "Board of Directors", icon: Users },
    { id: "meetings", label: "Meeting Minutes", icon: Calendar },
    { id: "financials", label: "Financial Reports", icon: DollarSign },
    { id: "documents", label: "Governing Documents", icon: FileText },
  ];

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Shield className="w-12 h-12 text-purple-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Transparency & Governance
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          As a 501(c)(3) non-profit organization, we're committed to
          transparency and accountability in all aspects of our operations.
        </p>
      </div>

      {/* Non-Profit Overview */}
      {nonprofitInfo && (
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Organization Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="text-purple-300 font-semibold mb-2">Legal Name</h3>
              <p>{nonprofitInfo.legalName}</p>
            </div>
            {nonprofitInfo.ein && (
              <div>
                <h3 className="text-purple-300 font-semibold mb-2">
                  EIN (Tax ID)
                </h3>
                <p>{nonprofitInfo.ein}</p>
              </div>
            )}
            {nonprofitInfo.incorporationDate && (
              <div>
                <h3 className="text-purple-300 font-semibold mb-2">
                  Date of Incorporation
                </h3>
                <p>
                  {new Date(nonprofitInfo.incorporationDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            )}
            {nonprofitInfo.taxExemptStatus && (
              <div>
                <h3 className="text-purple-300 font-semibold mb-2">
                  501(c)(3) Status
                </h3>
                <p className="capitalize">{nonprofitInfo.taxExemptStatus}</p>
              </div>
            )}
            {nonprofitInfo.registeredAddress && (
              <div className="md:col-span-2">
                <h3 className="text-purple-300 font-semibold mb-2">
                  Registered Address
                </h3>
                <p className="whitespace-pre-line">
                  {nonprofitInfo.registeredAddress}
                </p>
              </div>
            )}
            {nonprofitInfo.missionStatement && (
              <div className="md:col-span-2">
                <h3 className="text-purple-300 font-semibold mb-2">
                  Mission Statement
                </h3>
                <p className="text-lg italic">
                  {nonprofitInfo.missionStatement}
                </p>
              </div>
            )}
          </div>

          {/* Third-Party Verification */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Third-Party Verification
            </h2>
            <p className="text-gray-300 text-center mb-6">
              Our organization has been verified and recognized by independent
              watchdog organizations for transparency and accountability.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* GuideStar Seal */}
              <div className="text-center">
                <a
                  href="https://app.candid.org/profile/15079270/idaho-esports-association-93-2128403/?pkId=dbdcfbf4-f040-410f-814a-f3ec72eaa509"
                  target="_blank"
                >
                  <img src="https://widgets.guidestar.org/prod/v1/pdp/transparency-seal/15079270/svg" />{" "}
                </a>
                <p className="text-sm text-gray-400 mt-3">
                  GuideStar/Candid
                  <br />
                  Seal of Transparency
                </p>
              </div>

              {/* Info about what this means */}
              <div className="flex-1 max-w-md">
                <div className="bg-slate-900/50 rounded-lg p-6 border border-purple-500/20">
                  <h3 className="text-lg font-bold text-white mb-3">
                    What This Means
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 mt-1">✓</span>
                      <span>Verified 501(c)(3) non-profit status</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 mt-1">✓</span>
                      <span>Publicly shared financial information</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 mt-1">✓</span>
                      <span>Meets transparency standards</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 mt-1">✓</span>
                      <span>Independent third-party verification</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {(nonprofitInfo.guidestarURL || nonprofitInfo.annualReportURL) && (
            <div className="mt-6 pt-6 border-t border-purple-500/30 flex flex-wrap gap-4">
              {nonprofitInfo.guidestarURL && (
                <a
                  href={nonprofitInfo.guidestarURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View GuideStar Profile</span>
                </a>
              )}
              {nonprofitInfo.annualReportURL && (
                <a
                  href={nonprofitInfo.annualReportURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors border border-purple-500/50"
                >
                  <FileText className="w-4 h-4" />
                  <span>Latest Annual Report</span>
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl overflow-hidden">
        <div className="border-b border-purple-500/30">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white border-b-2 border-purple-400"
                    : "text-gray-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-purple-400 py-12">Loading...</div>
          ) : (
            <>
              {/* Board Members Tab */}
              {activeTab === "board" && (
                <div className="space-y-6">
                  <p className="text-gray-300">
                    Our Board of Directors provides strategic guidance and
                    oversight to ensure Idaho Esports Association fulfills its
                    mission while maintaining the highest standards of
                    governance.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    {boardMembers.map((member) => (
                      <div
                        key={member._id}
                        className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-cyan-500 flex-shrink-0">
                            {member.photo ? (
                              <img
                                src={urlFor(member.photo)
                                  .width(80)
                                  .height(80)
                                  .url()}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                                {member.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white">
                              {member.name}
                            </h3>
                            <p className="text-purple-400 font-semibold">
                              {member.position}
                            </p>
                            {member.termStart && (
                              <p className="text-sm text-gray-500 mt-1">
                                Term: {new Date(member.termStart).getFullYear()}{" "}
                                -{" "}
                                {member.termEnd
                                  ? new Date(member.termEnd).getFullYear()
                                  : "Present"}
                              </p>
                            )}
                          </div>
                        </div>
                        {member.bio && (
                          <p className="text-gray-300 mt-4 text-sm">
                            {member.bio}
                          </p>
                        )}
                        <div className="mt-4 flex gap-3">
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="inline-flex items-center space-x-1 text-sm text-purple-400 hover:text-purple-300"
                            >
                              <Mail className="w-4 h-4" />
                              <span>Email</span>
                            </a>
                          )}
                          {member.linkedIn && (
                            <a
                              href={member.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-sm text-purple-400 hover:text-purple-300"
                            >
                              <Linkedin className="w-4 h-4" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {boardMembers.length === 0 && (
                    <p className="text-gray-400 text-center py-8">
                      Board member information coming soon.
                    </p>
                  )}
                </div>
              )}

              {/* Meeting Minutes Tab */}
              {activeTab === "meetings" && (
                <div className="space-y-6">
                  <p className="text-gray-300">
                    All board meeting agendas and approved minutes are posted
                    here for public review. We believe in transparent governance
                    and welcome community input.
                  </p>
                  <div className="space-y-4">
                    {meetings.map((meeting) => (
                      <div
                        key={meeting._id}
                        className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {meeting.title}
                            </h3>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(meeting.meetingDate).toLocaleString(
                                    "en-US",
                                    {
                                      dateStyle: "long",
                                      timeStyle: "short",
                                    }
                                  )}
                                </span>
                              </span>
                              {meeting.location && (
                                <span>• {meeting.location}</span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              meeting.status === "upcoming"
                                ? "bg-blue-900/50 text-blue-300"
                                : meeting.status === "completed"
                                ? "bg-green-900/50 text-green-300"
                                : meeting.status === "cancelled"
                                ? "bg-red-900/50 text-red-300"
                                : "bg-purple-900/50 text-purple-300"
                            }`}
                          >
                            {meeting.status}
                          </span>
                        </div>

                        {meeting.publicAccess &&
                          meeting.publicJoinInfo &&
                          meeting.status === "upcoming" && (
                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4">
                              <p className="text-purple-300 font-semibold mb-2">
                                Public Meeting - Join Information:
                              </p>
                              <p className="text-gray-300 text-sm whitespace-pre-line">
                                {meeting.publicJoinInfo}
                              </p>
                            </div>
                          )}

                        <div className="flex flex-wrap gap-3">
                          {meeting.agendaPDF && (
                            <a
                              href={meeting.agendaPDF}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Agenda</span>
                            </a>
                          )}
                          {meeting.minutesPDF && (
                            <a
                              href={meeting.minutesPDF}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors border border-purple-500/50"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Minutes</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {meetings.length === 0 && (
                    <p className="text-gray-400 text-center py-8">
                      Meeting agendas and minutes coming soon.
                    </p>
                  )}
                </div>
              )}

              {/* Financial Reports Tab */}
              {activeTab === "financials" && (
                <div className="space-y-6">
                  <p className="text-gray-300">
                    Financial transparency is a cornerstone of our organization.
                    Below you'll find our annual reports, Form 990s, and
                    quarterly financial summaries.
                  </p>
                  <div className="space-y-4">
                    {financials.map((report) => (
                      <div
                        key={report._id}
                        className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {report.title}
                            </h3>
                            <p className="text-purple-400 text-sm mt-1 capitalize">
                              {report.reportType} • {report.fiscalYear}{" "}
                              {report.fiscalPeriod || ""}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(report.reportDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                              }
                            )}
                          </span>
                        </div>

                        {report.summary && (
                          <p className="text-gray-300 mb-4">{report.summary}</p>
                        )}

                        {(report.totalRevenue || report.totalExpenses) && (
                          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-800/50 rounded-lg">
                            {report.totalRevenue !== null && (
                              <div>
                                <p className="text-gray-400 text-sm">
                                  Total Revenue
                                </p>
                                <p className="text-2xl font-bold text-green-400">
                                  ${report.totalRevenue.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {report.totalExpenses !== null && (
                              <div>
                                <p className="text-gray-400 text-sm">
                                  Total Expenses
                                </p>
                                <p className="text-2xl font-bold text-orange-400">
                                  ${report.totalExpenses.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {report.highlights && report.highlights.length > 0 && (
                          <div className="mb-4">
                            <p className="text-purple-300 font-semibold mb-2">
                              Key Highlights:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                              {report.highlights.map((highlight, idx) => (
                                <li key={idx}>{highlight}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {report.reportPDF && (
                          <a
                            href={report.reportPDF}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Full Report</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                  {financials.length === 0 && (
                    <p className="text-gray-400 text-center py-8">
                      Financial reports will be published here annually.
                    </p>
                  )}
                </div>
              )}

              {/* Governing Documents Tab */}
              {activeTab === "documents" && nonprofitInfo && (
                <div className="space-y-6">
                  <p className="text-gray-300">
                    Our governing documents outline how Idaho Esports
                    Association operates, makes decisions, and maintains
                    accountability to our community and stakeholders.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {nonprofitInfo.bylawsPDF && (
                      <a
                        href={nonprofitInfo.bylawsPDF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          <FileText className="w-8 h-8 text-purple-400 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">
                              Organization Bylaws
                            </h3>
                            <p className="text-gray-400 text-sm mb-3">
                              Rules and procedures for organizational governance
                            </p>
                            <span className="inline-flex items-center space-x-1 text-purple-400 text-sm">
                              <Download className="w-4 h-4" />
                              <span>Download PDF</span>
                            </span>
                          </div>
                        </div>
                      </a>
                    )}

                    {nonprofitInfo.articlesOfIncorporation && (
                      <a
                        href={nonprofitInfo.articlesOfIncorporation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          <FileText className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">
                              Articles of Incorporation
                            </h3>
                            <p className="text-gray-400 text-sm mb-3">
                              Official formation documents filed with the state
                            </p>
                            <span className="inline-flex items-center space-x-1 text-cyan-400 text-sm">
                              <Download className="w-4 h-4" />
                              <span>Download PDF</span>
                            </span>
                          </div>
                        </div>
                      </a>
                    )}

                    {nonprofitInfo.conflictOfInterestPolicy && (
                      <a
                        href={nonprofitInfo.conflictOfInterestPolicy}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          <Shield className="w-8 h-8 text-pink-400 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">
                              Conflict of Interest Policy
                            </h3>
                            <p className="text-gray-400 text-sm mb-3">
                              Guidelines for ethical decision-making and
                              transparency
                            </p>
                            <span className="inline-flex items-center space-x-1 text-pink-400 text-sm">
                              <Download className="w-4 h-4" />
                              <span>Download PDF</span>
                            </span>
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                  {!nonprofitInfo.bylawsPDF &&
                    !nonprofitInfo.articlesOfIncorporation &&
                    !nonprofitInfo.conflictOfInterestPolicy && (
                      <p className="text-gray-400 text-center py-8">
                        Governing documents will be published here soon.
                      </p>
                    )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">
          Questions About Our Organization?
        </h3>
        <p className="text-gray-300 mb-6">
          We welcome questions about our governance, finances, or operations.
          Transparency and accountability are core values of Idaho Esports
          Association.
        </p>
        <a
          href="/contact"
          className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
};
