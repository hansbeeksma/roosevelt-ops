# Twenty CRM Custom Objects

Vier custom objects voor Roosevelt Operations in Twenty CRM.

## Schema Overzicht

| Object | Enkelvoud | Meervoud | Icoon | Beschrijving |
|--------|-----------|----------|-------|--------------|
| Restaurant | `restaurant` | `restaurants` | `IconBuildingRestaurant` | Restaurants voor catering |
| Leverancier | `supplier` | `suppliers` | `IconTruck` | Leveranciers |
| Evenement | `rooseveltEvent` | `rooseveltEvents` | `IconCalendarEvent` | Evenementen |
| Menu Item | `menuItem` | `menuItems` | `IconToolsKitchen2` | Gerechten |

## Setup

```bash
TWENTY_API_URL=https://crm.roosevelt.dev \
TWENTY_API_KEY=your_key_here \
tsx infrastructure/twenty-crm/setup-custom-objects.ts
```

## Veldschema's

### Restaurant

| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| name | TEXT | Ja | Naam van het restaurant |
| address | TEXT | Nee | Vestigingsadres |
| cuisine | TEXT | Nee | Keukentype |
| contact_email | EMAIL | Nee | Contactpersoon e-mail |
| contact_phone | PHONE | Nee | Telefoonnummer |
| capacity | NUMBER | Nee | Maximale capaciteit |
| active | BOOLEAN | Ja | Actief in assortiment |

### Leverancier (Supplier)

| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| name | TEXT | Ja | Naam van de leverancier |
| category | TEXT | Nee | Categorie (bijv. vlees, groente) |
| contact_email | EMAIL | Nee | Contactpersoon e-mail |
| contact_phone | PHONE | Nee | Telefoonnummer |
| lead_time_days | NUMBER | Nee | Levertijd in dagen |
| preferred | BOOLEAN | Nee | Voorkeursleverancier |

### Evenement (rooseveltEvent)

| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| name | TEXT | Ja | Naam van het evenement |
| event_date | DATE | Nee | Datum van het evenement |
| location | TEXT | Nee | Locatie |
| guest_count | NUMBER | Nee | Aantal gasten |
| status | SELECT | Nee | offertefase / bevestigd / afgerond |
| linked_deal | RELATION | Nee | Gekoppelde deal (Company) |

### Menu Item (menuItem)

| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| name | TEXT | Ja | Naam van het gerecht |
| category | TEXT | Nee | Categorie (starter, main, dessert) |
| description | TEXT | Nee | Omschrijving |
| allergens | TEXT | Nee | Allergenen |
| price | CURRENCY | Nee | Kostprijs |
| active | BOOLEAN | Ja | Actief in menu |

## Verificatie GraphQL Queries

Voer na setup uit in de Twenty GraphQL playground (`/api` endpoint):

### Controleer alle aangemaakte objecten

```graphql
query ListCustomObjects {
  objects {
    edges {
      node {
        id
        nameSingular
        namePlural
        labelSingular
        description
        isCustom
        isActive
      }
    }
  }
}
```

### Controleer specifiek object (bijv. restaurant)

```graphql
query GetRestaurantObject {
  objects(filter: { nameSingular: { eq: "restaurant" } }) {
    edges {
      node {
        id
        nameSingular
        fields {
          edges {
            node {
              id
              name
              type
              isRequired
            }
          }
        }
      }
    }
  }
}
```

### Test data aanmaken (restaurant)

```graphql
mutation CreateTestRestaurant {
  createRestaurant(data: {
    name: "Test Restaurant"
  }) {
    id
    name
  }
}
```

## Handmatige Fallback

Als het script faalt (bijv. door API-versie incompatibiliteit):

1. Open Twenty UI → Settings → Data Model
2. Klik "Add custom object"
3. Voer per object in: nameSingular, labelSingular, icon (zie tabel boven)
4. Voeg velden toe via de field editor

## Referenties

- Twenty API documentatie: `https://crm.roosevelt.dev/api` (GraphQL playground)
- Setup script: `infrastructure/twenty-crm/setup-custom-objects.ts`
- Issue: ROOSE-347
