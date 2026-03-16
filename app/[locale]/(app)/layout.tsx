import { AuthGuard } from '@/components/shared/auth-guard'
import { BottomNav } from '@/components/shared/bottom-nav'
import { LocaleSwitcher } from '@/components/shared/locale-switcher'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex items-center justify-end px-4 py-2 border-b">
        <LocaleSwitcher />
      </div>
      {children}
      <BottomNav />
    </AuthGuard>
  )
}
