import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cursos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/cursos' }),
  schema: z.object({
    nombre: z.string(),
    slug: z.string(),
    categoria: z.enum(['curso_corto', 'tecnico', 'bachillerato']),
    subcategoria: z.string().optional(),
    resumen: z.string(),
    imagen: z.string(),
    duracion: z.string().optional(),
    horario: z.string().optional(),
    requisitos: z.string().optional(),
    certificacion: z.string().optional(),
    destacado: z.boolean().default(false),
  }),
});

export const collections = { cursos };
