# Invoice Template - Roosevelt

> **Instructions:** Fill in all [bracketed] fields. Export to PDF for client delivery.

---

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [ROOSEVELT LOGO]                                              │
│                                                                │
│  ROOSEVELT                                          INVOICE    │
│  AI Strategy & Digital Product Development                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Invoice Details

| Field | Value |
|-------|-------|
| **Invoice Number** | INV-[YYYY]-[NNN] |
| **Invoice Date** | [DD Month YYYY] |
| **Due Date** | [DD Month YYYY] (Net 30) |
| **Project** | [Project Name] |

---

## Bill To

**[Client Company Name]**
[Contact Person Name]
[Address Line 1]
[Address Line 2]
[City, Postal Code]
[Country]

**Email:** [client@email.com]
**VAT Number:** [VAT-NL-XXXXXXXXX] (if applicable)

---

## From

**Roosevelt**
Sam Swaab
Amsterdam, Netherlands

**Email:** sam@rooseveltops.com
**Website:** rooseveltops.com
**KVK:** [Chamber of Commerce Number]
**VAT:** [NL-VAT-Number] (if applicable)

---

## Services Rendered

| Description | Quantity | Rate (€) | Amount (€) |
|-------------|----------|----------|------------|
| [Service description line 1] | [X hours/units] | [€XXX.00] | [€XXX.00] |
| [Service description line 2] | [X hours/units] | [€XXX.00] | [€XXX.00] |
| [Service description line 3] | [X hours/units] | [€XXX.00] | [€XXX.00] |
| | | | |
| | | | |

---

## Totals

| | Amount (€) |
|---|------------|
| **Subtotal** | €[XXX.00] |
| **VAT (21%)** | €[XXX.00] |
| **Total Due** | **€[XXX.00]** |

---

## Payment Terms

**Payment Due:** [DD Month YYYY] (Net 30 days)

**Payment Methods:**
- **Bank Transfer (Preferred)**
  - Bank: [Bank Name]
  - IBAN: [NL00 BANK 0000 0000 00]
  - BIC/SWIFT: [BANKXXX]
  - Account Holder: Roosevelt / Sam Swaab
  - Reference: INV-[YYYY]-[NNN]

- **PayPal:** sam@rooseveltops.com (add 3% fee)

**Late Payment:** Interest of 2% per month will be charged on overdue amounts.

---

## Notes

[Any additional notes, project details, or special terms]

---

## Terms & Conditions

1. Payment is due within 30 days of invoice date
2. Late payments incur 2% monthly interest
3. All prices are in EUR (€)
4. VAT is charged where applicable
5. Disputed invoices must be raised within 7 days
6. Ownership of deliverables transfers upon full payment

---

```
┌────────────────────────────────────────────────────────────────┐
│  Thank you for your business!                                  │
│                                                                │
│  Questions? Contact: sam@rooseveltops.com                      │
│  Roosevelt | AI Strategy & Digital Product Development        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Export Instructions

### To DOCX (Editable):
1. Use Pandoc: `pandoc invoice-template.md -o invoice-template.docx`
2. Or open in Word and adjust formatting

### To PDF (Client Copy):
1. Fill in all fields
2. Remove instructions section
3. Print to PDF with A4 paper size
4. File name: `INV-YYYY-NNN-[ClientName].pdf`

### Example Usage

**Filled Example:**
- Invoice Number: INV-2026-001
- Date: 3 February 2026
- Client: Acme Corporation
- Service: "AI Strategy Consulting - 40 hours @ €150/hour = €6,000"
- Subtotal: €6,000
- VAT (21%): €1,260
- Total: €7,260
