"use client"
import { useState, useEffect } from "react"
import { LayoutGrid, List, Plus, Search, ChevronDown, ChevronUp, Edit, Trash2, CalendarDays, Filter, Users, Building, X, Loader2, FileText } from "lucide-react"
import { format } from "date-fns"
import React from "react"
import { saveSale, deleteSale } from "../../actions"
import { generateSalePDF } from "@/lib/generatePDF"

export default function VendasClient({ sales, developments, clients, brokers, userRole }: { sales: any[], developments: any[], clients: any[], brokers: any[], userRole?: string }) {
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Formulário State
  const [activeId, setActiveId] = useState("")
  const [clientId, setClientId] = useState("")
  const [brokerId, setBrokerId] = useState("")
  const [developmentId, setDevelopmentId] = useState("")
  const [amount, setAmount] = useState(0)
  const [commissionRate, setCommissionRate] = useState(0)
  const [commissionValue, setCommissionValue] = useState(0)
  const [downPayment, setDownPayment] = useState(0)
  const [status, setStatus] = useState("PROSPECT")
  const [nextStepDate, setNextStepDate] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const calc = (amount * commissionRate) / 100
    setCommissionValue(calc)
  }, [amount, commissionRate])

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!clientId || !brokerId || !developmentId || !amount) {
        alert("Preencha todos os campos obrigatórios primeiro.");
        setIsSaving(false);
        return;
      }
      await saveSale({
        id: activeId || undefined,
        amount, commissionRate, commissionValue, downPayment, status,
        nextStepDate, notes, clientId, brokerId, developmentId
      });
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar os dados.");
    }
    setIsSaving(false);
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja apagar essa venda permanentemente?")) {
      await deleteSale(id);
    }
  }

  const openNew = () => {
    setActiveId(""); setClientId(""); setBrokerId(userRole === "BROKER" && brokers.length > 0 ? brokers[0].id : ""); setDevelopmentId("");
    setAmount(0); setCommissionRate(0); setCommissionValue(0); setDownPayment(0);
    setStatus("PROSPECT"); setNextStepDate(""); setNotes("");
    setIsEditMode(false);
    setIsModalOpen(true);
  }

  const openEdit = (sale: any) => {
    setActiveId(sale.id); setClientId(sale.clientId); setBrokerId(sale.brokerId); setDevelopmentId(sale.developmentId);
    setAmount(sale.amount); setCommissionRate(sale.commissionRate); setCommissionValue(sale.commissionValue); setDownPayment(sale.downPayment);
    setStatus(sale.status); setNextStepDate(sale.nextStepDate ? format(new Date(sale.nextStepDate), "yyyy-MM-dd") : ""); setNotes(sale.notes || "");
    setIsEditMode(true);
    setIsModalOpen(true);
  }

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id)

  const money = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  
  const handleCurrencyInput = (val: string, setter: (n: number) => void) => {
    const digits = val.replace(/\D/g, "");
    setter(Number(digits) / 100);
  }

  const formatInputCurrency = (val: number) => {
    if (val === 0) return "";
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  }

  const filteredSales = sales.filter(s => s.client?.name?.toLowerCase().includes(search.toLowerCase()) || s.development?.name?.toLowerCase().includes(search.toLowerCase()))

  const getStatusBadge = (statusLabel: string) => {
    switch (statusLabel) {
      case 'PROSPECT': return <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-800/80 text-slate-400 border border-slate-700/50 shadow-inner">Prospecção</span>
      case 'ANALISE_CREDITO': return <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">Análise</span>
      case 'ASSINATURA': return <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">Assinatura</span>
      case 'WON': return <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Concluída</span>
      case 'LOST': return <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">Cancelada</span>
      default: return <span>{statusLabel}</span>
    }
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-[1500px] mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
         {/* CABEÇALHO */}
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Vendas Realizadas</h1>
           <p className="text-sm font-medium text-slate-400">Gerenciamento avançado de fluxo e contratos imobiliários.</p>
        </div>
        <div className="flex items-center gap-4">
           {/* VIEW TABS */}
           <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 flex rounded-xl shadow-inner backdrop-blur-sm">
             <button onClick={() => setView('table')} className={`p-2.5 rounded-lg transition-all duration-300 ${view === 'table' ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}>
               <List className="w-4 h-4" />
             </button>
             <button onClick={() => setView('kanban')} className={`p-2.5 rounded-lg transition-all duration-300 ${view === 'kanban' ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}>
               <LayoutGrid className="w-4 h-4" />
             </button>
           </div>
           <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 border border-blue-500/50">
             <Plus className="w-5 h-5" /> Nova Venda
           </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 backdrop-blur-xl shadow-2xl">
         <div className="flex items-center justify-center p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 text-slate-400">
            <Filter className="w-5 h-5" />
         </div>
         <div className="relative group flex-1 max-w-md">
           <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
           <input type="text" placeholder="Pesquisar por Cliente, Empreendimento ou CPF..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all font-medium placeholder:font-normal placeholder:text-slate-600 shadow-inner" />
         </div>
      </div>

      {view === 'table' ? (
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800/60 overflow-hidden flex-1 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead className="bg-slate-950/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-5">Data</th>
                  <th className="px-6 py-5">Corretor</th>
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5">Empreendimento</th>
                  <th className="px-6 py-5 text-right">VGV / Venda</th>
                  <th className="px-6 py-5 text-right">Ato (Entrada)</th>
                  <th className="px-6 py-5 text-right">Comissão Real</th>
                  <th className="px-6 py-5 text-center">Status Interno</th>
                  <th className="px-6 py-5 text-center">Editar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredSales.map((sale) => (
                  <React.Fragment key={sale.id}>
                    <tr className={`hover:bg-slate-800/30 transition-all duration-300 group cursor-pointer ${expandedId === sale.id ? 'bg-slate-800/40 shadow-inner' : ''}`}>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-400 font-medium border-l-2 border-l-transparent group-hover:border-l-blue-500/50 flex items-center gap-3" onClick={() => toggleExpand(sale.id)}>
                        <div className={`p-1 rounded-md transition-colors ${expandedId === sale.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/80 text-slate-500'}`}>
                           {expandedId === sale.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        {format(new Date(sale.createdAt), "dd/MM/yyyy")}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-300 font-semibold" onClick={() => toggleExpand(sale.id)}>{sale.broker?.name || "—"}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-white flex items-center gap-2" onClick={() => toggleExpand(sale.id)}>
                         <div className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-blue-500 transition-colors"></div>
                         {sale.client?.name || "—"}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-400 font-medium" onClick={() => toggleExpand(sale.id)}>
                         <div className="flex flex-col">
                            <span className="text-slate-300 font-semibold">{sale.development?.name || "—"}</span>
                            <span className="text-[10px] uppercase tracking-wider opacity-60 mt-0.5">{sale.development?.builder || "Construtora Genérica"}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-300 font-semibold text-right" onClick={() => toggleExpand(sale.id)}>{money(sale.amount)}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-400 font-semibold text-right" onClick={() => toggleExpand(sale.id)}>{money(sale.downPayment || 0)}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-right text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-600" onClick={() => toggleExpand(sale.id)}>{money(sale.commissionValue)}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-center" onClick={() => toggleExpand(sale.id)}>
                         {getStatusBadge(sale.status)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center text-slate-500">
                          {/* ACTION BUTTONS HOOKED TO STATE */}
                          <div className="flex items-center justify-center gap-3 transition-all duration-300">
                             <button onClick={(e) => { e.stopPropagation(); generateSalePDF(sale); }} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg transition-colors border border-emerald-500/20 hover:border-emerald-500/40 shadow-sm" title="Gerar PDF"><FileText className="w-4 h-4" /></button>
                             <button onClick={(e) => { e.stopPropagation(); openEdit(sale); }} className="p-2 bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-400 rounded-lg transition-colors border border-slate-700/50 hover:border-blue-500/30 shadow-sm" title="Editar Venda"><Edit className="w-4 h-4" /></button>
                             <button onClick={(e) => handleDelete(sale.id, e)} className="p-2 bg-slate-800/80 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors border border-slate-700/50 hover:border-red-500/30 shadow-sm" title="Apagar"><Trash2 className="w-4 h-4" /></button>
                          </div>
                      </td>
                    </tr>
                    {expandedId === sale.id && (
                      <tr className="bg-slate-950/60 backdrop-blur-md relative">
                        <td colSpan={9} className="px-8 py-6 border-l-2 border-l-blue-500/80 border-b border-slate-800/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                             <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-inner">
                               <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                  <LayoutGrid className="w-4 h-4 text-blue-500/70" /> Resumo Operacional
                               </p>
                               <p className="text-slate-300 text-sm leading-relaxed">{sale.notes || <span className="text-slate-600 italic">Dossiê ausente nesta operação.</span>}</p>
                             </div>
                             <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                               <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2 relative z-10">
                                  <CalendarDays className="w-4 h-4 text-emerald-500/70" /> Próximo Passo do Funil
                               </p>
                               <p className="text-slate-300 text-sm leading-relaxed relative z-10">{sale.nextStep || <span className="text-slate-600 italic">Fluxo passivo aguardando interação.</span>}</p>
                               {sale.nextStepDate && (
                                  <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg relative z-10">
                                     <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                     <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Alvo: {format(new Date(sale.nextStepDate), "dd/MM/yyyy")}</span>
                                  </div>
                               )}
                             </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-slate-900/40 backdrop-blur-2xl border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-500 shadow-2xl relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
           <LayoutGrid className="w-16 h-16 mb-6 text-blue-500/30" />
           <p className="text-2xl font-bold text-white mb-2 tracking-tight">Quadro Kanban</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#02040a]/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
           
           <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-slate-800/60 rounded-[2rem] shadow-2xl shadow-black/80 w-full max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"></div>
              
              <div className="flex items-center justify-between p-8 border-b border-slate-800/60 bg-slate-950/40">
                 <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                       <div className="w-2.5 h-8 bg-blue-500 rounded-full"></div>
                       {isEditMode ? "Editar Venda" : "Nova Venda"}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1.5 font-medium ml-5">{isEditMode ? "Altere os detalhes e valores operacionais." : "Cadastre o funil, valores e detalhes do repasse."}</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800 transition-all shadow-inner"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                 <form className="space-y-8 flex flex-col" onSubmit={e => e.preventDefault()}>
                    
                    <div className="bg-slate-950/40 rounded-2xl p-6 border border-slate-800/50 space-y-6 shadow-inner relative overflow-hidden group">
                       <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-blue-500/10"></div>
                       <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-800/50 pb-3 relative z-10"><Users className="w-4 h-4 text-blue-500/70" /> Relacionamento</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                          <div className="flex flex-col gap-2.5">
                              <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Cliente / Comprador</label>
                              <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner placeholder:text-slate-600 appearance-none cursor-pointer">
                                 <option value="">Selecione um Cliente...</option>
                                 {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                          </div>
                          <div className="flex flex-col gap-2.5">
                              <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Corretor Responsável</label>
                              <select value={brokerId} onChange={e => setBrokerId(e.target.value)} disabled={userRole === "BROKER"} className="disabled:opacity-50 w-full bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner placeholder:text-slate-600 appearance-none cursor-pointer">
                                 <option value="">Selecione um Corretor...</option>
                                 {brokers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-950/40 rounded-2xl p-6 border border-slate-800/50 space-y-6 shadow-inner relative overflow-hidden group">
                       <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-emerald-500/10"></div>
                       <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-800/50 pb-3 relative z-10"><Building className="w-4 h-4 text-emerald-500/70" /> Produto & Valores</h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                          <div className="flex flex-col gap-2.5 md:col-span-2">
                              <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Empreendimento (Unidade)</label>
                              <select value={developmentId} onChange={e => setDevelopmentId(e.target.value)} className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent transition-all shadow-inner appearance-none cursor-pointer">
                                 <option value="">Qual empreendimento fechou a venda?</option>
                                 {developments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.builder})</option>)}
                              </select>
                          </div>

                          <div className="flex flex-col gap-2.5">
                              <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Valor da Venda (VGV)</label>
                              <div className="relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                                 <input type="text" value={formatInputCurrency(amount)} onChange={e => handleCurrencyInput(e.target.value, setAmount)} placeholder="0,00" className="w-full bg-slate-900 border border-slate-800/80 rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent transition-all shadow-inner" />
                              </div>
                          </div>
                          <div className="flex flex-col gap-2.5">
                              <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Entrada (Ato)</label>
                              <div className="relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                                 <input type="text" value={formatInputCurrency(downPayment)} onChange={e => handleCurrencyInput(e.target.value, setDownPayment)} placeholder="0,00" className="w-full bg-slate-900 border border-slate-800/80 rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent transition-all shadow-inner" />
                              </div>
                          </div>

                          <div className="flex flex-col gap-2.5">
                              <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Comissão (%)</label>
                              <div className="relative">
                                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                                 <input type="number" value={commissionRate || ''} onChange={e => setCommissionRate(parseFloat(e.target.value) || 0)} placeholder="5" step="0.1" className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent transition-all shadow-inner" />
                              </div>
                          </div>
                          
                          <div className="flex flex-col gap-2.5">
                              <label className="text-xs font-bold tracking-widest uppercase text-slate-400 text-emerald-400">Comissão Calculada</label>
                              <div className="relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/60 font-bold">R$</span>
                                 <input type="text" value={formatInputCurrency(commissionValue)} onChange={e => handleCurrencyInput(e.target.value, setCommissionValue)} placeholder="0,00" className="w-full bg-slate-900/50 border border-emerald-500/30 rounded-xl pl-12 pr-4 py-3.5 text-sm font-black text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent transition-all shadow-[0_0_15px_rgba(16,185,129,0.05)]" />
                              </div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-950/40 rounded-2xl p-6 border border-slate-800/50 space-y-6 shadow-inner relative overflow-hidden group">
                       <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-purple-500/10"></div>
                       <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-800/50 pb-3 relative z-10"><LayoutGrid className="w-4 h-4 text-purple-500/70" /> Acompanhamento de Pós-Venda</h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                           <div className="flex flex-col gap-2.5">
                              <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Estágio no Funil</label>
                              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-transparent transition-all cursor-pointer shadow-inner appearance-none">
                                 <option value="PROSPECT">Prospecção</option>
                                 <option value="ANALISE_CREDITO">Análise de Crédito / SPC</option>
                                 <option value="ASSINATURA">Em Assinatura / Título</option>
                                 <option value="WON">Conversão Homologada (Concluída)</option>
                                 <option value="LOST">Cancelada (Lost)</option>
                              </select>
                           </div>
                           <div className="flex flex-col gap-2.5">
                              <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Data do Próximo Passo</label>
                              <input type="date" value={nextStepDate} onChange={e => setNextStepDate(e.target.value)} className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-400 focus:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-transparent transition-all shadow-inner" style={{ colorScheme: 'dark' }} />
                           </div>
                       </div>

                       <div className="flex flex-col gap-2.5 relative z-10">
                           <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Observações Gerais</label>
                           <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Anote pormenores, combinados com o cliente e pendências de entrega de documentos..." className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-transparent transition-all shadow-inner resize-none placeholder:text-slate-600/70 leading-relaxed"></textarea>
                       </div>
                    </div>
                 </form>
              </div>
              
              <div className="p-8 border-t border-slate-800/60 bg-slate-900/80 flex justify-end gap-5 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative z-10">
                 <button onClick={() => setIsModalOpen(false)} className="px-8 py-3.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">Cancelar</button>
                 <button onClick={handleSave} disabled={isSaving} className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex items-center gap-2 border border-blue-500/50 relative overflow-hidden group">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    {isSaving ? <Loader2 className="w-5 h-5 relative z-10 animate-spin"/> : (isEditMode ? <Edit className="w-5 h-5 relative z-10"/> : <Plus className="w-5 h-5 relative z-10" />)}
                    <span className="relative z-10 tracking-wide">{isEditMode ? "Salvar Alterações" : "Cadastrar Venda"}</span>
                 </button>
              </div>
           </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(51, 65, 85, 0.8); }
      `}} />
    </div>
  )
}


