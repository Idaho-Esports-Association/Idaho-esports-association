import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Idaho Esports Association";

// Exact-path titles. Dynamic routes fall back to a prefix match below.
const TITLES = {
  "/": "Home",
  "/expecting": "Getting Started",
  "/about": "About",
  "/games": "Games",
  "/schools": "Schools",
  "/rules": "Rules",
  "/transparency": "Transparency",
  "/sponsors": "Sponsors",
  "/support": "Support Us",
  "/schedule": "Schedule",
  "/contact": "Contact",
  "/coach-help": "Coach Help",
  "/champions": "Champions",
  "/newsletter-archive": "Newsletter Archive",
  "/privacy-policy": "Privacy Policy",
  "/terms-of-service": "Terms of Service",
};

// Prefix titles for dynamic routes (e.g. /expecting/:id).
const PREFIX_TITLES = [{ prefix: "/expecting/", title: "Getting Started" }];

const titleForPath = (pathname) => {
  if (TITLES[pathname]) return TITLES[pathname];
  const match = PREFIX_TITLES.find((p) => pathname.startsWith(p.prefix));
  return match ? match.title : null;
};

export const PageTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageTitle = titleForPath(pathname);
    document.title = pageTitle ? `${pageTitle} | ${SITE_NAME}` : SITE_NAME;
  }, [pathname]);

  return null;
};
