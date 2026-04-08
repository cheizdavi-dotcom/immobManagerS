"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { format } from "date-fns"

export async function saveClient(data: any) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (data.id) {
    const existingClient = await prisma.client.findUnique({ where: { id: data.id } });
    
    const updateData: any = {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      cpf: data.cpf || null,
      status: data.status,
      kanbanPhase: data.kanbanPhase || "NOVO",
    };

    if (data.kanbanPhase && existingClient?.kanbanPhase !== data.kanbanPhase) {
      updateData.ultimoContato = new Date();
    }

    await prisma.client.update({
      where: { id: data.id },
      data: updateData
    })
  } else {
    await prisma.client.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        status: data.status,
        kanbanPhase: data.kanbanPhase || "NOVO",
        userId: userId || null,
        ultimoContato: new Date(),
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
      data: { name: data.name, email: data.email || null, phone: data.phone || null, creci: data.creci, avatar: data.avatar }
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
      data: { name: data.name, email: data.email || null, phone: data.phone || null, creci: data.creci, avatar: data.avatar }
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
      data: { 
        kanbanPhase: phase,
        ultimoContato: new Date(),
      }
    });
    revalidatePath('/dashboard/clientes');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

// ==================== VISITS ====================
export async function getVisits() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    return await prisma.visit.findMany({
      where: { userId: session.user.id as string },
      include: {
        property: true,
        client: true,
        broker: true,
      },
      orderBy: { scheduledAt: 'asc' }
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function saveVisit(data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const scheduledAt = new Date(data.scheduledAt);
    
    if (data.id) {
      await prisma.visit.update({
        where: { id: data.id },
        data: {
          scheduledAt,
          duration: data.duration || 30,
          status: data.status || "AGENDADA",
          notes: data.notes,
          feedback: data.feedback,
          rating: data.rating,
          developmentId: data.developmentId || null,
          propertyId: data.propertyId || null,
          clientId: data.clientId,
          brokerId: data.brokerId,
        }
      });
    } else {
      await prisma.visit.create({
        data: {
          scheduledAt,
          duration: data.duration || 30,
          status: data.status || "AGENDADA",
          notes: data.notes,
          developmentId: data.developmentId || null,
          propertyId: data.propertyId || null,
          clientId: data.clientId,
          brokerId: data.brokerId,
          userId: session.user.id as string,
        }
      });
    }
    revalidatePath('/dashboard/visitas');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Erro ao salvar visita" };
  }
}

export async function deleteVisit(id: string) {
  try {
    await prisma.visit.delete({ where: { id } });
    revalidatePath('/dashboard/visitas');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

export async function updateVisitStatus(id: string, status: string, feedback?: string, rating?: number) {
  try {
    await prisma.visit.update({
      where: { id },
      data: { 
        status,
        feedback,
        rating
      }
    });
    revalidatePath('/dashboard/visitas');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

// ==================== PROPERTIES ====================
export async function getProperties() {
  try {
    return await prisma.property.findMany({
      include: { development: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function saveProperty(data: any) {
  try {
    if (data.id) {
      await prisma.property.update({
        where: { id: data.id },
        data: {
          title: data.title,
          type: data.type,
          address: data.address,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state || "SP",
          area: data.area,
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          parkingSpaces: data.parkingSpaces || 0,
          price: data.price,
          status: data.status || "DISPONIVEL",
          photos: data.photos ? JSON.stringify(data.photos) : null,
          developmentId: data.developmentId || null,
        }
      });
    } else {
      await prisma.property.create({
        data: {
          title: data.title,
          type: data.type,
          address: data.address,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state || "SP",
          area: data.area,
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          parkingSpaces: data.parkingSpaces || 0,
          price: data.price,
          status: data.status || "DISPONIVEL",
          photos: data.photos ? JSON.stringify(data.photos) : null,
          developmentId: data.developmentId || null,
        }
      });
    }
    revalidatePath('/dashboard/imoveis');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Erro ao salvar imóvel" };
  }
}

export async function deleteProperty(id: string) {
  try {
    await prisma.property.delete({ where: { id } });
    revalidatePath('/dashboard/imoveis');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

export async function updatePropertyStatus(id: string, status: string) {
  try {
    await prisma.property.update({
      where: { id },
      data: { status }
    });
    revalidatePath('/dashboard/imoveis');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

// ==================== WHATSAPP ====================
export async function sendWhatsAppMessage(phone: string, message: string, clientId?: string) {
  try {
    const settings = await prisma.globalSettings.findUnique({ where: { id: "singleton" } });
    
    if (!settings?.whatsappActive || !settings?.whatsappToken) {
      return { success: false, error: "WhatsApp não configurado" };
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const finalPhone = cleanPhone.length === 11 ? cleanPhone : "55" + cleanPhone;

    const response = await fetch("https://api.whatsapp.com/v1/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${settings.whatsappToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: finalPhone,
        type: "text",
        text: { body: message }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("WhatsApp API Error:", errorData);
      return { success: false, error: errorData.error?.message || "Erro ao enviar" };
    }

    if (clientId) {
      await prisma.client.update({
        where: { id: clientId },
        data: { ultimoContato: new Date() }
      });
    }

    return { success: true };
  } catch (e) {
    console.error("WhatsApp Error:", e);
    return { success: false, error: "Erro de conexão" };
  }
}

// ==================== LEMBRETES DE VISITA ====================
export async function sendVisitReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const visits = await prisma.visit.findMany({
    where: {
      scheduledAt: {
        gte: today,
        lt: tomorrow
      },
      status: {
        in: ["AGENDADA", "CONFIRMADA"]
      }
    },
    include: {
      client: true,
      property: true
    }
  });

  const results = [];
  for (const visit of visits) {
    if (visit.client?.phone) {
      const visitDate = new Date(visit.scheduledAt);
      const timeStr = format(visitDate, "HH:mm");
      
      const message = `Olá ${visit.client.name}! Lembrete: Sua visita está agendada para hoje às ${timeStr} no imóvel "${visit.property?.title || "Sede Comercial"}" (${visit.property?.address || "Endereço Integrante"}). Qualquer dúvida, é só chamar!`;
      
      const result = await sendWhatsAppMessage(visit.client.phone, message);
      results.push({ client: visit.client.name, success: result.success, error: result.error });
    }
  }

  return results;
}

// ==================== FOLLOW-UP AUTOMÁTICO ====================
export async function sendFollowUpReminders(daysThreshold: number = 5) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  const clientsWithoutContact = await prisma.client.findMany({
    where: {
      OR: [
        { ultimoContato: null },
        { ultimoContato: { lt: thresholdDate } }
      ],
      kanbanPhase: {
        notIn: ["FECHADO", "CONTRATO"]
      }
    },
    include: {
      user: true
    }
  });

  const results = [];
  for (const client of clientsWithoutContact) {
    if (client.phone) {
      const daysSince = client.ultimoContato 
        ? Math.floor((new Date().getTime() - new Date(client.ultimoContato).getTime()) / (1000 * 60 * 60 * 24))
        : "muitos";

      const message = `Olá ${client.name.split(' ')[0]}! Já faz um tempo que conversamos. Gostaria de saber como está sua busca pelo imóvel novo? Estou à disposição para ajudar!`;
      
      const result = await sendWhatsAppMessage(client.phone, message, client.id);
      results.push({ 
        client: client.name, 
        success: result.success, 
        error: result.error,
        daysSince 
      });
    }
  }

  return results;
}
