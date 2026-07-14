// LiderControl - Seed inicial
// Crea 1 usuario demo con cuenta, gastos, ingresos y metas de enero 2026
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed LiderControl...')

  await db.transferencia.deleteMany()
  await db.mensaje.deleteMany()
  await db.metaAhorro.deleteMany()
  await db.gastoVariable.deleteMany()
  await db.gastoFijo.deleteMany()
  await db.ingreso.deleteMany()
  await db.cuenta.deleteMany()
  await db.usuario.deleteMany()

  const passwordDemo = await bcrypt.hash('demo123', 10)

  const demo = await db.usuario.create({
    data: {
      nombre: 'Demo',
      email: 'demo@lidercontrol.com',
      username: 'demo',
      password: passwordDemo,
      color: '#6366f1',
      emailVerificado: true,
    },
  })

  await db.cuenta.create({
    data: {
      usuarioId: demo.id,
      ingresoMensual: 2970000,
      metaAhorroMensual: 700000,
      presupuestoVariables: 215000,
      saldo: 1500000,
    },
  })

  const gastosFijos = [
    { concepto: 'Alquiler', categoria: 'Vivienda', monto: 250000, diaVencimiento: 3, estado: 'pagado' },
    { concepto: 'Colegio', categoria: 'Educación', monto: 200000, diaVencimiento: 21, estado: 'pendiente' },
    { concepto: 'Préstamo Julisa', categoria: 'Deudas', monto: 350000, diaVencimiento: 15, estado: 'pendiente' },
    { concepto: 'Internet', categoria: 'Servicios', monto: 25000, diaVencimiento: 10, estado: 'pagado' },
    { concepto: 'Luz', categoria: 'Servicios', monto: 38000, diaVencimiento: 18, estado: 'pendiente' },
    { concepto: 'Agua', categoria: 'Servicios', monto: 18000, diaVencimiento: 22, estado: 'pendiente' },
    { concepto: 'Gas', categoria: 'Servicios', monto: 22000, diaVencimiento: 25, estado: 'pendiente' },
  ]

  for (const g of gastosFijos) {
    await db.gastoFijo.create({
      data: { ...g, usuarioId: demo.id, mes: 1, anio: 2026 },
    })
  }

  const gastosVariables = [
    { concepto: 'Supermercado semana 1', categoria: 'Comida', monto: 45000 },
    { concepto: 'Nafta', categoria: 'Transporte', monto: 30000 },
    { concepto: 'Cine', categoria: 'Ocio', monto: 12000 },
    { concepto: 'Cena salida', categoria: 'Ocio', monto: 25000 },
  ]
  for (const g of gastosVariables) {
    await db.gastoVariable.create({
      data: { ...g, usuarioId: demo.id, mes: 1, anio: 2026, fecha: new Date(2026, 0, Math.floor(Math.random() * 20) + 5) },
    })
  }

  await db.metaAhorro.create({
    data: {
      usuarioId: demo.id,
      titulo: 'Viaje',
      montoObjetivo: 700000,
      montoActual: 180000,
      mes: 1, anio: 2026,
    },
  })

  await db.ingreso.createMany({
    data: [
      { usuarioId: demo.id, concepto: 'Sueldo mensual', categoria: 'Sueldo', monto: 2700000, mes: 1, anio: 2026, esFijo: true, fecha: new Date(2026, 0, 5) },
      { usuarioId: demo.id, concepto: 'Freelance diseño web', categoria: 'Freelance', monto: 200000, mes: 1, anio: 2026, esFijo: false, fecha: new Date(2026, 0, 12) },
      { usuarioId: demo.id, concepto: 'Reembolso gastos', categoria: 'Reembolso', monto: 70000, mes: 1, anio: 2026, esFijo: false, fecha: new Date(2026, 0, 18) },
    ],
  })

  console.log('✅ Seed completado!')
  console.log('   - 1 usuario (Demo)')
  console.log('   - 1 cuenta')
  console.log(`   - ${gastosFijos.length} gastos fijos`)
  console.log(`   - ${gastosVariables.length} gastos variables`)
  console.log('   - 1 meta de ahorro')
  console.log('   - 3 ingresos')
  console.log('')
  console.log('🔐 Login: demo / demo123')
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
