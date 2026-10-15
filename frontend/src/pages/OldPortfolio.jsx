import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Skills from "../components/Skills";
import AIFeatures from "../components/AIFeatures";
import Courses from "../components/Courses";
import Projects from "../components/Projects";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import ParticleBackground from "../components/ParticleBackground";
import LoadingScreen from "../components/LoadingScreen";
import ScrollProgress from "../components/ScrollProgress";
import SpotlightEffect from "../components/SpotlightEffect";
import FloatingActions from "../components/FloatingActions";

export default function Portfolio() {
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
          <Courses/>
        <Testimonials/>
        <Contact/>
      </main>
      <Footer/>
      <FloatingActions/>
    </>
  );
}
