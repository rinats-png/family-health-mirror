import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { STRINGS, type StringKey } from './strings';
import type { Locale } from '../domain/types';

interface I18n {
  locale: Locale;
  t: (key: StringKey) => string;
}

const I18nContext = createContext<I18n>({ locale: 'de', t: (k) => STRINGS.de[k] });

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<I18n>(
    () => ({
      locale,
      t: (key) => STRINGS[locale][key] ?? STRINGS.de[key] ?? key,
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}

/** Für Module außerhalb der React-Baumstruktur, z. B. den PDF-Export. */
export function translate(locale: Locale, key: StringKey): string {
  return STRINGS[locale][key] ?? STRINGS.de[key] ?? key;
}
