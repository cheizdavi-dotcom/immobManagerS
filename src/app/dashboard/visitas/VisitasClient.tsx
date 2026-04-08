"use client"
import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Home, X, Loader2, Edit, Trash2, Bell, CheckCircle, AlertCircle } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { saveVisit, deleteVisit, updateVisitStatus, sendVisitReminders } from "../../actions"

const STATUS_COLORS: Record<string, string> = {
  AGENDADA: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CONFIRMADA: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  REALIZADA: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CANCELADA: "bg-red-500/20 text-red-400 border-red-500/30",
  REMARCADA: "bg-amber-500/20 text-amber-400 border-amber-500/30"
}

export default function VisitasClient({ visits, developments, clients, brokers, userRole }: any) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingVisit, setEditingVisit] = useState<any>(null)

  const [developmentId, setDevelopmentId] = useState("")
  const [clientId, setClientId] = useState("")
  const [brokerId, setBrokerId] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("AGENDADA")
  const [isSendingReminders, setIsSendingReminders] = useState(false)
  const [reminderResult, setReminderResult] = useState<{success: boolean; message: string} | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getVisitsForDay = (day: Date) => visits.filter((v: any) => isSameDay(new Date(v.scheduledAt), day))

  const openNew = () => {
    setEditingVisit(null)
    setDevelopmentId(""); setClientId(""); setBrokerId(userRole === "BROKER" && brokers.length > 0 ? brokers[0].id : "")
    setScheduledAt(selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"))
    setDuration(30); setNotes(""); setStatus("AGENDADA")
    setIsEditMode(false); setIsModalOpen(true)
  }

  const openEdit = (visit: any) => {
    setEditingVisit(visit)
    setDevelopmentId(visit.developmentId || ""); setClientId(visit.clientId); setBrokerId(visit.brokerId)
    setScheduledAt(format(new Date(visit.scheduledAt), "yyyy-MM-dd'T'HH:mm"))
    setDuration(visit.duration || 30); setNotes(visit.notes || ""); setStatus(visit.status)
    setIsEditMode(true); setIsModalOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (!developmentId || !clientId || !brokerId || !scheduledAt) {
        alert("Preencha todos os campos obrigatórios")
        setIsSaving(false)
        return
      }
      await saveVisit({
        id: editingVisit?.id,
        developmentId: developmentId || null, 
        clientId, 
        brokerId, 
        scheduledAt, 
        duration, 
        notes, 
        status
      })
      setIsModalOpen(false)
      window.location.reload()
    } catch (e) {
      console.error(e)
      alert("Erro ao salvar visita")
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta visita?")) {
      await deleteVisit(id)
      window.location.reload()
    }
  }

  const selectedDayVisits = selectedDate ? getVisitsForDay(selectedDate) : []

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between mb-8 w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Agenda de Visitas</h1>
          <p className="text-sm font-medium text-slate-400">Gerenciamento operacional de atendimentos e property tours.</p>
        </div>
        <button onClick={openNew} className="flex justify-center items-center gap-2 w-full lg:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 border border-blue-500/50">
          <Plus className="w-5 h-5" /> Nova Visita
        </button>
        <button 
          onClick={async () => {
            setIsSendingReminders(true)
            setReminderResult(null)
            try {
              const results = await sendVisitReminders()
              const successful = results.filter((r: any) => r.success).length
              const total = results.length
              setReminderResult({
                success: successful > 0,
                message: total > 0 
                  ? `${successful}/${total} lembretes enviados com sucesso!`
                  : "Nenhuma visita agendada para hoje"
              })
            } catch (e) {
              setReminderResult({
                success: false,
                message: "Erro ao enviar lembretes"
              })
            }
            setIsSendingReminders(false)
          }} 
          disabled={isSendingReminders}
          className="flex justify-center items-center gap-2 w-full lg:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wide px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95 border border-emerald-500/50 disabled:opacity-50"
        >
          {isSendingReminders ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bell className="w-5 h-5" />}
          {isSendingReminders ? "Enviando..." : "Enviar Lembretes"}
        </button>
      </div>

      {reminderResult && (
        <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border ${
          reminderResult.success 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {reminderResult.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{reminderResult.message}</span>
        </div>
      )}

      <div className="flex flex-col 2xl:flex-row gap-6 flex-1 min-h-0">
        <div className="flex-1 bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-800/60 p-6 shadow-2xl overflow-y-auto custom-scrollbar">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between mb-6 w-full">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-white">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h2>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest">Hoje</button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-800/50 rounded-xl overflow-hidden border border-slate-800">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="bg-slate-950/50 p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{day}</div>
            ))}
            {calendarDays.map((day, idx) => {
              const dayVisits = getVisitsForDay(day)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isSelected = selectedDate && isSameDay(day, selectedDate)

              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[100px] bg-slate-900/80 p-2 cursor-pointer transition-all hover:bg-slate-800/50 ${!isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'bg-blue-900/20 ring-2 ring-blue-500/50' : ''}`}
                >
                  <div className={`text-sm font-bold mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayVisits.slice(0, 3).map((v: any) => (
                      <div key={v.id} className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate ${STATUS_COLORS[v.status] || 'bg-slate-800 text-slate-400'}`}>
                        {format(new Date(v.scheduledAt), 'HH:mm')} - {v.client?.name}
                      </div>
                    ))}
                    {dayVisits.length > 3 && <div className="text-[10px] text-slate-500 text-center">+{dayVisits.length - 3}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="w-full 2xl:w-96 bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-800/60 p-6 shadow-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800/60">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">
              {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Selecione um dia"}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            {selectedDate ? (
              selectedDayVisits.length > 0 ? (
                selectedDayVisits.map((visit: any) => (
                  <div key={visit.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between mb-3 w-full">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${STATUS_COLORS[visit.status] || 'bg-slate-800 text-slate-400'}`}>
                        {visit.status}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(visit)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-400 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(visit.id)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {format(new Date(visit.scheduledAt), 'HH:mm')} - {visit.duration}min
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <User className="w-4 h-4" />
                        {visit.client?.name}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Home className="w-4 h-4" />
                        {visit.development?.name || visit.property?.title || 'Sem empreendimento'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <MapPin className="w-4 h-4" />
                        {visit.development?.city || visit.property?.address || '-'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                  <Calendar className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500 font-medium">Nenhuma visita nesta data</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <Calendar className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 font-medium">Clique em um dia para ver as visitas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#02040a]/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-slate-800/60 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between p-6 border-b border-slate-800/60 bg-slate-950/40 w-full">
              <h2 className="text-xl font-bold text-white">{isEditMode ? "Editar Visita" : "Nova Visita"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Empreendimento</label>
                  <select value={developmentId} onChange={e => setDevelopmentId(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white appearance-none cursor-pointer">
                    <option value="">Selecione...</option>
                    {developments.map((d: any) => <option key={d.id} value={d.id}>{d.name} ({d.builder})</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Cliente</label>
                  <select value={clientId} onChange={e => setClientId(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white appearance-none cursor-pointer">
                    <option value="">Selecione...</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Corretor</label>
                  <select value={brokerId} onChange={e => setBrokerId(e.target.value)} disabled={userRole === "BROKER"} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white appearance-none cursor-pointer disabled:opacity-50">
                    <option value="">Selecione...</option>
                    {brokers.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white appearance-none cursor-pointer">
                    <option value="AGENDADA">Agendada</option>
                    <option value="CONFIRMADA">Confirmada</option>
                    <option value="REALIZADA">Realizada</option>
                    <option value="CANCELADA">Cancelada</option>
                    <option value="REMARCADA">Remarcada</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Data/Hora</label>
                  <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Duração (min)</label>
                  <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-slate-400">Observações</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white resize-none" placeholder="Detalhes da visita..." />
              </div>
            </div>
            <div className="p-6 border-t border-slate-800/60 bg-slate-950/40 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-all">Cancelar</button>
              <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditMode ? "Salvar" : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.4); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(51, 65, 85, 0.8); }
      `}} />
    </div>
  )
}
