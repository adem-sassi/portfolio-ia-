import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import VisitTracker from "./components/VisitTracker";
import { LangProvider } from "./context/LangContext";
import HomeV4 from "./pages/HomeV4";

// Les pages secondaires ne sont chargées que si on les ouvre
const MaintenancePage = lazy(() => import("./pages/MaintenancePage"));
const Portfolio = lazy(() => import("./pages/OldPortfolio"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CvPage = lazy(() => import("./pages/CvPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const legal = (k) => lazy(() => import("./pages/LegalPages").then((m) => ({ default: m[k] })));
const TermsPage = legal("TermsPage"), PrivacyPage = legal("PrivacyPage"), SecurityPage = legal("SecurityPage"), StatusPage = legal("StatusPage");
const CommunityPage = legal("CommunityPage"), DocsPage = legal("DocsPage"), CookiesPage = legal("CookiesPage"), DoNotSharePage = legal("DoNotSharePage");

// ⚠️ Mettre à false quand le backend est repayé
const MAINTENANCE_MODE = false;

const Wait = () => <div style={{ minHeight: "100vh", background: "#03050A" }} />;

export default function App() {
  if (MAINTENANCE_MODE) return <Suspense fallback={null}><MaintenancePage /></Suspense>;
  return (
    <LangProvider>
      <VisitTracker />
      <Suspense fallback={<Wait />}>
        <Routes>
          <Route path="/" element={<HomeV4 />} />
          <Route path="/v4" element={<HomeV4 />} />
          <Route path="/ancien" element={<Portfolio />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/cv" element={<CvPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/do-not-share" element={<DoNotSharePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Analytics />
      <SpeedInsights />
    </LangProvider>
  );
}
