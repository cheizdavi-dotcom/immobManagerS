"use client"
import { useState } from "react"
import { ShieldCheck, UserCircle, Settings2, Webhook, BellRing, Save, Key, Mail, Link2, Smartphone, Loader2, CheckCircle2, X } from "lucide-react"
import { saveGlobalSettings } from "../../actions"

type ApiType = 'wpp' | 'meta' | 'rd' | null;

export default function ConfiguracoesClient({ userSession, settings }: { userSession: any, settings: any }) {
  const [activeTab, setActiveTab] = useState<'geral' | 'comissao' | 'api' | 'notificacao'>('geral')
  const [isSaving, setIsSaving] = useState(false)

  // Local State Form
  const [companyName, setCompanyName] = useState(settings?.companyName || userSession?.name || "")
  const [cnpj, setCnpj] = useState(settings?.cnpj || "")
  
  const [house, setHouse] = useState<number>(settings?.houseCommission || 40)
  const [broker, setBroker] = useState<number>(settings?.brokerCommission || 60)

  const [whatsapp, setWhatsapp] = useState(settings?.whatsappActive || false)
  const [whatsappToken, setWhatsappToken] = useState(settings?.whatsappToken || "")

  const [meta, setMeta] = useState(settings?.metaActive || false)
  const [metaPixelId, setMetaPixelId] = useState(settings?.metaPixelId || "")

  const [rd, setRd] = useState(settings?.rdStationActive || false)
  const [rdStationToken, setRdStationToken] = useState(settings?.rdStationToken || "")

  const [aLead, setALead] = useState(settings?.alertNewLead ?? true)
  const [aSig, setASig] = useState(settings?.alertSignature ?? true)
  const [aDef, setADef] = useState(settings?.alertDefault ?? false)
  const [aLost, setALost] = useState(settings?.alertLost ?? false)

  const [apiModal, setApiModal] = useState<ApiType>(null)
  const [tempToken, setTempToken] = useState("")

  const handleHouseChange = (val: number) => { setHouse(val); setBroker(100 - val); }
  const handleBrokerChange = (val: number) => { setBroker(val); setHouse(100 - val); }

  const handleSave = async (silent = false) => {
    if(!silent) setIsSaving(true);
    try {
      await saveGlobalSettings({
        companyName, cnpj, houseCommission: house, brokerCommission: broker,
        whatsappActive: whatsapp, whatsappToken,
        metaActive: meta, metaPixelId,
        rdStationActive: rd, rdStationToken,
        alertNewLead: aLead, alertSignature: aSig, alertDefault: aDef, alertLost: aLost
      })
      if(!silent) alert("Configurações Globais gravadas na Matriz com sucesso!")
    } catch(e) {
      if(!silent) alert("Erro ao sincronizar. O Motor SQLite pode estar bloqueado.")
      console.error(e)
    }
    if(!silent) setIsSaving(false);
  }

  const handleApiConnect = (type: ApiType) => {
     let existingToken = ""
     if (type === 'wpp') existingToken = whatsappToken
     if (type === 'meta') existingToken = metaPixelId
     if (type === 'rd') existingToken = rdStationToken
     setTempToken(existingToken || "")
     setApiModal(type)
  }

  const handleApiDisconnect = (type: ApiType) => {
     if(confirm("Você perderá o fluxo imediato de Webhooks desta automação. Tem certeza?")) {
        if(type === 'wpp') { setWhatsapp(false); setWhatsappToken(""); }
        if(type === 'meta') { setMeta(false); setMetaPixelId(""); }
        if(type === 'rd') { setRd(false); setRdStationToken(""); }
        setTimeout(() => handleSave(true), 100)
     }
   }

  const saveApiModal = async () => {
    if(apiModal === 'wpp') { setWhatsapp(true); setWhatsappToken(tempToken); }
    if(apiModal === 'meta') { setMeta(true); setMetaPixelId(tempToken); }
    if(apiModal === 'rd') { setRd(true); setRdStationToken(tempToken); }
    setApiModal(null)
    setTempToken("")
    setIsSaving(true);
    setTimeout(() => {
       handleSave(false); 
    }, 200) // Small delay to allow react state propagation before submitting to prisma
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-[1200px] mx-auto w-full relative">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between mb-8 w-full">
        <div className="flex gap-4 items-center relative group">
           <div className="absolute top-1/2 left-0 -translate-y-1/2 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all pointer-events-none"></div>
           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-inner relative z-10">
              <Settings2 className="w-8 h-8 text-blue-400" />
           </div>
           <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Ajustes da Base</h1>
              <p className="text-sm font-medium text-slate-400">Parametrização do motor central do seu hub imobiliário.</p>
           </div>
        </div>
        <button onClick={() => handleSave(false)} disabled={isSaving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide px-6 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 border border-blue-500/50 disabled:opacity-50 z-10">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Implantar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 relative">
         <div className="lg:col-span-3 space-y-2">
            {[
              { id: 'geral', icon: UserCircle, title: 'Identificação Mestra', desc: 'Dados e senhas master' },
              { id: 'comissao', icon: Link2, title: 'Termos de Negócio', desc: 'Taxas globais e repasses' },
              { id: 'api', icon: Webhook, title: 'APIs & Conexões', desc: 'Sincronizador externo' },
              { id: 'notificacao', icon: BellRing, title: 'Matriz de Alertas', desc: 'Eventos de interrupção' },
            ].map(tab => {
               const Icon = tab.icon;
               const active = activeTab === tab.id;
               return (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${active ? 'bg-slate-900/80 border-blue-500/30 shadow-inner' : 'bg-transparent border-transparent hover:bg-slate-900/40 hover:border-slate-800'}`}
                 >
                   {active && <div className="absolute left-0 top-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>}
                   <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}>
                         <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                         <span className={`text-sm font-bold tracking-wide ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{tab.title}</span>
                         <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">{tab.desc}</span>
                      </div>
                   </div>
                 </button>
               )
            })}
         </div>

         <div className="lg:col-span-9 bg-slate-900/30 backdrop-blur-2xl rounded-3xl border border-slate-800/60 p-4 lg:p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
             
             {activeTab === 'geral' && (
               <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-800/60 pb-4">
                     <ShieldCheck className="w-5 h-5 text-blue-400" />
                     <h2 className="text-xl font-bold tracking-tight text-white">Centro de Identidade Organizacional</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="flex flex-col gap-2.5">
                         <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Nome da Operação (Master)</label>
                         <input type="text" value={companyName} onChange={e=>setCompanyName(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-all shadow-inner" />
                     </div>
                     <div className="flex flex-col gap-2.5">
                         <label className="text-xs font-bold tracking-widest uppercase text-slate-400">E-mail Administrativo</label>
                         <input type="text" disabled defaultValue={userSession?.email || "admin@base.com"} className="w-full bg-slate-950/80 border border-slate-800/50 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-500 shadow-inner cursor-not-allowed" />
                     </div>
                     <div className="flex flex-col gap-2.5">
                         <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Registro CNPJ ou CRECI-J</label>
                         <input type="text" value={cnpj} onChange={e=>setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-all shadow-inner" />
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'comissao' && (
               <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-800/60 pb-4">
                     <Link2 className="w-5 h-5 text-emerald-400" />
                     <h2 className="text-xl font-bold tracking-tight text-white">Parâmetros de Split e Regras Fiduciárias</h2>
                  </div>
                  <div className="bg-slate-950/40 rounded-2xl p-6 border border-slate-800/50 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                     <p className="text-sm text-slate-400 leading-relaxed mb-6 relative z-10">Configure aqui o padrão global de retenção da Imobiliária (House) e o teto máximo de repasse do Corretor. Esse molde base será puxado toda vez que criarem uma Nova Venda no CRM.</p>
                     <div className="grid grid-cols-2 gap-8 relative z-10">
                         <div className="space-y-4">
                             <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Taxa Retida Pelo Motor (House %)</label>
                             <div className="flex items-center gap-4 border border-slate-800/80 rounded-xl p-3 bg-slate-900">
                                <input type="range" min="0" max="100" value={house} onChange={e=>handleHouseChange(Number(e.target.value))} className="w-full accent-emerald-500" />
                                <span className="font-bold text-emerald-400 min-w-[50px] text-right">{house.toFixed(1)}%</span>
                             </div>
                         </div>
                         <div className="space-y-4">
                             <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Repasse MÃ¡ximo Corretor (Broker %)</label>
                             <div className="flex items-center gap-4 border border-slate-800/80 rounded-xl p-3 bg-slate-900">
                                <input type="range" min="0" max="100" value={broker} onChange={e=>handleBrokerChange(Number(e.target.value))} className="w-full accent-blue-500" />
                                <span className="font-bold text-blue-400 min-w-[50px] text-right">{broker.toFixed(1)}%</span>
                             </div>
                         </div>
                     </div>
                     <div className="mt-8 pt-4 border-t border-slate-800/50 flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center relative z-10">
                        <span className="text-sm font-medium text-slate-500">Divisão Operacional Simétrica Constante</span>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${(house+broker) === 100 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                           <CheckCircle2 className={`w-4 h-4 ${(house+broker) === 100 ? 'text-emerald-400' : 'text-red-400'}`} />
                           <span className={`text-xs font-bold uppercase tracking-wider ${(house+broker) === 100 ? 'text-emerald-400' : 'text-red-400'}`}>Matemática Consolidada ({house+broker}%)</span>
                        </div>
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'api' && (
               <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-800/60 pb-4">
                     <Webhook className="w-5 h-5 text-purple-400" />
                     <h2 className="text-xl font-bold tracking-tight text-white">Hub de Distribuição e Integradores</h2>
                  </div>
                  <div className="space-y-4 relative z-10">
                     <IntegrationCard 
                        name="API Oficial do WhatsApp Business" 
                        status={whatsapp ? 'connected' : 'disconnected'} 
                        onConnect={() => handleApiConnect('wpp')}
                        onDisconnect={() => handleApiDisconnect('wpp')}
                        desc="Habilite o envio automático de contratos assinados direto pro WhatsApp do cliente."
                        icon={<Smartphone className="w-5 h-5" />} 
                     />
                     <IntegrationCard 
                        name="Meta Facebook Leads" 
                        status={meta ? 'connected' : 'disconnected'} 
                        onConnect={() => handleApiConnect('meta')}
                        onDisconnect={() => handleApiDisconnect('meta')}
                        desc="Sincronizador constante. Todos os leads que entram pelas campanhas caem direto na Base de Proponentes."
                        icon={<div className="font-bold text-lg">f</div>} 
                     />
                     <IntegrationCard 
                        name="RD Station Marketing Hub" 
                        status={rd ? 'connected' : 'disconnected'} 
                        onConnect={() => handleApiConnect('rd')}
                        onDisconnect={() => handleApiDisconnect('rd')}
                        desc="Mantenha a Automação de E-mails ativa baseada nas Temperaturas (Quente/Frio)."
                        icon={<Mail className="w-5 h-5" />} 
                     />
                  </div>
               </div>
             )}

             {activeTab === 'notificacao' && (
               <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-800/60 pb-4">
                     <BellRing className="w-5 h-5 text-amber-400" />
                     <h2 className="text-xl font-bold tracking-tight text-white">Governança de Avisos Globais</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ToastCard title="Notificação de Lead Novo" desc="E-mail instantâneo para o diretor" active={aLead} onChange={setALead} />
                      <ToastCard title="Assinatura Imobiliária" desc="Venda movida para 'Assinatura'" active={aSig} onChange={setASig} />
                      <ToastCard title="Alerta de Inadimplência" desc="Atraso sinalizado no Financeiro" active={aDef} onChange={setADef} />
                      <ToastCard title="Venda Faturada (Lost)" desc="Quando marcarmos um Negócio Perdido" active={aLost} onChange={setALost} />
                  </div>
               </div>
             )}
         </div>
      </div>

      {apiModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 min-h-screen">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between p-6 border-b border-slate-800 bg-slate-900/50 w-full">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                   <Webhook className="w-5 h-5 text-blue-400" />
                   Configurar Motor: {apiModal === 'wpp' ? 'WhatsApp' : apiModal === 'meta' ? 'Facebook Pixels' : 'RD Station'}
                </h3>
                <button onClick={() => setApiModal(null)} className="p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-slate-800">
                   <X className="w-5 h-5" />
                </button>
             </div>
             <div className="p-8">
                <div className="space-y-4">
                   <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Token de Acesso / Auth Key</label>
                   <input type="text" placeholder="Cole aqui seu token gerado..." value={tempToken} onChange={(e) => setTempToken(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono" />
                   <p className="text-xs text-slate-500 mt-2 font-medium">As chaves inseridas aqui são cacheadas via TLS 256-bit no SQLite Master antes de serem comutadas na Edge.</p>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                   <button onClick={() => setApiModal(null)} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancelar</button>
                   <button onClick={saveApiModal} disabled={tempToken.trim().length < 5} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 flex items-center gap-2">
                       <Link2 className="w-4 h-4" /> Autorizar Conexão
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

function IntegrationCard({ name, status, desc, icon, onConnect, onDisconnect }: any) {
   const isConnected = status === 'connected';
   return (
      <div className={`flex items-center gap-6 p-5 rounded-2xl border transition-all ${isConnected ? 'bg-slate-900 border-slate-800' : 'bg-slate-950/40 border-slate-800/50 opacity-80'}`}>
         <div className={`p-4 rounded-xl ${isConnected ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
            {icon}
         </div>
         <div className="flex-1">
            <h4 className="text-base font-bold text-white mb-1 tracking-wide flex items-center gap-3">
               {name}
               {isConnected ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] uppercase tracking-widest border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Sincronizado</span>
               ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[9px] uppercase tracking-widest border border-slate-700">Offline</span>
               )}
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">{desc}</p>
         </div>
         <div>
            {isConnected ? (
               <button onClick={onDisconnect} className="px-4 py-2 border border-slate-700 rounded-lg text-xs font-bold text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all hover:bg-red-500/10 active:scale-95">Desconectar Motor</button>
            ) : (
               <button onClick={onConnect} className="px-4 py-2 border border-blue-500/50 bg-blue-600/10 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.1)] hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95">Plugar API Connect</button>
            )}
         </div>
      </div>
   )
}

function ToastCard({ title, desc, active, onChange }: any) {
  return (
    <div className={`p-5 rounded-2xl border cursor-pointer transition-all ${active ? 'bg-slate-900 border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.05)]' : 'bg-slate-950/40 border-slate-800/60'}`} onClick={() => onChange(!active)}>
       <div className="flex items-start justify-between">
          <div>
            <h4 className={`text-sm font-bold tracking-wide mb-1 transition-colors ${active ? 'text-white' : 'text-slate-400'}`}>{title}</h4>
            <p className="text-xs text-slate-500 font-medium">{desc}</p>
          </div>
          <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${active ? 'bg-blue-500' : 'bg-slate-800'}`}>
             <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
       </div>
    </div>
  )
}


