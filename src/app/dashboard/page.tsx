import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import ChartComponent from "./ChartComponent"
import { subMonths, format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function DashboardPage() {
  const session = await auth()
  const role = (session?.user as any)?.role || "ADMIN"
  const isAdmin = role === "ADMIN"

  let brokerObj = null
  if (!isAdmin && session?.user?.email) {
    brokerObj = await prisma.broker.findFirst({ where: { email: session.user.email.toLowerCase().trim() } })
  }

  const salesFilter = !isAdmin ? (brokerObj ? { brokerId: brokerObj.id } : { id: "none" }) : {}

  // Real Data Aggregation from Prisma SQLite
  const sales = await prisma.sale.findMany({
     where: salesFilter,
     include: { broker: true, client: true, development: true }
  })
  
  const brokersCount = await prisma.broker.count()
  const clientsCount = await prisma.client.count({ where: !isAdmin && brokerObj ? { sales: { some: { brokerId: brokerObj.id } } } : {} })
  
  // Totals
  const totalVGT = sales.reduce((acc, sale) => acc + sale.amount, 0)
  const totalCommissionPending = sales.filter(s => !s.isPaid).reduce((acc, sale) => acc + sale.commissionValue, 0)
  const convertedSales = sales.filter(s => s.status === 'WON' || s.status === 'ASSINATURA').length
  const conversionRate = sales.length > 0 ? Math.round((convertedSales / sales.length) * 100) : 0

  // Dynamic past months
  const baseChartData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i)
    // uppercase first letter
    let monthName = format(d, 'MMM', { locale: ptBR })
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    
    const monthSales = sales.filter(s => {
       const sDate = new Date(s.createdAt)
       return sDate.getMonth() === d.getMonth() && sDate.getFullYear() === d.getFullYear()
    })
    
    const vgt = monthSales.reduce((acc, sale) => acc + sale.amount, 0)
    const commission = monthSales.reduce((acc, sale) => acc + sale.commissionValue, 0)
    
    return {
       name: i === 5 ? `${monthName} (Atual)` : monthName,
       vgt,
       commission
    }
  })

  // get all incomplete flow sales for alerts
  const pendingAlerts = sales.filter(s => s.status === 'PROSPECT' || s.status === 'ANALISE_CREDITO' || s.status === 'ASSINATURA').slice(0, 3)

  const money = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">{isAdmin ? 'Raio-X Financeiro Corporativo' : 'Meu Raio-X Operacional'}</h2>
        <p className="text-slate-400 text-sm">Dados auditados e centralizados em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Volume Geral (VGV)</p>
          <p className="text-3xl font-black text-white mb-1">{money(totalVGT)}</p>
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Total Captação Atual
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
           <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Comissões Pendentes</p>
           <p className="text-3xl font-black text-yellow-500 mb-1">{money(totalCommissionPending)}</p>
           <p className="text-xs text-yellow-600 font-medium">Aguardando liquidação Título</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
           <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Eficiência (WIN Rate)</p>
           <p className="text-3xl font-black text-white mb-1">{conversionRate}%</p>
           <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${conversionRate}%` }}></div>
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
           {isAdmin ? (
             <>
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Corretores Ativos</p>
               <p className="text-3xl font-black text-white mb-1">{brokersCount}</p>
               <p className="text-xs text-slate-500 font-medium">Cadastrados e Operando</p>
             </>
           ) : (
             <>
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Meus Clientes Fixos</p>
               <p className="text-3xl font-black text-white mb-1">{clientsCount}</p>
               <p className="text-xs text-slate-500 font-medium">Atendidos na Carteira</p>
             </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-6">Performance de Captação (VGV x Receita) Semestral</h3>
          <ChartComponent data={baseChartData} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-6">Mesa de Operações: Alertas</h3>
          <div className="flex-1 space-y-4">
             {pendingAlerts.length > 0 ? pendingAlerts.map(sale => (
               <div key={sale.id} className="relative pl-4 border-l-2 border-yellow-500 pb-2">
                 <div className="absolute w-2 h-2 bg-yellow-500 rounded-full -left-[5px] top-1"></div>
                 <p className="text-white text-sm font-medium leading-tight">Negócio em Aberto ({sale.status})</p>
                 <p className="text-xs text-slate-500 mt-1 line-clamp-1">{sale.development?.name} - {sale.client?.name}</p>
               </div>
             )) : (
               <div className="flex flex-col items-center justify-center py-10 opacity-50">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-600 mb-3 flex items-center justify-center text-slate-500">
                     ✓
                  </div>
                  <p className="text-xs font-medium text-slate-500">Nenhum gargalo na mesa</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
