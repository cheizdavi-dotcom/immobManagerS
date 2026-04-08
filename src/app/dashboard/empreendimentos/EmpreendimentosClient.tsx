"use client"
import { useState } from "react"
import { Building, Plus, LayoutGrid, Edit, Trash2, X, Loader2, Save } from "lucide-react"
import { saveDevelopment, deleteDevelopment } from "../../actions"

export default function EmpreendimentosClient({ developments }: { developments: any[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const openNew = () => {
    setEditData({ name: "", builder: "", city: "" })
    setModalOpen(true)
  }

  const openEdit = (dev: any) => {
    setEditData({ id: dev.id, name: dev.name, builder: dev.builder, city: dev.city || "" })
    setModalOpen(true)
  }

  const handleDelete = async (id: string, e: any) => {
    e.stopPropagation()
    if(confirm("Deseja realmente apagar este Empreendimento? Essa ação é perigosa se houverem vendas vinculadas.")) {
      try {
        await deleteDevelopment(id)
      } catch(error) {
        alert("Erro ao excluir. O empreendimento deve ter vendas amarradas a ele!")
      }
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await saveDevelopment(editData)
      setModalOpen(false)
    } catch(error) {
      alert("Falha sistêmica ao salvar o Empreendimento. Verifique o console.")
    }
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-[1400px] mx-auto w-full relative">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between mb-8 w-full">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Catálogo de Empreendimentos</h1>
           <p className="text-sm font-medium text-slate-400">Produtos, Plantas e Mapeamento de Construtoras Ativas.</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 border border-blue-500/50">
          <Plus className="w-5 h-5" /> Inserir Empreendimento
        </button>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800/60 overflow-hidden flex-1 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-950/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-slate-800/80">
                <tr>
                  <th className="px-8 py-5">Nome da Planta / Condomínio</th>
                  <th className="px-8 py-5">Construtora Responsável</th>
                  <th className="px-8 py-5">Cidade de Operação</th>
                  <th className="px-8 py-5 text-center">Volume Indexado</th>
                  <th className="px-8 py-5 text-center">Ações Motoras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {developments.map(d => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-all duration-300 group">
                     <td className="px-8 py-5 text-sm font-bold text-white flex items-center gap-3">
                        <LayoutGrid className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors"/> 
                        {d.name}
                     </td>
                     <td className="px-8 py-5 text-sm text-slate-300 font-semibold">{d.builder}</td>
                     <td className="px-8 py-5 text-sm text-slate-400 font-medium">{d.city || "—"}</td>
                     <td className="px-8 py-5 text-center">
                        <span className="bg-blue-500/5 group-hover:bg-blue-500/10 text-blue-500/70 group-hover:text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full text-xs font-bold transition-all">{d.sales?.length} Unidades</span>
                     </td>
                     <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                           <button onClick={(e) => { e.stopPropagation(); openEdit(d); }} className="px-3 py-1.5 bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-400 text-slate-400 rounded-lg transition-colors border border-slate-700/50 hover:border-blue-500/30 shadow-sm text-xs font-bold flex items-center gap-2" title="Editar Empreendimento"><Edit className="w-3.5 h-3.5" /> Editar</button>
                           <button onClick={(e) => handleDelete(d.id, e)} className="p-1.5 bg-slate-800/80 hover:bg-red-500/10 hover:text-red-500 text-slate-500 rounded-lg transition-colors border border-slate-700/50 hover:border-red-500/30 shadow-sm" title="Apagar"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                     </td>
                  </tr>
                ))}
                {developments.length === 0 && <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500">Nenhum produto em catálogo.</td></tr>}
              </tbody>
            </table>
          </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between p-6 border-b border-slate-800 bg-slate-900/50 w-full">
               <h3 className="text-xl font-bold text-white tracking-wide">
                 {editData?.id ? 'Atualizar Planta/Produto' : 'Declarar Novo Empreendimento'}
               </h3>
               <button onClick={() => setModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-slate-800">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Nome do Produto</label>
                     <input required autoFocus type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-all shadow-inner placeholder:text-slate-600" placeholder="Ex: Riserva Di Vernazza" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Construtora Responsável</label>
                     <input required type="text" value={editData.builder} onChange={e => setEditData({...editData, builder: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-all shadow-inner placeholder:text-slate-600" placeholder="Ex: Construtora Genérica" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Cidade Principal</label>
                     <input type="text" value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-all shadow-inner placeholder:text-slate-600" placeholder="Ex: Curitiba - PR" />
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-800/50 flex items-center justify-end gap-3">
                   <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancelar</button>
                   <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50">
                     {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                     Salvar Motor
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  )
}
