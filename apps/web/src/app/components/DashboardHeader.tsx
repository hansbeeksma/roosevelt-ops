import { UserButton } from '@clerk/nextjs'
import { OrgSwitcher } from '@/components/OrgSwitcher'

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
      <OrgSwitcher />
      <UserButton afterSignOutUrl="/sign-in" />
    </header>
  )
}
