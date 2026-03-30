"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createSmartSale(formData: FormData) {
  // Extract base form data
  const amount = parseFloat(formData.get("amount") as string)
  const commissionRate = parseFloat(formData.get("commissionRate") as string)
  const brokerName = formData.get("brokerName") as string
  const clientName = formData.get("clientName") as string
  const developmentName = formData.get("developmentName") as string
  const adminEmail = formData.get("adminEmail") as string || "admin@immob.com" // Simplification for now

  // Business Logic: Smart find or create relations
  // 1. Find or create Broker
  let broker = await prisma.broker.findFirst({ where: { name: brokerName } })
  if (!broker) broker = await prisma.broker.create({ data: { name: brokerName } })

  // 2. Find or create Client
  let client = await prisma.client.findFirst({ where: { name: clientName } })
  if (!client) client = await prisma.client.create({ data: { name: clientName } })

  // 3. Find or create Development
  let development = await prisma.development.findFirst({ where: { name: developmentName } })
  if (!development) development = await prisma.development.create({ data: { name: developmentName, builder: "Generic" } })

  // 4. Get User
  const user = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!user) throw new Error("Usuário responsável (Admin) não encontrado.")

  // 5. Create Sale
  const commissionValue = amount * (commissionRate / 100)
  await prisma.sale.create({
    data: {
      amount,
      commissionRate,
      commissionValue,
      status: "PROSPECT",
      clientId: client.id,
      brokerId: broker.id,
      developmentId: development.id,
      userId: user.id
    }
  })

  // Force cache refresh
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/kanban")

  redirect("/dashboard/kanban")
}

export async function updateSaleStage(id: string, newStatus: string) {
  await prisma.sale.update({
    where: { id },
    data: { status: newStatus }
  })
  revalidatePath('/dashboard/kanban')
  revalidatePath('/dashboard')
}

export async function payCommission(formData: FormData) {
  const id = formData.get('id') as string
  await prisma.sale.update({
    where: { id },
    data: { isPaid: true }
  })
  revalidatePath('/dashboard/financeiro')
  revalidatePath('/dashboard')
}

export async function saveClient(data: { id?: string; name: string; phone?: string; cpf?: string; email?: string; status?: string; kanbanPhase?: string }) {
  if (data.id) {
    await prisma.client.update({
      where: { id: data.id },
      data: {
        name: data.name,
        phone: data.phone || null,
        cpf: data.cpf || null,
        email: data.email || null,
        status: data.status || "Morno",
        kanbanPhase: data.kanbanPhase || "NOVO"
      }
    })
  } else {
    await prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        cpf: data.cpf || null,
        email: data.email || null,
        status: data.status || "Morno",
        kanbanPhase: data.kanbanPhase || "NOVO"
      }
    })
  }
  revalidatePath('/dashboard/clientes')
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } })
  revalidatePath('/dashboard/clientes')
}

export async function updateClientPhase(id: string, kanbanPhase: string) {
  await prisma.client.update({
    where: { id },
    data: { kanbanPhase }
  })
  revalidatePath('/dashboard/clientes')
}
