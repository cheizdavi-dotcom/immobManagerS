"use client"
import { useState, useMemo, useEffect } from "react"
import { Users, Plus, Search, Edit, Trash2, X, Thermometer, Loader2, LayoutGrid, List as ListIcon, MoreVertical, Smartphone, User, FileText, CheckCircle2 } from "lucide-react"
import { saveClient, deleteClient, updateClientPhase } from "../../actions"
import confetti from "canvas-confetti"

const PHASES = [
  { id: "NOVO", label: "Novo Lead", color: "border-slate-700/50 bg-slate-900/30", icon: Users },
  { id: "CONTATO", label: "Contato Realizado", color: "border-blue-500/20 bg-blue-500/5", icon: Smartphone },
  { id: "AGENDADO", label: "Visita Agendada", color: "border-amber-500/20 bg-amber-500/5", icon: ClockIcon },
  { id: "NEGOCIACAO", label: "Em Negociação", color: "border-orange-500/20 bg-orange-500/5", icon: Thermometer },
  { id: "CONTRATO", label: "Em Contrato", color: "border-emerald-500/20 bg-emerald-500/5", icon: FileText },
  { id: "FECHADO", label: "Ganhamos!", color: "border-emerald-500 bg-emerald-500/10", icon: CheckCircle2 }
] as const;

function ClockIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

