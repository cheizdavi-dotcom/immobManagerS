const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const users = [
    { email: 'seu-email@email.com', name: 'Seu Nome', pass: 'sua-senha', role: 'ADMIN' },
    { email: 'cunhado@email.com', name: 'Cunhado', pass: 'senha123', role: 'MANAGER' },
    { email: 'irma@email.com', name: 'Irmã', pass: 'senha123', role: 'MANAGER' },
  ]
  
  for (const user of users) {
    const hash = await bcrypt.hash(user.pass, 10)
    await prisma.user.upsert({
      where: { email: user.email },
      update: { password: hash, name: user.name, role: user.role },
      create: { email: user.email, name: user.name, password: hash, role: user.role }
    })
    console.log(`✓ ${user.name} criado!`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
