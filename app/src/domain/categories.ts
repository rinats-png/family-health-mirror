import { BUILT_IN_BY_KEY } from '../data/categories';
import type { Category, Locale } from './types';

export function categoryLabel(category: Category, locale: Locale): string {
  if (category.customLabel) return category.customLabel;
  if (category.builtInKey) return BUILT_IN_BY_KEY[category.builtInKey]?.label[locale] ?? category.builtInKey;
  return '';
}

/** Öffnet die Felder des Medikamentenprotokolls (reines Protokoll, keine Logik). */
export function isMedicationCategory(category: Category): boolean {
  return !!category.builtInKey && !!BUILT_IN_BY_KEY[category.builtInKey]?.medication;
}

export function visibleCategories(categories: Category[]): Category[] {
  return categories.filter((c) => !c.hidden).sort((a, b) => a.order - b.order);
}

export function categoryById(categories: Category[], id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
