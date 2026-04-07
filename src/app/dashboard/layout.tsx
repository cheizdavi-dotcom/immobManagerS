import Sidebar from "@/components/Sidebar"
import MobileDragPolyfill from "@/components/MobileDragPolyfill"
import MobileNavbar from "@/components/MobileNavbar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-50">
      {/* Sidebar Corporativa */}
      <MobileNavbar user={session?.user} />
      <Sidebar user={session?.user} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-70px)] lg:h-screen overflow-hidden">
        <header className="px-8 py-4 border-b border-slate-800/60 bg-slate-950 flex justify-end">
           <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
             Sessão Criptografada Ativa
           </div>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8 pb-32 lg:pb-8 relative">
          {children}
        </div>
      </main>
    </div>
  )
}
