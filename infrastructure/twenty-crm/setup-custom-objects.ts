#!/usr/bin/env tsx
/**
 * Twenty CRM Custom Objects Setup
 * Gebruik: TWENTY_API_URL=https://crm.roosevelt.dev TWENTY_API_KEY=xxx tsx setup-custom-objects.ts
 */
const API = process.env.TWENTY_API_URL ?? 'http://localhost:3000'
const KEY = process.env.TWENTY_API_KEY ?? ''

async function gql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(`${API}/api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ query, variables }),
  })
  const { data, errors } = (await res.json()) as {
    data?: unknown
    errors?: Array<{ message: string }>
  }
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(', '))
  return data
}

const OBJECTS = [
  {
    nameSingular: 'restaurant',
    namePlural: 'restaurants',
    labelSingular: 'Restaurant',
    labelPlural: 'Restaurants',
    description: 'Restaurants voor catering',
    icon: 'IconBuildingRestaurant',
  },
  {
    nameSingular: 'supplier',
    namePlural: 'suppliers',
    labelSingular: 'Leverancier',
    labelPlural: 'Leveranciers',
    description: 'Leveranciers',
    icon: 'IconTruck',
  },
  {
    nameSingular: 'rooseveltEvent',
    namePlural: 'rooseveltEvents',
    labelSingular: 'Evenement',
    labelPlural: 'Evenementen',
    description: 'Evenementen',
    icon: 'IconCalendarEvent',
  },
  {
    nameSingular: 'menuItem',
    namePlural: 'menuItems',
    labelSingular: 'Menu Item',
    labelPlural: 'Menu Items',
    description: 'Gerechten',
    icon: 'IconToolsKitchen2',
  },
]

const CREATE = `mutation Create($input: CreateOneObjectInput!) { createOneObject(input: $input) { id nameSingular } }`

async function main() {
  if (!KEY) {
    console.error('TWENTY_API_KEY niet ingesteld')
    process.exit(1)
  }
  for (const obj of OBJECTS) {
    try {
      const result = (await gql(CREATE, { input: obj })) as {
        createOneObject: { id: string }
      }
      console.log(`✅ ${obj.labelPlural}: ${result.createOneObject.id}`)
    } catch (e) {
      console.error(`⚠️  ${obj.labelPlural}: ${(e as Error).message}`)
    }
  }
  console.log('\nGa naar Twenty UI → Settings → Data Model om velden te configureren.')
}

main().catch(console.error)
