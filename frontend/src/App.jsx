import { Analytics } from "@vercel/analytics/react";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import AIFeatures from "./components/AIFeatures";
import Projects from "./components/Projects";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ParticleBackground from "./components/ParticleBackground";
import LoadingScreen from "./components/LoadingScreen";
import ScrollProgress from "./components/ScrollProgress";
import SpotlightEffect from "./components/SpotlightEffect";
import FloatingActions from "./components/FloatingActions";
import AdminPage from "./pages/AdminPage";

function Portfolio() {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) return <LoadingScreen onDone={() => setLoaded(true)}/>;

  return (
    <>
      <ScrollProgress/>
      <SpotlightEffect/>
      <ParticleBackground/>
      <Navbar/>
      <main>
        <Hero/>
        <About/>
        <Skills/>
        <AIFeatures/>
        <Projects/>
        <Testimonials/>
        <Contact/>
      </main>
      <Footer/>
      <FloatingActions/>
    </>
  );
}

export default function App() {
// Charger le thème depuis MongoDB
useEffect(() => {
  fetch("https://web-production-cba0c.up.railway.app/api/content/theme")
    .then(r => r.json())
    .then(theme => {
      if (!theme) return;
      const root = document.documentElement;
      if (theme.neuralBlue) root.style.setProperty("--neural-blue", theme.neuralBlue);
      if (theme.neuralViolet) root.style.setProperty("--neural-violet", theme.neuralViolet);
      if (theme.neuralPink) root.style.setProperty("--neural-pink", theme.neuralPink);
      if (theme.neuralGreen) root.style.setProperty("--neural-green", theme.neuralGreen);
      if (theme.starWhite) root.style.setProperty("--star-white", theme.starWhite);
      if (theme.void) root.style.setProperty("--void", theme.void);
    }).catch(() => {});
}, []);

  return (
    <Routes>
      <Route path="/" element={<Portfolio/>}/>
      <Route path="/admin" element={<AdminPage/>}/>
    </Routes>
  );
}
