"use client"
import { useState } from "react"
import { Users, Search, Edit, Trash2, X, Thermometer, Loader2, LayoutGrid, List as ListIcon, MoreVertical, Smartphone, User, FileText, CheckCircle2, GripVertical } from "lucide-react"
import { saveClient, deleteClient, updateClientPhase } from "../../actions"
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent } from "@dnd-kit/core"
import confetti from "canvas-confetti"
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const PHASES = [
  { id: "NOVO", label: "Novo Lead", color: "border-slate-700/50 bg-slate-900/30", headerColor: "from-slate-700/30 to-slate-900/30", icon: Users },
  { id: "CONTATO", label: "Contato Realizado", color: "border-blue-500/20 bg-blue-500/5", headerColor: "from-blue-500/10 to-blue-500/5", icon: Smartphone },
  { id: "AGENDADO", label: "Visita Agendada", color: "border-amber-500/20 bg-amber-500/5", headerColor: "from-amber-500/10 to-amber-500/5", icon: ClockIcon },
  { id: "NEGOCIACAO", label: "Em Negociação", color: "border-orange-500/20 bg-orange-500/5", headerColor: "from-orange-500/10 to-orange-500/5", icon: Thermometer },
  { id: "CONTRATO", label: "Em Contrato", color: "border-emerald-500/20 bg-emerald-500/5", headerColor: "from-emerald-500/10 to-emerald-500/5", icon: FileText },
  { id: "FECHADO", label: "Ganhamos!", color: "border-emerald-500 bg-emerald-500/10", headerColor: "from-emerald-500/20 to-emerald-500/10", icon: CheckCircle2 }
] as const;

function ClockIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

function ClientCard({ client, onEdit, onDelete, getStatusColor }: { client: any; onEdit: () => void; onDelete: () => void; getStatusColor: (s: string) => string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: client.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl shadow-lg hover:border-slate-700/80 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden"
    >
      <div {...attributes} {...listeners} className="absolute top-3 left-3 text-slate-600 hover:text-slate-400 transition-colors">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className={`absolute top-0 right-0 w-1.5 h-full ${getStatusColor(client.status)}`}></div>
      
      <div className="flex items-start justify-between mb-4 pl-4">
        <h4 className="font-bold text-white text-md tracking-tight group-hover:text-blue-400 transition-colors">{client.name}</h4>
      </div>
      
      <div className="space-y-2 mb-4 opacity-70 pl-4">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <Smartphone className="w-3.5 h-3.5" /> {client.phone || "—"}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <User className="w-3.5 h-3.5" /> CPF: {client.cpf || "—"}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 pl-4">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Temp: {client.status}</span>
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="hover:text-blue-400 text-slate-700 transition-colors"><Edit className="w-3.5 h-3.5"/></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="hover:text-red-500 text-slate-700 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
        </div>
      </div>
    </div>
  )
}

