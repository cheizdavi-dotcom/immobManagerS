"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

export async function saveClient(data: any) {
  if (data.id) {
    await prisma.client.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        status: data.status,
        kanbanPhase: data.kanbanPhase || "NOVO",
      }
    })
  } else {
    await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        status: data.status,
        kanbanPhase: data.kanbanPhase || "NOVO",
      }
    })
  }
  revalidatePath('/dashboard/clientes')
  return { success: true }
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } })
  revalidatePath('/dashboard/clientes')
  return { success: true }
}

export async function saveSale(data: any) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  if (data.id) {
    await prisma.sale.update({
      where: { id: data.id },
      data: {
        amount: data.amount,
        commissionRate: data.commissionRate,
        commissionValue: data.commissionValue,
        downPayment: data.downPayment,
        status: data.status,
        nextStepDate: data.nextStepDate ? new Date(data.nextStepDate) : null,
        notes: data.notes,
        clientId: data.clientId,
        brokerId: data.brokerId,
        developmentId: data.developmentId,
      }
    })
  } else {
    await prisma.sale.create({
      data: {
        amount: data.amount,
        commissionRate: data.commissionRate,
        commissionValue: data.commissionValue,
        downPayment: data.downPayment,
        status: data.status,
        nextStepDate: data.nextStepDate ? new Date(data.nextStepDate) : null,
        notes: data.notes,
        clientId: data.clientId,
        brokerId: data.brokerId,
        developmentId: data.developmentId,
        userId: userId,
      }
    })
  }
  revalidatePath('/dashboard/vendas')
  return { success: true }
}

export async function deleteSale(id: string) {
  await prisma.sale.delete({ where: { id } })
  revalidatePath('/dashboard/vendas')
  return { success: true }
}

// Global Settings Actions
export async function getGlobalSettings() {
  try {
    const s = await prisma.globalSettings.findUnique({ where: { id: "singleton" } });
    if(s) return s;
    return await prisma.globalSettings.create({ data: { id: "singleton" } });
  } catch (e) {
    console.error("Settings error", e);
    return null;
  }
}

export async function saveGlobalSettings(data: any) {
  try {
    await prisma.globalSettings.update({ where: { id: "singleton" }, data });
    revalidatePath('/dashboard/configuracoes')
  } catch(e) {
    console.error("Save Settings error", e);
  }
}

// Empreendimentos Actions
export async function saveDevelopment(data: any) {
  if (data.id) {
    await prisma.development.update({
      where: { id: data.id },
      data: { name: data.name, builder: data.builder, city: data.city }
    })
  } else {
    await prisma.development.create({
      data: { name: data.name, builder: data.builder, city: data.city }
    })
  }
  revalidatePath('/dashboard/empreendimentos')
  return { success: true }
}

export async function deleteDevelopment(id: string) {
  await prisma.development.delete({ where: { id } })
  revalidatePath('/dashboard/empreendimentos')
  return { success: true }
}

// Broker Actions
export async function saveBroker(data: any) {
  if (data.id) {
    await prisma.broker.update({
      where: { id: data.id },
      data: { name: data.name, email: data.email, phone: data.phone, creci: data.creci, avatar: data.avatar }
    })
  } else {
    
    if (data.email) {
      const parsedEmail = data.email.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({ where: { email: parsedEmail } });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash("imob123", 10);
        await prisma.user.create({
           data: {
              name: data.name,
              email: parsedEmail,
              password: hashedPassword,
              role: "BROKER"
           }
        });
      }
    }

    await prisma.broker.create({
      data: { name: data.name, email: data.email, phone: data.phone, creci: data.creci, avatar: data.avatar }
    })
  }
  revalidatePath('/dashboard/corretores')
  return { success: true }
}

export async function deleteBroker(id: string) {
  const broker = await prisma.broker.findUnique({ where: { id } });
  if (broker && broker.email) {
    try {
      const emailParsed = broker.email.toLowerCase().trim();
      const linkedUser = await prisma.user.findUnique({ where: { email: emailParsed } });
      if (linkedUser && (linkedUser as any).role !== "ADMIN") {
        await prisma.user.delete({ where: { email: emailParsed } });
      }
    } catch(e) {
    }
  }

  await prisma.broker.delete({ where: { id } })
  revalidatePath('/dashboard/corretores')
  return { success: true }
}



export async function updateClientPhase(id: string, phase: string) {
  try {
    await prisma.client.update({
      where: { id },
      data: { kanbanPhase: phase }
    });
    revalidatePath('/dashboard/clientes');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}
