# Cultural Adaptation Guidelines

> Color symbolism, imagery, iconography, and tone per culture

## Color Symbolism

Colors carry different meanings across cultures. The design system must account for these differences:

| Color | Western | East Asian | Middle Eastern | South Asian |
|-------|---------|------------|----------------|-------------|
| **Red** | Danger, stop, love | Luck, prosperity | Danger, caution | Purity, fertility |
| **White** | Purity, clean | Mourning, death | Purity, peace | Peace, mourning |
| **Black** | Elegance, death | Power, mystery | Death, evil | Evil, rebellion |
| **Green** | Nature, go, money | Youth, nature | Islam, paradise | Harvest, fertility |
| **Blue** | Trust, calm | Immortality | Protection | Krishna, heaven |
| **Yellow** | Caution, happiness | Imperial, sacred | Mourning (Egypt) | Sacred, commerce |
| **Purple** | Royalty, luxury | Grief (Thailand) | Nobility | Wealth, royalty |

### Design System Implications

1. **Never rely solely on color** for meaning (use icons + text)
2. **Use semantic token names** (`success`, `error`) not color names (`red`, `green`)
3. **Allow brand overrides** for culturally sensitive colors
4. **Document rationale** when using culturally loaded colors

## Imagery Guidelines

### Sensitive Content Rules

| Category | Guideline | Enforcement |
|----------|-----------|-------------|
| **People** | Diverse representation in stock photos | Manual review |
| **Hands** | Show both left and right hand versions | Design checklist |
| **Gestures** | Avoid thumbs-up, OK sign (offensive in some cultures) | Icon review |
| **Animals** | Dogs may be offensive in some cultures | Context-aware |
| **Food** | No pork/alcohol imagery without cultural context | Content review |
| **Religious** | Avoid religious symbols unless contextually appropriate | Legal review |

### Image Selection Checklist

- [ ] Represents diverse ages, ethnicities, abilities
- [ ] No culturally offensive gestures or symbols
- [ ] Appropriate for all target markets
- [ ] Alt text describes content accurately
- [ ] No stereotypical representations

## Iconography Cultural Meanings

| Icon | Intended Meaning | Cultural Risk | Alternative |
|------|-----------------|---------------|-------------|
| Mailbox | Email/inbox | US-specific shape | Envelope icon |
| Thumbs up | Approval | Offensive in Middle East | Checkmark |
| OK hand | Confirmation | Offensive in Brazil, Turkey | Checkmark |
| Owl | Wisdom | Bad omen in some Asian cultures | Book/lightbulb |
| Calendar | Scheduling | Gregorian-centric | Clock + calendar |
| Piggy bank | Savings | Offensive in Muslim cultures | Safe/vault |

### Safe Universal Icons

These icons have consistent meaning across cultures:

- Magnifying glass (search)
- House (home)
- Gear/cog (settings)
- Plus/minus (add/remove)
- X/cross (close)
- Arrow (navigation)
- Globe (international)
- Lock (security)

## Tone of Voice Per Locale

| Aspect | English (US) | Dutch (NL) | German (DE) | Arabic (AR) |
|--------|-------------|------------|-------------|-------------|
| Formality | Casual-professional | Direct-informal | Formal-precise | Formal-respectful |
| Pronouns | You (informal) | Je/u (context) | Sie (formal) | Context-dependent |
| Humor | Light, occasional | Direct, dry | Minimal in business | Conservative |
| Directness | Moderate | Very direct | Direct, thorough | Indirect, diplomatic |
| Sentence length | Short-medium | Short | Long, detailed | Flowing, elaborate |

### Writing Guidelines Per Market

```markdown
## English (US)
- Use short, active sentences
- Contractions OK (don't, can't)
- Informal tone for UI, formal for legal

## Dutch (NL)
- Direct and to the point
- Use "je" for friendly, "u" for formal contexts
- Avoid anglicisms where Dutch alternatives exist

## German (DE)
- Formal "Sie" in all user-facing text
- Complete sentences, no fragments
- Technical precision valued

## Arabic (AR)
- Formal register for business communications
- Right-to-left text direction
- Religious/cultural sensitivities in word choice
```

## Implementation Checklist

- [ ] Color system uses semantic names, not color names
- [ ] All color meanings documented with cultural notes
- [ ] Image library reviewed for cultural sensitivity
- [ ] Icon set uses universal metaphors
- [ ] Tone of voice guidelines per supported locale
- [ ] Content review process includes cultural check
- [ ] User testing includes diverse cultural backgrounds
