import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"
import { CheckCircle2, Clock, TrendingUp, DollarSign, Receipt } from "lucide-react"

async function togglePayment(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  const currentState = formData.get("currentState") === "true"
  await prisma.sale.update({
    where: { id },
    data: { isPaid: !currentState, paidAt: !currentState ? new Date() : null }
  })
  revalidatePath('/dashboard/financeiro')
}

function getStatusInfo(status: string) {
  const map: any = {
    'PROSPECT': { label: 'Prospecção', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
    'ANALISE_CREDITO': { label: 'Análise de Crédito / SPC', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    'CREDIT_ANALYSIS': { label: 'Análise de Crédito / SPC', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    'ASSINATURA': { label: 'Aguardando Assinatura', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    'SIGNATURE': { label: 'Aguardando Assinatura', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    'WON': { label: 'Venda Concluída / Paga', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    'LOST': { label: 'Cancelada', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  }
  return map[status] || map['PROSPECT']
}

export default async function FinanceiroPanel() {
  const sales = await prisma.sale.findMany({ 
    include: { broker: true, development: true, client: true },
    orderBy: { createdAt: 'desc' }
  })
  
  const totalVGV = sales.reduce((acc, s) => acc + s.amount, 0)
  const totalCommissionsPaid = sales.filter(s => s.isPaid).reduce((acc, s) => acc + s.commissionValue, 0)
  const totalCommissionsPending = sales.filter(s => !s.isPaid).reduce((acc, s) => acc + s.commissionValue, 0)
  const totalProfit = totalVGV > 0 ? (totalVGV - totalCommissionsPaid - totalCommissionsPending) : 0
  
  const money = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="animate-in fade-in duration-700 max-w-[1400px] mx-auto space-y-8 pb-10">
      
      <div className="mb-4">
         <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Financeiro Operacional</h1>
         <p className="text-sm font-medium text-slate-400">Acompanhe o fluxo de caixa, comissionamentos e a margem bruta da operação.</p>
      </div>
      
      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         {/* CARD 1: VGV Total */}
         <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-[1.5rem] flex flex-col shadow-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
               <DollarSign className="w-16 h-16 text-emerald-500" />
            </div>
            <div className="relative z-10 flex items-center justify-between mb-2">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">VGV Total (Geral)</p>
               <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="relative z-10 text-white text-3xl font-black mt-1 tracking-tight drop-shadow-md">{money(totalVGV)}</h3>
         </div>

         {/* CARD 2: Comissoes Pagas */}
         <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-[1.5rem] flex flex-col shadow-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
               <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
            <div className="relative z-10 flex items-center justify-between mb-2">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Comissões Pagas</p>
               <CheckCircle2 className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] rounded-full" />
            </div>
            <h3 className="relative z-10 text-white text-3xl font-black mt-1 tracking-tight drop-shadow-md">{money(totalCommissionsPaid)}</h3>
         </div>

         {/* CARD 3: Comissões a Pagar */}
         <div className="bg-slate-900/40 backdrop-blur-xl border border-yellow-500/20 p-6 rounded-[1.5rem] flex flex-col shadow-[0_0_30px_rgba(234,179,8,0.03)] relative overflow-hidden group hover:border-yellow-500/40 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
               <Clock className="w-16 h-16 text-yellow-500" />
            </div>
            <div className="relative z-10 flex items-center justify-between mb-2">
               <p className="text-xs font-bold text-yellow-600/80 uppercase tracking-widest">Comissões a Pagar</p>
               <Clock className="w-4 h-4 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)] rounded-full" />
            </div>
            <h3 className="relative z-10 text-yellow-500 text-3xl font-black mt-1 tracking-tight drop-shadow-md">{money(totalCommissionsPending)}</h3>
         </div>

         {/* CARD 4: Lucro Bruto */}
         <div className="bg-gradient-to-br from-blue-600/10 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 p-6 rounded-[1.5rem] flex flex-col shadow-[0_0_30px_rgba(59,130,246,0.05)] relative overflow-hidden group hover:border-blue-500/40 transition-colors">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl pointer-events-none transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-between mb-2">
               <p className="text-xs font-bold text-blue-400/80 uppercase tracking-widest">Lucro Bruto (Potencial)</p>
               <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="relative z-10 text-white text-3xl font-black mt-1 tracking-tight drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">{money(totalProfit)}</h3>
         </div>
      </div>

      {/* Tabela de Comissões */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[1.5rem] overflow-hidden shadow-2xl relative">
        <div className="p-8 border-b border-slate-800/60 flex items-center gap-3">
           <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <Receipt className="w-5 h-5 text-slate-400" />
           </div>
           <div>
              <h3 className="text-xl font-bold tracking-tight text-white">Controle de Comissões</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Gerencie os repasses para sua equipe tática com um clique.</p>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-950/60 text-slate-500 font-bold text-[10px] uppercase tracking-[0.15em] border-b border-slate-800">
                 <tr>
                    <th className="px-8 py-5">Data Venda</th>
                    <th className="px-8 py-5">Corretor Titular</th>
                    <th className="px-8 py-5">Referente à Venda</th>
                    <th className="px-8 py-5 text-center">Avanço do Negócio</th>
                    <th className="px-8 py-5 text-right">Fração (R$)</th>
                    <th className="px-8 py-5 text-center">Liquidação</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                 {sales.map(s => {
                   const st = getStatusInfo(s.status)
                   return (
                   <tr key={s.id} className="hover:bg-slate-800/30 transition-colors group">
                     <td className="px-8 py-5 font-medium text-slate-400">
                        {format(new Date(s.createdAt), "dd/MM/yyyy")}
                     </td>
                     <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           {s.broker.avatar ? (
                             <img src={s.broker.avatar} className="w-8 h-8 rounded-full border border-slate-700 object-cover" alt="" />
                           ) : (
                             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                               {s.broker.name.charAt(0).toUpperCase()}
                             </div>
                           )}
                           <span className="font-bold text-white tracking-wide">{s.broker.name}</span>
                        </div>
                     </td>
                     <td className="px-8 py-5">
                        <p className="font-bold text-white mb-0.5">{s.development?.name || "Avulso"}</p>
                        <p className="text-xs text-slate-500 font-medium">Cli: {s.client?.name || "Remanescente"}</p>
                     </td>
                     <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-inner ${st.color}`}>
                           {st.label}
                        </span>
                     </td>
                     <td className="px-8 py-5 text-right">
                        <span className="font-black text-white tracking-wide">{money(s.commissionValue)}</span>
                     </td>
                     <td className="px-8 py-5 flex justify-center items-center h-full">
                        <form action={togglePayment}>
                           <input type="hidden" name="id" value={s.id} />
                           <input type="hidden" name="currentState" value={s.isPaid ? 'true' : 'false'} />
                           <button 
                             type="submit" 
                             className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all active:scale-95 shadow-inner ${s.isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/20'}`}
                           >
                              {s.isPaid ? "✔ Pago" : "Pendente"}
                           </button>
                        </form>
                     </td>
                   </tr>
                 )})}
                 {sales.length === 0 && (
                    <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-500 border-dashed border border-slate-800/50 m-4 rounded-xl">Sem faturamento apurado neste exercício.</td></tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>

    </div>
  )
}
