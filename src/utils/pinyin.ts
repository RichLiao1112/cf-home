import { pinyin } from 'pinyin-pro';

export function matchSearch(target: string, query: string): boolean {
  if (!query) return true;
  if (!target) return false;

  const t = target.toLowerCase();
  const q = query.toLowerCase().trim();

  // 1. 直匹配
  if (t.includes(q)) return true;

  // 2. 拼音全拼匹配
  try {
    const fullPinyin = pinyin(t, { toneType: 'none', type: 'string' }).replace(/\s+/g, '').toLowerCase();
    if (fullPinyin.includes(q)) return true;

    // 3. 拼音首字母匹配 (例如 "Evan 学英语" -> "exyy")
    const firstLetters = pinyin(t, { pattern: 'first', toneType: 'none', type: 'string' })
      .replace(/\s+/g, '')
      .toLowerCase();
    if (firstLetters.includes(q)) return true;
  } catch {}

  return false;
}
