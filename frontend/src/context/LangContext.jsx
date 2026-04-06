import { createContext, useContext, useState } from "react";

const LangContext = createContext();

export const translations = {
  fr: {
    nav: { about: "À Propos", skills: "Skills", lab: "IA Lab", projects: "Projets", contact: "Contact", blog: "Blog" },
    hero: { greeting: "Bonjour, je suis", cta1: "Voir mes projets", cta2: "IA Lab →", scroll: "SCROLL" },
    contact_btn: "Me contacter",
    available: "Disponible",
    download_cv: "Télécharger mon CV",
  },
  en: {
    nav: { about: "About", skills: "Skills", lab: "AI Lab", projects: "Projects", contact: "Contact", blog: "Blog" },
    hero: { greeting: "Hello, I am", cta1: "View my projects", cta2: "AI Lab →", scroll: "SCROLL" },
    contact_btn: "Contact me",
    available: "Available",
    download_cv: "Download my CV",
  }
};

export function LangProvider({ children }) {
  const [lang, setLang] = useState("fr");
  const t = translations[lang];
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);