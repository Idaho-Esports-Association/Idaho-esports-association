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
import { Games } from "./pages/Games";
import { AnnouncementBanner } from "./components/common/AnnouncementBanner";
import { Schedule } from "./pages/Schedule";
import { Transparency } from "./pages/Transparency";
import { Champions } from "./pages/Champions";


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <Header />
        <AnnouncementBanner />
        <main className="flex-grow">
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
            <Route path="/champions" element={<Champions />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
