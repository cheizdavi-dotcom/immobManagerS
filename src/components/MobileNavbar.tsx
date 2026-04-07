"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CalendarDays, Settings, TrendingUp } from 'lucide-react'

export default function MobileNavbar({ user }: { user: any }) {
  const pathname = usePathname()

  const allNavItems = [
    { name: 'Raio-X', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/dashboard/clientes', icon: Users },
    { name: 'Vendas', href: '/dashboard/vendas', icon: TrendingUp },
    { name: 'Visitas', href: '/dashboard/visitas', icon: CalendarDays },
    { name: 'Ajustes', href: '/dashboard/configuracoes', icon: Settings, adminOnly: true }
  ]

  const navItems = allNavItems.filter(item => !item.adminOnly || user?.role === 'ADMIN')
  const mobileItems = navItems.slice(0, 5)

  return (
    <div className="lg:hidden fixed bottom-0 w-full z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-4 pb-2 pt-1 flex justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {mobileItems.map((item) => {
        const Icon = item.icon
        const isActive = item.href === '/dashboard' 
          ? pathname === '/dashboard' 
          : pathname.startsWith(item.href)
          
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className="flex flex-col items-center justify-center py-2 w-full gap-1 relative overflow-hidden"
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-500/20 shadow-inner border border-blue-500/30' : 'bg-transparent border border-transparent'}`}>
              <Icon className={`w-5 h-5 transition-all ${isActive ? 'text-blue-400 scale-105' : 'text-slate-500 hover:text-slate-300'}`} />
            </div>
            {isActive && <div className="absolute top-0 w-8 h-1 bg-blue-500 rounded-b-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>}
            <span className={`text-[9px] font-bold tracking-wider ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
              {item.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
