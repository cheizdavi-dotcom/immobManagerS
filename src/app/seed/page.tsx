
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export default async function SeedPage() {
  const email = "admin@immob.com"
  const exists = await prisma.user.findUnique({ where: { email } })
  if (!exists) {
    const hashedPassword = await bcrypt.hash("123456", 10)
    await prisma.user.create({
      data: {
        email,
        name: "Gestor Master",
        password: hashedPassword,
        role: "ADMIN",
      }
    })
  }

  return (
    <div className="p-8 bg-slate-950 text-white min-h-screen">
      <h1 className="text-3xl text-emerald-400 font-bold mb-4">Banco de dados Populado!</h1>
      <p>O administrador <strong>admin@immob.com</strong> (Senha: 123456) foi criado.</p>
      <a href="/login" className="inline-block mt-4 bg-blue-600 px-4 py-2 rounded text-white font-semibold">Ir para o Login</a>
    </div>
  )
}
