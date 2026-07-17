// GET /api/categorias?tipo=gasto-fijo → listar categorías del usuario (con defaults + personalizadas)
// POST /api/categorias → crear categoría personalizada
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { z } from 'zod'
import { CATEGORIAS_GASTO_FIJO, CATEGORIAS_GASTO_VARIABLE, CATEGORIAS_INGRESO } from '@/lib/types'

const TIPOS_VALIDOS = ['gasto-fijo', 'gasto-variable', 'ingreso'] as const

const createCategoriaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  tipo: z.enum(TIPOS_VALIDOS),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido (formato #rrggbb)').optional(),
  icono: z.string().max(10).optional(),
})

function defaultsPorTipo(tipo: string): { nombre: string; color: string; icono: string }[] {
  if (tipo === 'gasto-fijo') {
    return CATEGORIAS_GASTO_FIJO.map((nombre) => ({ nombre, color: '#6366f1', icono: '🏷️' }))
  }
  if (tipo === 'gasto-variable') {
    return CATEGORIAS_GASTO_VARIABLE.map((nombre) => ({ nombre, color: '#f59e0b', icono: '🏷️' }))
  }
  return CATEGORIAS_INGRESO.map((nombre) => ({ nombre, color: '#10b981', icono: '🏷️' }))
}

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get('tipo') || ''

    const where: any = { usuarioId: usuario.id }
    if (TIPOS_VALIDOS.includes(tipo as any)) where.tipo = tipo

    const personalizadas = await db.categoria.findMany({
      where,
      orderBy: { nombre: 'asc' },
    })

    // Combinar defaults + personalizadas (las personalizadas pisan a las defaults con mismo nombre)
    const defaults = tipo ? defaultsPorTipo(tipo) : []
    const nombresPersonalizados = new Set(personalizadas.map((c) => c.nombre))

    const resultado = [
      ...defaults
        .filter((d) => !nombresPersonalizados.has(d.nombre))
        .map((d) => ({
          id: `default-${d.nombre}`,
          nombre: d.nombre,
          tipo: tipo || 'gasto-fijo',
          color: d.color,
          icono: d.icono,
          esDefault: true,
        })),
      ...personalizadas.map((c) => ({
        ...c,
        esDefault: false,
      })),
    ]

    return NextResponse.json(resultado)
  } catch (e: any) {
    console.error('[GET /api/categorias]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const body = await req.json()
    const data = createCategoriaSchema.parse(body)

    // Verificar que no exista en defaults
    const defaults = defaultsPorTipo(data.tipo)
    if (defaults.some((d) => d.nombre.toLowerCase() === data.nombre.toLowerCase())) {
      return NextResponse.json(
        { error: 'Ya existe una categoría default con ese nombre' },
        { status: 400 }
      )
    }

    // Verificar que no exista en personalizadas (case-insensitive manual para SQLite)
    const existente = await db.categoria.findFirst({
      where: {
        usuarioId: usuario.id,
        nombre: data.nombre,
        tipo: data.tipo,
      },
    })
    if (existente && existente.nombre.toLowerCase() === data.nombre.toLowerCase()) {
      return NextResponse.json(
        { error: 'Ya tenés una categoría con ese nombre' },
        { status: 400 }
      )
    }

    const categoria = await db.categoria.create({
      data: {
        usuarioId: usuario.id,
        nombre: data.nombre.trim(),
        tipo: data.tipo,
        color: data.color || '#6366f1',
        icono: data.icono || '🏷️',
      },
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/categorias]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message || 'Datos inválidos' }, { status: 400 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
