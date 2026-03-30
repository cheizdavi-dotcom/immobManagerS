"use client"
import { useState, useRef } from "react"
import { format } from "date-fns"
import { UserCircle, Trash2, Edit, Plus, History, LayoutGrid, Image as ImageIcon, Loader2, Save, X, Camera } from "lucide-react"
import { saveBroker, deleteBroker } from "../../actions"

function money(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

function getStatusBadge(status: string) {
  const map: any = {
    'PROSPECT': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'CREDIT_ANALYSIS': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'SIGNATURE': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'WON': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'LOST': 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  const label: any = {
    'PROSPECT': 'Prospecção',
    'CREDIT_ANALYSIS': 'Análise de Crédito',
    'SIGNATURE': 'Assinatura',
    'WON': 'Venda Concluída',
    'LOST': 'Perdido',
  }
  const classes = map[status] || map['PROSPECT']
  return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${classes}`}>{label[status] || status}</span>
}

export default function CorretoresClient({ brokers }: { brokers: any[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [historyModal, setHistoryModal] = useState<any | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openNew = () => {
    setEditData({ name: "", email: "", phone: "", creci: "", avatar: "" })
    setModalOpen(true)
  }

  const openEdit = (broker: any) => {
    setEditData({ id: broker.id, name: broker.name, email: broker.email || "", phone: broker.phone || "", creci: broker.creci || "", avatar: broker.avatar || "" })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if(confirm("Deseja realmente desligar este Corretor? Todo o acesso dele será revogado.")) {
      try {
        await deleteBroker(id)
      } catch(error) {
        alert("Erro ao excluir. Este corretor deve ter vendas vinculadas na base de dados!")
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 300
        const scaleSize = MAX_WIDTH / img.width
        canvas.width = MAX_WIDTH
        canvas.height = img.height * scaleSize
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        const base64 = canvas.toDataURL('image/jpeg', 0.8)
        setEditData({...editData, avatar: base64})
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await saveBroker(editData)
      setModalOpen(false)
    } catch(error) {
      alert("Falha ao salvar. Verifique se o E-mail ou CRECI já existem.")
    }
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-[1400px] mx-auto w-full relative">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Gestão de Corretores</h1>
           <p className="text-sm font-medium text-slate-400">Cadastre e gerencie o esquadrão tático de vendas.</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 border border-blue-500/50">
          <Plus className="w-5 h-5" /> Novo Corretor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        {brokers.map((broker) => {
          const totalVendido = broker.sales.reduce((acc: number, sale: any) => acc + sale.amount, 0)
          
          return (
            <div key={broker.id} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col hover:border-slate-700 hover:bg-slate-900/60 transition-all duration-300 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                 {broker.avatar ? (
                   <img src={broker.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-slate-800 group-hover:border-blue-500/50 transition-colors shadow-inner" />
                 ) : (
                   <div className="w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center border-2 border-slate-800 group-hover:border-blue-500/50 transition-colors shadow-inner text-slate-600 group-hover:text-blue-400">
                      <UserCircle className="w-8 h-8" />
                   </div>
                 )}
                 <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{broker.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">📞 {broker.phone || "S/ Número"}</p>
                 </div>
              </div>

              <div className="space-y-3 mb-6 flex-1 relative z-10">
                 <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 flex justify-between items-center group-hover:border-slate-700 transition-colors">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><LayoutGrid className="w-3.5 h-3.5" /> Total Vendido</span>
                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-600">{money(totalVendido)}</span>
                 </div>
                 <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 flex justify-between items-center group-hover:border-slate-700 transition-colors">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><LayoutGrid className="w-3.5 h-3.5" /> Vendas Realizadas</span>
                    <span className="font-black text-white">{broker.sales.length}</span>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 relative z-10">
                 <button onClick={() => setHistoryModal(broker)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 border border-transparent">
                    <History className="w-4 h-4" /> Histórico
                 </button>
                 <div className="flex gap-2">
                    <button onClick={() => openEdit(broker)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-600/10 hover:border-blue-500/20 border border-transparent">
                       <Edit className="w-4 h-4" /> Editar
                    </button>
                    <button onClick={() => handleDelete(broker.id)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10 hover:border-red-500/20 border border-transparent">
                       <Trash2 className="w-4 h-4" /> Excluir
                    </button>
                 </div>
              </div>
            </div>
          )
        })}
        {brokers.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500 border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
             Nenhum corretor escalado na base.
          </div>
        )}
      </div>

      {/* BROKER EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
               <h3 className="text-xl font-bold text-white tracking-wide">
                 {editData?.id ? 'Atualizar Corretor Tático' : 'Recrutar Novo Corretor'}
               </h3>
               <button onClick={() => setModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-slate-800">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <form onSubmit={handleSave} className="p-8 space-y-6 flex flex-col items-center">
                
                <div 
                   className="relative group cursor-pointer mb-2"
                   onClick={() => fileInputRef.current?.click()}
                >
                   <input 
                     type="file" 
                     className="hidden" 
                     accept="image/*" 
                     ref={fileInputRef} 
                     onChange={handleImageUpload} 
                   />
                   {editData.avatar ? (
                      <div className="relative">
                        <img src={editData.avatar} alt="Avatar Preview" className="w-[120px] h-[120px] rounded-full object-cover border-4 border-slate-800 shadow-xl group-hover:opacity-50 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                      </div>
                   ) : (
                      <div className="w-[120px] h-[120px] rounded-full bg-slate-950 flex flex-col items-center justify-center border-4 border-slate-800 shadow-inner group-hover:border-blue-500/50 transition-colors relative overflow-hidden">
                         <Camera className="w-8 h-8 text-slate-600 group-hover:text-blue-400 mb-1 transition-colors z-10" />
                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest z-10 group-hover:text-blue-400">Adicionar</span>
                         <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                   )}
                </div>
                <p className="text-xs text-slate-500 font-medium mb-4 text-center">Clique no círculo para escolher uma foto do Computador ou Celular.</p>

                <div className="grid grid-cols-2 gap-5 w-full">
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Nome do Agente</label>
                     <input required autoFocus type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner" placeholder="Ex: Carlos Santana" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">E-mail (Acesso)</label>
                     <input required type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner" placeholder="carlos@imobiliaria.com" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Telefone / WhatsApp</label>
                     <input required type="text" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner" placeholder="(11) 90000-0000" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">CRECI</label>
                     <input type="text" value={editData.creci} onChange={e => setEditData({...editData, creci: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner" placeholder="00000-F" />
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-800/50 flex items-center justify-end gap-3 w-full mt-8">
                   <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancelar</button>
                   <button type="submit" disabled={isSaving} className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50">
                     {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                     Confirmar e Montar Corretor
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {historyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
             <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 shrink-0">
               <div>
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    Histórico de Vendas: {historyModal.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Todas as vendas registradas para este corretor tático.</p>
               </div>
               <button onClick={() => setHistoryModal(null)} className="p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-slate-800">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-950/20">
               <table className="w-full text-left border-collapse">
                 <thead className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 border-b border-slate-800/80">
                   <tr>
                     <th className="pb-4 pt-2 px-2">Data da Operação</th>
                     <th className="pb-4 pt-2 px-2">Cliente</th>
                     <th className="pb-4 pt-2 px-2">Empreendimento</th>
                     <th className="pb-4 pt-2 px-2 text-right">Faturamento Total</th>
                     <th className="pb-4 pt-2 px-2 text-center">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800/50">
                   {historyModal.sales.map((sale: any) => (
                     <tr key={sale.id} className="hover:bg-slate-800/20 transition-colors">
                       <td className="py-4 px-2 text-sm text-slate-300 font-medium">{format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm")}</td>
                       <td className="py-4 px-2 text-sm text-white font-bold">{sale.client?.name || "Cliente Desconhecido"}</td>
                       <td className="py-4 px-2 text-sm text-slate-400 font-medium">{sale.development?.name || "Não atribuído"}</td>
                       <td className="py-4 px-2 text-sm font-black text-emerald-400 text-right tracking-wide">{money(sale.amount)}</td>
                       <td className="py-4 px-2 text-center">{getStatusBadge(sale.status)}</td>
                     </tr>
                   ))}
                   {historyModal.sales.length === 0 && (
                     <tr><td colSpan={5} className="py-12 text-center text-slate-500 font-medium border-dashed border border-slate-800/50 rounded-xl">O agente ainda não possui vendas faturadas.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
             
           </div>
        </div>
      )}
    </div>
  )
}

