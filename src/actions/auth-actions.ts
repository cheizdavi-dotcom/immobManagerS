"use server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const name = formData.get("name") as string
  const email = (formData.get("email") as string).toLowerCase()
  const password = formData.get("password") as string
  
  if (!email || !password || !name) {
    return { error: "Preencha todos os campos" }
  }
  
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "Este email já está cadastrado." }
  }
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "MANAGER"
    }
  })
  
  return { success: true }
}
