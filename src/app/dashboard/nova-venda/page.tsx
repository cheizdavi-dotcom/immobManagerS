import { createSmartSale } from "@/actions/crm"
import { auth } from "@/auth"

export default async function NovaVenda() {
  const session = await auth()

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Registro Inteligente de Venda</h2>
        <p className="text-slate-400">Insira os dados da negociação. O sistema irá registrar automaticamente o cliente, o corretor e a construtora caso já não existam.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
        <form action={createSmartSale} className="space-y-6">
          <input type="hidden" name="adminEmail" value={session?.user?.email || "admin@immob.com"} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parceiros */}
            <div className="space-y-4 md:col-span-2">
               <h3 className="text-emerald-400 font-semibold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Entidades da Venda</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Cliente</label>
              <input 
                name="clientName" type="text" placeholder="Ex: Sr. Marcos" required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Corretor</label>
              <input 
                name="brokerName" type="text" placeholder="Ex: Corretora Silva" required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Empreendimento (Imóvel)</label>
              <input 
                name="developmentName" type="text" placeholder="Ex: Edf. Horizon Lote 14" required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Valores */}
            <div className="space-y-4 md:col-span-2 mt-4">
               <h3 className="text-yellow-500 font-semibold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Negociação Financeira</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Valor Veral da Venda (R$)</label>
              <input 
                name="amount" type="number" placeholder="Ex: 500000" required step="0.01"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white text-lg font-bold focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Porcentagem da Comissão (%)</label>
              <input 
                name="commissionRate" type="number" placeholder="Ex: 5.5" required step="0.1" max="100" min="0" text-lg
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-yellow-500 font-bold focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-8 flex justify-end">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all">
              Registrar Negócio no Banco
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
