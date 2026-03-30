import { Building2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import RegisterForm from "@/components/RegisterForm"

export default async function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f16] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f16] to-[#05080b]">
       <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
       
       <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 mb-6 transition-colors text-sm font-medium">
             <ArrowLeft className="w-4 h-4" /> Voltar para Login
          </Link>

          <div className="flex flex-col items-center justify-center mb-10 text-center relative">
             <div className="flex items-center gap-3 relative group mb-2">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 bg-gradient-to-br from-blue-600/20 to-blue-900/10 p-3 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                   <Building2 className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="relative z-10 text-4xl font-bold tracking-tight text-white">
                  Immob<span className="text-blue-500 font-black drop-shadow-[0_2px_15px_rgba(59,130,246,0.5)]">Manager</span>
                </h1>
             </div>
             <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide">Crie sua conta para acessar</p>
          </div>

          <RegisterForm />
          
          <div className="text-center mt-10 space-y-2 opacity-60 hover:opacity-100 transition-opacity">
             <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Operações de Alto Padrão.</p>
             <p className="text-xs font-medium text-slate-600">© 2026 ImmobManager OS. Todos os direitos reservados.</p>
          </div>
       </div>
    </div>
  )
}
