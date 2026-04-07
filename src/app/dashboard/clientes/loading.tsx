import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Carregando Dados...</p>
      </div>
    </div>
  )
}
