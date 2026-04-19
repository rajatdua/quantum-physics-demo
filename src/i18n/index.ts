import da from './da.json';

export const locales = ['da'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'da';

const dictionaries = { da } satisfies Record<Locale, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function t(locale: Locale, key: string, vars: Record<string, string | number> = {}): string {
  const parts = key.split('.');
  let node: unknown = dictionaries[locale];
  for (const part of parts) {
    if (isRecord(node) && part in node) {
      node = node[part];
    } else {
      throw new Error(`i18n key not found: ${key} (locale: ${locale})`);
    }
  }
  if (typeof node !== 'string') {
    throw new Error(`i18n key is not a string: ${key} (locale: ${locale})`);
  }
  return node.replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? ''));
}

export function formatDanishDate(iso: string, locale: Locale = 'da'): string {
  const [y, m, d] = iso.split('-');
  const month = t(locale, `months.${parseInt(m, 10)}`);
  return `${parseInt(d, 10)}. ${month} ${y}`;
}

export function formatDanishMonthYear(iso: string, locale: Locale = 'da'): string {
  const [y, m] = iso.split('-');
  const month = t(locale, `months.${parseInt(m, 10)}`);
  const capitalized = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capitalized} ${y}`;
}
