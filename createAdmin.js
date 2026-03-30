const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'diretoria@immobmanager.com'
  const pass = 'admin'
  const hash = await bcrypt.hash(pass, 10)
  
  await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: 'ADMIN' },
    create: { email, name: 'Diretor Master', password: hash, role: 'ADMIN' }
  })
  
  console.log('Master Account Created Successfully!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
