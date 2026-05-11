import Sidebar from '@/components/dashboard/sidebar'
import Navbar from '@/components/dashboard/navbar'
import { ProfileProvider } from '@/context/profile-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProfileProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="print:hidden">
            <Navbar />
          </div>
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProfileProvider>
  )
}
