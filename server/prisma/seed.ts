// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create Maintenance Stages (Critical for Kanban)
  const stages = [
    { name: 'New', sequence: 1, is_scrap_state: false },
    { name: 'In Progress', sequence: 2, is_scrap_state: false },
    { name: 'Repaired', sequence: 3, is_scrap_state: false },
    { name: 'Scrap', sequence: 4, is_scrap_state: true }, // The trigger state
  ]

  for (const stage of stages) {
    await prisma.maintenanceStage.upsert({
      where: { name: stage.name },
      update: {},
      create: stage,
    })
  }

  // 2. Create Departments
  const departments = ['IT', 'Operations', 'HR', 'Logistics']
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept },
      update: {},
      create: { name: dept },
    })
  }

  // 3. Create Categories
  const categories = ['Electronics', 'Heavy Machinery', 'Vehicles', 'Furniture']
  for (const cat of categories) {
    await prisma.equipmentCategory.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat },
    })
  }

  // 4. Create Teams
  const teamIT = await prisma.maintenanceTeam.upsert({
    where: { name: 'IT Support' },
    update: {},
    create: { name: 'IT Support' },
  })

  // 5. Create Employees (Password: "password123")
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Admin
  await prisma.employee.upsert({
    where: { email: 'admin@gearguard.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@gearguard.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })

  // Technician (Assigned to IT Support)
  await prisma.employee.upsert({
    where: { email: 'tech@gearguard.com' },
    update: {},
    create: {
      name: 'John Tech',
      email: 'tech@gearguard.com',
      password: hashedPassword,
      role: Role.TECHNICIAN,
      maintenance_team_id: teamIT.id,
    },
  })

  console.log('✅ Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })