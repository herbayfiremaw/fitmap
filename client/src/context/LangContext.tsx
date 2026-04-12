import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'bg';

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: <T extends { name_en: string; name_bg: string }>(item: T) => string;
  td: <T extends { description_en: string; description_bg: string }>(item: T) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem('lang') as Lang) || 'en',
  );

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'bg' : 'en';
      localStorage.setItem('lang', next);
      return next;
    });
  };

  const t = <T extends { name_en: string; name_bg: string }>(item: T) =>
    lang === 'bg' ? item.name_bg : item.name_en;

  const td = <T extends { description_en: string; description_bg: string }>(item: T) =>
    lang === 'bg' ? item.description_bg : item.description_en;

  return (
    <LangContext.Provider value={{ lang, toggleLang, t, td }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error('useLang must be used within LangProvider');
  return context;
}
