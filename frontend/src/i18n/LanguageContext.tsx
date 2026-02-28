import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Language, translations, languageLabels } from "./translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languageLabels: typeof languageLabels;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "en";
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app-language", lang);
  }, []);

  const t = useCallback(
    (key: string) => {
      const trans = translations[language];
      return (trans as any)[key] || (translations.en as any)[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, languageLabels }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
