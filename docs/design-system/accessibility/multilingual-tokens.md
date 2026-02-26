# Multilingual Design Token Naming

> Locale-specific overrides for fonts, line-height, and character sets

## Locale-Specific Token Overrides

```css
/* lib/design-system/tokens/locale-overrides.css */

/* Default (Latin scripts) */
:root {
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --line-height-body: 1.5;
  --line-height-heading: 1.1;
  --letter-spacing-heading: -0.02em;
}

/* Arabic */
[lang="ar"] {
  --font-heading: 'Noto Sans Arabic', 'Segoe UI', sans-serif;
  --font-body: 'Noto Sans Arabic', 'Segoe UI', sans-serif;
  --line-height-body: 1.8;          /* Arabic needs more line height */
  --line-height-heading: 1.3;
  --letter-spacing-heading: 0;      /* No negative tracking for Arabic */
}

/* Hebrew */
[lang="he"] {
  --font-heading: 'Noto Sans Hebrew', 'Segoe UI', sans-serif;
  --font-body: 'Noto Sans Hebrew', 'Segoe UI', sans-serif;
  --line-height-body: 1.7;
  --line-height-heading: 1.2;
  --letter-spacing-heading: 0;
}

/* Japanese */
[lang="ja"] {
  --font-heading: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
  --font-body: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
  --line-height-body: 1.8;          /* CJK needs extra line height */
  --line-height-heading: 1.3;
  --letter-spacing-heading: 0.05em; /* CJK benefits from slight tracking */
}

/* Korean */
[lang="ko"] {
  --font-heading: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  --font-body: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  --line-height-body: 1.8;
  --line-height-heading: 1.3;
  --letter-spacing-heading: 0;
}

/* Chinese (Simplified) */
[lang="zh-CN"] {
  --font-heading: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  --line-height-body: 1.8;
  --line-height-heading: 1.3;
  --letter-spacing-heading: 0.05em;
}
```

## Font Stack Per Language

| Language Group | Primary Font | Fallback | System Fallback |
|---------------|-------------|----------|-----------------|
| Latin (EN, NL, DE, FR) | Space Grotesk / Inter | - | system-ui |
| Arabic (AR) | Noto Sans Arabic | Segoe UI | sans-serif |
| Hebrew (HE) | Noto Sans Hebrew | Segoe UI | sans-serif |
| Japanese (JA) | Noto Sans JP | Hiragino Sans | sans-serif |
| Korean (KO) | Noto Sans KR | Malgun Gothic | sans-serif |
| Chinese (ZH) | Noto Sans SC/TC | Microsoft YaHei | sans-serif |
| Thai (TH) | Noto Sans Thai | Tahoma | sans-serif |
| Devanagari (HI) | Noto Sans Devanagari | - | sans-serif |

## Line-Height Adjustments

Different scripts require different line-heights for readability:

| Script | Body Line-Height | Heading Line-Height | Reason |
|--------|-----------------|--------------------|----|
| Latin | 1.5 | 1.1 | Compact ascenders/descenders |
| Arabic | 1.8 | 1.3 | Diacritical marks (tashkeel) above/below |
| Hebrew | 1.7 | 1.2 | Nikkud (vowel points) below |
| CJK | 1.8 | 1.3 | Square character blocks need breathing room |
| Thai | 1.8 | 1.4 | Tall stacking vowels and tone marks |
| Devanagari | 1.7 | 1.3 | Headline bar and descenders |

## Character Set Support

### Unicode Range Coverage

```css
/* Ensure fonts cover required Unicode ranges */

/* Latin Extended (covers most European languages) */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
                 U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074,
                 U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
                 U+FEFF, U+FFFD;
  font-display: swap;
}

/* Latin Extended-A (Turkish, Polish, etc.) */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020,
                 U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F,
                 U+A720-A7FF;
  font-display: swap;
}
```

### Special Characters Checklist

- [ ] Currency symbols: EUR, GBP, JPY, CNY, INR, SAR, ILS
- [ ] Diacritical marks: e, u, n, c, a, o
- [ ] CJK punctuation: different from Latin punctuation
- [ ] Arabic numerals: both Western (0-9) and Eastern Arabic
- [ ] RTL punctuation marks: question mark, quotation marks

## Font Loading Strategy

```typescript
// app/layout.tsx - Multi-language font loading
import { Inter, Space_Grotesk } from 'next/font/google'

// Latin fonts (always loaded)
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

// Locale-specific fonts (loaded on demand)
// These should be loaded conditionally based on detected locale
// using next/font dynamic imports or CSS unicode-range
```
