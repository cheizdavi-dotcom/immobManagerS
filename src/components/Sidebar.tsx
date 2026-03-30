"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Users, Building, UserCircle, Banknote, Settings, LogOut, Building2 } from 'lucide-react'

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()
  
  const allNavItems = [
    { name: 'Raio-X de Resultados', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mesa de Vendas', href: '/dashboard/vendas', icon: TrendingUp },
    { name: 'Meus Clientes', href: '/dashboard/clientes', icon: Users },
    { name: 'Empreendimentos', href: '/dashboard/empreendimentos', icon: Building, adminOnly: true },
    { name: 'Corretores Ativos', href: '/dashboard/corretores', icon: UserCircle, adminOnly: true },
    { name: 'Finanças Operacional', href: '/dashboard/financeiro', icon: Banknote, adminOnly: true },
    { name: 'Ajustes Globais', href: '/dashboard/configuracoes', icon: Settings, adminOnly: true }
  ]

  const navItems = allNavItems.filter(item => !item.adminOnly || user?.role === 'ADMIN')

  return (
    <aside className="w-72 border-r border-slate-800/80 bg-slate-950 flex flex-col h-full shadow-2xl relative z-10">
      <div className="px-8 py-8 border-b border-slate-800/60 flex items-center gap-3 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
         <div className="relative z-10 bg-gradient-to-br from-blue-600/20 to-blue-900/10 p-2.5 rounded-xl border border-blue-500/30 shadow-inner group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
            <Building2 className="w-6 h-6 text-blue-400 group-hover:scale-105 transition-transform" />
         </div>
         <h1 className="relative z-10 text-xl font-bold tracking-tight text-white">
           Immob<span className="text-blue-500 font-black">Manager</span>
         </h1>
      </div>
      
      <div className="pt-8 pb-4 flex justify-between items-center px-8 relative">
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] relative z-10">Painel de Controle</p>
         <span className="bg-slate-900 border border-slate-800 text-[9px] font-bold uppercase tracking-widest text-emerald-500 px-2 py-0.5 rounded-full shadow-inner relative z-10">{user?.role === 'ADMIN' ? 'MASTER' : 'CORRETOR'}</span>
      </div>

      <nav className="flex-1 px-5 space-y-2 overflow-y-auto custom-scrollbar">
         {navItems.map((item) => {
           const Icon = item.icon
           const isActive = item.href === '/dashboard' 
             ? pathname === '/dashboard' 
             : pathname.startsWith(item.href)
             
           return (
             <Link 
               key={item.href}
               href={item.href} 
               className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${isActive ? 'bg-slate-900/80 text-white border border-slate-800 shadow-inner hover:bg-slate-800/80' : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border border-transparent'}`}
             >
               {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>}
               <Icon className={`w-5 h-5 transition-all ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`} />
               <span className="tracking-wide">{item.name}</span>
             </Link>
           )
         })}
      </nav>
      
      <div className="p-6 border-t border-slate-800/80 mt-auto bg-slate-900/30">
         <p className="text-slate-300 px-2 text-sm font-medium truncate mb-4">{user?.name || user?.email}</p>
         <form action="/api/auth/signout" method="POST" className="px-2">
           <button type="submit" className="flex items-center gap-3 text-sm text-slate-500 hover:text-red-400 font-bold transition-colors w-full p-2 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 shadow-sm active:scale-95">
              <LogOut className="w-4 h-4" />
              Encerrar Sessão
           </button>
         </form>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.4); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(51, 65, 85, 0.8); }
      `}} />
    </aside>
  )
}
