import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ConfiguracoesClient from "./ConfiguracoesClient"
import { getGlobalSettings } from "../../actions"

export default async function ConfiguracoesPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const settings = await getGlobalSettings()

  return <ConfiguracoesClient userSession={session.user} settings={settings} />
}
