# Roosevelt Templates

Professional templates for business operations and client communication.

---

## Available Templates

### Business Templates

| Template | Format | Purpose | Status |
|----------|--------|---------|--------|
| [Letterhead](letterhead-template.md) | Markdown → PDF | Formal communications | ✅ Ready |
| [Invoice](invoice-template.md) | Markdown → DOCX/PDF | Client billing | ✅ Ready |
| [Business Cards](business-card-design.md) | Design specs | Networking | ✅ Ready |

### Communication Templates

| Template | Format | Purpose | Status |
|----------|--------|---------|--------|
| [Email Templates](email-templates.md) | Text | Client emails (8 types) | ✅ Ready |

### Documentation

| Document | Location | Purpose | Status |
|----------|----------|---------|--------|
| [Meeting Notes](../docs/templates/meeting-notes.md) | Markdown | Meeting documentation | ✅ Ready |
| [Status Report](../docs/templates/status-report.md) | Markdown | Weekly updates | ✅ Ready |
| [Project Brief](../docs/templates/project-brief.md) | Markdown | Proposals | ✅ Ready |
| [Technical Spec](../docs/templates/technical-specification.md) | Markdown | Technical docs | ✅ Ready |

---

## Quick Start

### Using Letterhead

1. Open `letterhead-template.md`
2. Replace `[LOGO]` placeholder with actual logo
3. Fill in recipient details
4. Write letter content
5. Export to PDF (A4, 2.5cm margins)

### Using Invoice

1. Open `invoice-template.md`
2. Fill in all `[bracketed]` fields
3. Update service line items
4. Calculate totals
5. Export to DOCX (editable) or PDF (client copy)

### Using Email Templates

1. Open `email-templates.md`
2. Find appropriate template (8 types available)
3. Copy template text
4. Customize `[bracketed]` placeholders
5. Send via email client

---

## Customization Guide

### Adding Brand Assets

**When brand assets are ready (from ROOSE-8, 9, 10):**

1. **Logo:**
   - Replace `[LOGO]` placeholders
   - Use appropriate sizes (see template specs)

2. **Colors:**
   - Update placeholder colors with brand palette
   - Ensure WCAG AA compliance for text

3. **Typography:**
   - Apply brand fonts
   - Maintain hierarchy and readability

### Converting Formats

**Markdown to PDF:**
```bash
# Using Pandoc
pandoc template.md -o output.pdf --pdf-engine=wkhtmltopdf

# Or use online converter
# - Markdown to PDF (markdowntopdf.com)
# - Dillinger.io (with export)
```

**Markdown to DOCX:**
```bash
# Using Pandoc
pandoc template.md -o output.docx

# Or open in Word:
# File → Import → Markdown file
```

---

## Template Status

### Ready for Immediate Use
- ✅ Letterhead (needs logo)
- ✅ Invoice (needs customization)
- ✅ Email templates (ready to copy)
- ✅ Business card specs (needs design execution)

### Pending Brand Assets
- ⏳ Logo integration (waiting on ROOSE-8)
- ⏳ Brand colors (waiting on ROOSE-9)
- ⏳ Typography (waiting on ROOSE-10)

---

## Best Practices

### Document Naming

**Convention:**
```
[type]-[client/project]-[date].[ext]

Examples:
- letterhead-acme-2026-02-03.pdf
- invoice-INV-2026-001-acme.pdf
- proposal-acme-ai-strategy.pdf
```

### Version Control

**Templates:**
- Keep templates in Git
- Version in filename if major changes
- Document changes in commit messages

**Client Documents:**
- Store in project folder: `clients/[name]/documents/`
- Don't commit to Git (client confidential)
- Backup separately

### File Organization

```
clients/
├── acme-corp/
│   ├── documents/
│   │   ├── proposal-2026-01-15.pdf
│   │   ├── invoice-INV-2026-001.pdf
│   │   └── contract-signed.pdf
│   ├── deliverables/
│   └── correspondence/
└── globex-inc/
    └── ...
```

---

## Printing Specifications

### Letterhead
- **Size:** A4 (210x297mm)
- **Margins:** 2.5cm top/bottom, 2cm left/right
- **Paper:** 90-120gsm white bond
- **Color:** Full color or grayscale

### Invoice
- **Size:** A4 (210x297mm)
- **Format:** PDF (email) or printed
- **Archival:** PDF/A for long-term storage

### Business Cards
- **Size:** 85x55mm (standard)
- **Bleed:** 3mm all sides
- **Paper:** 350gsm coated cardstock
- **Finish:** Matte or soft-touch laminate
- **Quantity:** 250-500 cards (standard order)

---

## Support

### Issues or Questions
- **Template bugs:** Open issue in Plane (ROOSE project)
- **Customization help:** See `../docs/brand/guidelines.md` (when available)
- **Brand assets:** Check `../brand-assets/` directory (when populated)

### Future Templates

**Planned additions:**
- Email signature (HTML)
- PowerPoint template
- Social media templates
- Proposal template (branded)
- One-pager (company overview)

---

## Related Documentation

- [Brand Guidelines](../docs/brand/guidelines.md) - Brand usage rules *(pending)*
- [Company Profile](../docs/company/profile.md) - Company information
- [Operations SOPs](../docs/operations/) - Operational procedures
- [Communication Protocols](../docs/operations/communication-protocols.md) - Email best practices

---

*Templates directory created: 2026-02-03*
*Last updated: 2026-02-03*