export default function ClientesClient({ clients: initialClients }: { clients: any[] }) {
  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  
  const [clients, setClients] = useState(initialClients)

  // Sync state with server props
  useEffect(() => { setClients(initialClients); }, [initialClients]);

  const [activeId, setActiveId] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [cpf, setCpf] = useState("")
  const [status, setStatus] = useState("Morno")
  const [kanbanPhase, setKanbanPhase] = useState<string>("NOVO")
  const [email, setEmail] = useState("")

  const openNew = () => {
    setActiveId(""); setName(""); setPhone(""); setCpf(""); setStatus("Morno"); setKanbanPhase("NOVO"); setEmail("");
    setIsEditMode(false); setIsModalOpen(true);
  }

  const openEdit = (client: any) => {
    setActiveId(client.id); setName(client.name); setPhone(client.phone || ""); setCpf(client.cpf || ""); setStatus(client.status || "Morno"); setKanbanPhase(client.kanbanPhase || "NOVO"); setEmail(client.email || "");
    setIsEditMode(true); setIsModalOpen(true);
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveClient({ id: activeId || undefined, name, phone, cpf, status, kanbanPhase, email });
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar dados!");
    }
    setIsSaving(false);
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja remover este proponente?")) {
      await deleteClient(id);
    }
  }

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, phaseId: string) => {
    e.preventDefault();
    if (dropTarget !== phaseId) setDropTarget(phaseId);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = async (e: React.DragEvent, targetPhase: string) => {
    e.preventDefault();
    const id = draggedId;
    setDraggedId(null);
    setDropTarget(null);

    if (id) {
      // Confetti Effect if phase is "Ganhamos!" (FECHADO)
      if (targetPhase === "FECHADO") {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#fbbf24'],
          zIndex: 99999
        });
      }

      // Optimistic update
      const updated = clients.map(c => c.id === id ? { ...c, kanbanPhase: targetPhase } : c);
      setClients(updated);
      
      // DB update
      await updateClientPhase(id, targetPhase);
    }
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.cpf && c.cpf.includes(search)))

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Quente': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
      case 'Morno': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
      case 'Frio': return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
      default: return 'bg-slate-500'
    }
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 max-w-full mx-auto w-full px-4 overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between mb-8 shrink-0 w-full">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-blue-600/20 shadow-sm">Pipeline OS</span>
              <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">Gestão de Proponentes</h1>
           </div>
           <p className="text-sm font-medium text-slate-500">Arraste e solte para mover as negociações entre as fases.</p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/60 shadow-inner w-full lg:w-auto">
           <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800/50 gap-1 w-full lg:w-auto justify-center">
              <button onClick={() => setView("kanban")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'kanban' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <LayoutGrid className="w-3.5 h-3.5" /> Quadro
              </button>
              <button onClick={() => setView("table")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'table' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <ListIcon className="w-3.5 h-3.5" /> Lista
              </button>
           </div>
           <button onClick={openNew} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-white text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_25px_rgba(255,255,255,0.05)] active:scale-95 border border-white/20 w-full lg:w-auto">
              Novo Proponente
           </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-3xl shadow-2xl relative group focus-within:border-blue-500/40 transition-all shrink-0">
         <div className="flex items-center px-4 gap-4">
            <Search className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input type="text" placeholder="Localizar negociação..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent border-none text-sm text-slate-200 focus:outline-none focus:ring-0 font-bold tracking-wide placeholder:font-normal placeholder:text-slate-600" />
         </div>
      </div>

      {/* MAIN CONTENT VIZ */}
      <div className="flex-1 min-h-0">
        {view === "kanban" ? (
          <div className="kanban-container h-full custom-scrollbar">
            {PHASES.map((phase) => {
              const columnClients = filtered.filter(c => (c.kanbanPhase || "NOVO") === phase.id);
              const isActive = dropTarget === phase.id;
              
              return (
                <div 
                  key={phase.id} 
                  onDragOver={(e) => handleDragOver(e, phase.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, phase.id)}
                  className={`min-w-[320px] max-w-[320px] flex flex-col h-full rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-600/5 ring-2 ring-blue-500/30' : ''}`}
                >
                   <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between px-3 py-4 shrink-0 transition-opacity w-full">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl border ${phase.color}`}>
                            {<phase.icon className="w-4 h-4 text-slate-400" />}
                         </div>
                         <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">{phase.label}</h3>
                            <p className="text-[10px] font-bold text-slate-500">{columnClients.length} Negócios</p>
                         </div>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar px-1">
                      {columnClients.map(client => (
                        <div 
                          key={client.id} 
                          draggable style={{ touchAction: "pan-y" }} onDragStart={() => handleDragStart(client.id)}
                          onClick={() => openEdit(client)}
                          className={`bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl shadow-lg hover:border-slate-700/80 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden ${draggedId === client.id ? 'opacity-30' : 'opacity-100'}`}
                        >
                           <div className={`absolute top-0 right-0 w-1.5 h-full ${getStatusColor(client.status)}`}></div>
                           <h4 className="font-bold text-white text-md tracking-tight group-hover:text-blue-400 transition-colors mb-4">{client.name}</h4>
                           <div className="space-y-2 mb-4 opacity-70">
                              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest"><Smartphone className="w-3.5 h-3.5" /> {client.phone || "—"}</div>
                              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest"><User className="w-3.5 h-3.5" /> CPF: {client.cpf || "—"}</div>
                           </div>
                           <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between pt-4 border-t border-slate-800/50 w-full">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Interest: {client.status}</span>
                              <Trash2 onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} className="w-3.5 h-3.5 text-slate-700 hover:text-red-500 cursor-pointer transition-colors"/>
                           </div>
                        </div>
                      ))}
                      {columnClients.length === 0 && (
                        <div className="h-32 border-2 border-dashed border-slate-800/40 rounded-2xl flex items-center justify-center opacity-30">
                           <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Pipeline Livre</p>
                        </div>
                      )}
                   </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* TABLE VIEW FALLBACK */
          <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800/60 overflow-hidden relative h-full flex flex-col">
              <div className="overflow-x-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-slate-950/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-slate-800/80 sticky top-0 z-10">
                    <tr><th className="px-8 py-5">Nome Completo</th><th className="px-8 py-5">Fase</th><th className="px-8 py-5">Telefone</th><th className="px-8 py-5 text-center">Temperatura</th><th className="px-8 py-5 text-center">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filtered.map(c => (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition-all duration-300 group">
                         <td className="px-8 py-5 text-sm font-bold text-white uppercase tracking-wide">{c.name}</td>
                         <td className="px-8 py-5"><span className="bg-slate-800/50 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full">{PHASES.find(p => p.id === c.kanbanPhase)?.label}</span></td>
                         <td className="px-8 py-5 text-sm text-slate-400 font-bold">{c.phone || "—"}</td>
                         <td className="px-8 py-5 text-center"><div className={`w-3 h-3 rounded-full mx-auto ${getStatusColor(c.status)}`}></div></td>
                         <td className="px-8 py-5 text-center"><button onClick={() => openEdit(c)} className="p-2 bg-slate-800/80 hover:text-blue-400 rounded-lg"><Edit className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#02040a]/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
           <div className="relative bg-[#0b0f19] border border-slate-800/60 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between p-8 border-b border-slate-800/60 bg-slate-950/40 w-full">
                 <h2 className="text-xl font-bold tracking-tight text-white uppercase tracking-widest">{isEditMode ? "Tática de Negociação" : "Novo Prospecto"}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-2.5 rounded-xl bg-slate-900/50 border border-slate-800"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-8 space-y-6">
                 <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-4 text-sm font-bold text-white" />
                 <div className="grid grid-cols-2 gap-6">
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-sm font-bold text-white" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-sm font-bold text-white" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <select value={kanbanPhase} onChange={e => setKanbanPhase(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-sm font-bold text-white">
                        {PHASES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-sm font-bold text-white">
                        <option value="Quente">🔥 Quente</option>
                        <option value="Morno">🟡 Morno</option>
                        <option value="Frio">❄️ Frio</option>
                    </select>
                 </div>
              </div>
              <div className="p-8 border-t border-slate-800/60 bg-slate-950/40 flex justify-end gap-4">
                 <button onClick={handleSave} disabled={isSaving} className="px-10 py-3 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-3">
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin"/>} {isEditMode ? "Confirmar Operação" : "Despachar Dados"}
                 </button>
              </div>
           </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(2, 6, 23, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.6); border-radius: 10px; border: 1px solid rgba(2, 6, 23, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37, 99, 235, 0.8); }
        .kanban-container { display: flex; gap: 1.5rem; overflow-x: auto; scroll-behavior: smooth; padding-bottom: 2rem; }
      `}} />
    </div>
  )
}

