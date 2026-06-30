import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Home } from "./pages/Home";
import { ExpectingIndex } from "./pages/ExpectingSeries/Index";
import { ExpectingArticle } from "./pages/ExpectingSeries/Article";
import { About } from "./pages/About";
import { Schools } from "./pages/Schools";
import { Rules } from "./pages/Rules";
import { Sponsors } from "./pages/Sponsors";
import { Support } from "./pages/Support";
import { Contact } from "./pages/Contact";
import { CoachHelp } from "./pages/CoachHelp";
import { Games } from "./pages/Games";
import { AnnouncementBanner } from "./components/common/AnnouncementBanner";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { PageTitle } from "./components/common/PageTitle";
import { Schedule } from "./pages/Schedule";
import { Transparency } from "./pages/Transparency";
import { Champions } from "./pages/Champions";
import { NewsletterArchive } from "./pages/NewsletterArchive";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageTitle />
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>
        <Header />
        <AnnouncementBanner />
        <main id="main-content" tabIndex={-1} className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/expecting" element={<ExpectingIndex />} />
            <Route path="/expecting/:id" element={<ExpectingArticle />} />
            <Route path="/about" element={<About />} />
            <Route path="/games" element={<Games />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/support" element={<Support />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/coach-help" element={<CoachHelp />} />
            <Route path="/champions" element={<Champions />} />
            <Route path="/newsletter-archive" element={<NewsletterArchive />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
