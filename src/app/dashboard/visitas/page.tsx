import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import VisitasClient from "./VisitasClient"

export default async function VisitasPage() {
  const session = await auth()
  const role = (session?.user as any)?.role || "ADMIN"
  const isAdmin = role === "ADMIN"

  let brokerObj = null
  if (!isAdmin && session?.user?.email) {
    brokerObj = await prisma.broker.findFirst({ where: { email: session.user.email.toLowerCase().trim() } })
  }

  const visitFilter = !isAdmin ? (brokerObj ? { brokerId: brokerObj.id } : { id: "none" }) : {}

  const visits = await prisma.visit.findMany({
    where: visitFilter,
    include: {
      property: true,
      development: true,
      client: true,
      broker: true,
    },
    orderBy: { scheduledAt: 'asc' }
  })

  const developments = await prisma.development.findMany()
  const clients = await prisma.client.findMany()
  const brokers = await prisma.broker.findMany()

  return <VisitasClient visits={visits} developments={developments} clients={clients} brokers={brokers} userRole={role} />
}