function DroppableColumn({ phase, clients, onEdit, onDelete, getStatusColor }: { phase: typeof PHASES[number]; clients: any[]; onEdit: (c: any) => void; onDelete: (id: string) => void; getStatusColor: (s: string) => string }) {
  const { setNodeRef, isOver } = useSortable({ id: phase.id, data: { type: 'column' } })
  const Icon = phase.icon

  return (
    <div 
      ref={setNodeRef}
      data-phase={phase.id}
      className="min-w-[320px] max-w-[320px] flex flex-col h-full rounded-2xl"
    >
      <div className={`flex items-center justify-between px-3 py-4 shrink-0 bg-gradient-to-br ${phase.headerColor} rounded-t-2xl border border-slate-800/60 border-b-0`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${phase.color}`}>
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">{phase.label}</h3>
            <p className="text-[10px] font-bold text-slate-500">{clients.length} Negócios</p>
          </div>
        </div>
        <MoreVertical className="w-4 h-4 text-slate-700 cursor-pointer" />
      </div>

      <div 
        className={`flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar rounded-b-2xl p-3 border border-slate-800/60 border-t-0 min-h-[200px] transition-colors ${isOver ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/20'}`}
      >
        <SortableContext items={clients.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {clients.map(client => (
            <ClientCard 
              key={client.id} 
              client={client} 
              onEdit={() => onEdit(client)}
              onDelete={() => onDelete(client.id)}
              getStatusColor={getStatusColor}
            />
          ))}
        </SortableContext>
        
        {clients.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-800/40 rounded-2xl flex items-center justify-center">
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Limpo</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ClientesClient({ clients }: { clients: any[] }) {
  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [cpf, setCpf] = useState("")
  const [status, setStatus] = useState("Morno")
  const [kanbanPhase, setKanbanPhase] = useState<string>("NOVO")
  const [email, setEmail] = useState("")
  const [editingClient, setEditingClient] = useState<any>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localPhases, setLocalPhases] = useState<Record<string, string>>({})
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const getClientPhase = (client: any) => {
    return localPhases[client.id] ?? client.kanbanPhase
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Quente': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
      case 'Morno': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
      case 'Frio': return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
      default: return 'bg-slate-500'
    }
  }

  const openNew = () => {
    setEditingClient(null)
    setName(""); setPhone(""); setCpf(""); setStatus("Morno"); setKanbanPhase("NOVO"); setEmail("");
    setIsEditMode(false); setIsModalOpen(true);
  }

  const openEdit = (client: any) => {
    setEditingClient(client)
    setName(client.name); setPhone(client.phone || ""); setCpf(client.cpf || ""); setStatus(client.status || "Morno"); setKanbanPhase(client.kanbanPhase || "NOVO"); setEmail(client.email || "");
    setIsEditMode(true); setIsModalOpen(true);
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveClient({ id: editingClient?.id, name, phone, cpf, status, kanbanPhase, email });
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar dados!");
    }
    setIsSaving(false);
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja remover este proponente da sua vista radar?")) {
      await deleteClient(id);
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || !activeId) return

    const overId = over.id as string
    const isOverColumn = PHASES.some(p => p.id === overId)
    const isOverClient = clients.some(c => c.id === overId)

    let targetPhase: string | null = null

    if (isOverColumn) {
      targetPhase = overId
    } else if (isOverClient) {
      const overClient = clients.find(c => c.id === overId)
      if (overClient) targetPhase = getClientPhase(overClient)
    }

    if (targetPhase && localPhases[activeId] !== targetPhase) {
      setLocalPhases(prev => ({ ...prev, [activeId]: targetPhase! }))
    }
  }

  const handleDragEnd = async () => {
    if (activeId && localPhases[activeId]) {
      const newPhase = localPhases[activeId]
      const client = clients.find(c => c.id === activeId)
      if (client && client.kanbanPhase !== newPhase) {
        await updateClientPhase(activeId, newPhase)
        
        if (newPhase === "FECHADO") {
          const rect = document.querySelector(`[data-phase="FECHADO"]`)?.getBoundingClientRect()
          if (rect) {
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#10b981', '#fbbf24', '#f472b6', '#60a5fa', '#ffffff']
            })
          }
        }
      }
      setLocalPhases(prev => {
        const next = { ...prev }
        delete next[activeId]
        return next
      })
    }
    setActiveId(null)
  }

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.cpf && c.cpf.includes(search)))

  const activeClient = activeId ? clients.find(c => c.id === activeId) : null

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 max-w-full mx-auto w-full px-4 overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-blue-600/20 shadow-sm">Pipeline OS</span>
              <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">Gestão de Proponentes</h1>
           </div>
           <p className="text-sm font-medium text-slate-500">Fluxo tático de negociação e carteira de ativos.</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/60 shadow-inner">
           <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800/50 gap-1">
              <button 
                onClick={() => setView("kanban")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'kanban' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Quadro
              </button>
              <button 
                onClick={() => setView("table")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'table' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <ListIcon className="w-3.5 h-3.5" /> Lista
              </button>
           </div>

           <button onClick={openNew} className="flex items-center gap-2 bg-slate-100 hover:bg-white text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_25px_rgba(255,255,255,0.05)] active:scale-95 border border-white/20">
              Novo Proponente
           </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-3xl shadow-2xl relative group focus-within:border-blue-500/40 transition-all shrink-0">
         <div className="flex items-center px-4 gap-4">
            <Search className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Localizar negociação por Nome ou CPF..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="flex-1 bg-transparent border-none text-sm text-slate-200 focus:outline-none focus:ring-0 font-bold tracking-wide placeholder:font-normal placeholder:text-slate-600" 
            />
         </div>
      </div>

      {/* MAIN CONTENT VIZ */}
      <div className="flex-1 min-h-0">
        {view === "kanban" ? (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="kanban-container h-full custom-scrollbar">
              {PHASES.map((phase) => {
                const columnClients = filtered.filter(c => getClientPhase(c) === phase.id);
                
                return (
                  <DroppableColumn 
                    key={phase.id} 
                    phase={phase} 
                    clients={columnClients}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    getStatusColor={getStatusColor}
                  />
                )
              })}
            </div>
            
            <DragOverlay>
              {activeClient && (
                <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/50 p-5 rounded-2xl shadow-2xl shadow-blue-500/20 rotate-3 scale-105">
                  <h4 className="font-bold text-white text-md">{activeClient.name}</h4>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          /* TABLE VIEW - kept as fallback as requested */
          <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800/60 overflow-hidden relative h-full flex flex-col">
              <div className="overflow-x-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-slate-950/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-slate-800/80 sticky top-0 z-10">
                    <tr>
                      <th className="px-8 py-5">Nome Completo</th>
                      <th className="px-8 py-5">Fase do Funil</th>
                      <th className="px-8 py-5">Telefone Contato</th>
                      <th className="px-8 py-5 text-center">Temperatura</th>
                      <th className="px-8 py-5 text-center">Editar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filtered.map(c => (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition-all duration-300 group">
                         <td className="px-8 py-5 text-sm font-bold text-white uppercase tracking-wide">{c.name}</td>
                         <td className="px-8 py-5">
                            <span className="bg-slate-800/50 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full border border-slate-700/50 uppercase tracking-widest">
                               {PHASES.find(p => p.id === c.kanbanPhase)?.label || "Novo Lead"}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-sm text-slate-400 font-bold">{c.phone || "—"}</td>
                         <td className="px-8 py-5 text-center">
                            <div className="flex justify-center">
                               <div className={`w-3 h-3 rounded-full ${getStatusColor(c.status)}`}></div>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-center text-slate-500">
                            <button onClick={() => openEdit(c)} className="p-2 bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-400 rounded-lg transition-colors border border-slate-700/50 hover:border-blue-500/30 shadow-sm"><Edit className="w-4 h-4" /></button>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        )}
      </div>

      {/* MODAL - Updated with Phase selector */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#02040a]/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
           
           <div className="relative bg-[#0b0f19] border border-slate-800/60 rounded-[2rem] shadow-2xl shadow-black/80 w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-8 border-b border-slate-800/60 bg-slate-950/40">
                 <div>
                    <h2 className="text-xl font-bold tracking-tight text-white uppercase tracking-widest">
                       {isEditMode ? "Tática de Negociação" : "Novo Prospecto"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-[0.1em]">Configuração de fluxo do cliente no radar tático.</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800 transition-all"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-black tracking-[0.2em] uppercase text-slate-500">Nome Completo</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Fernanda Lima" className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2.5">
                        <label className="text-xs font-black tracking-[0.2em] uppercase text-slate-500">Telefone Contato</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(41) 99999-0000" className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-4 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-xs font-black tracking-[0.2em] uppercase text-slate-500">E-mail</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@luxo.com" className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-4 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2.5">
                        <label className="text-xs font-black tracking-[0.2em] uppercase text-slate-500">Fase do Funil (Kanban)</label>
                        <select value={kanbanPhase} onChange={e => setKanbanPhase(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-sm font-bold text-white cursor-pointer hover:bg-slate-900 transition-colors appearance-none">
                            {PHASES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-xs font-black tracking-[0.2em] uppercase text-slate-500">Temperatura (Interest Stage)</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-sm font-bold text-white cursor-pointer hover:bg-slate-900 transition-colors appearance-none">
                            <option value="Quente">🔥 Quente (Alta)</option>
                            <option value="Morno">🟡 Morno (Média)</option>
                            <option value="Frio">❄️ Frio (Baixa)</option>
                        </select>
                    </div>
                 </div>
              </div>
              
              <div className="p-8 border-t border-slate-800/60 bg-slate-950/40 flex justify-end gap-4">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Cancelar</button>
                 <button onClick={handleSave} disabled={isSaving} className="px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-xl flex items-center gap-3">
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin"/>}
                    {isEditMode ? "Confirmar Operação" : "Despachar Dados"}
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
        
        .kanban-container {
          display: flex;
          gap: 1.5rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding-bottom: 2rem;
          mask-image: linear-gradient(to right, black 95%, transparent 100%);
        }
      `}} />
    </div>
  )
}


