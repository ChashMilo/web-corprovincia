# Corprovincia — Sitio web

Sitio web de la **Corporación Educativa de la Provincia** (Sabanalarga, Atlántico): técnicos laborales, cursos cortos y bachillerato con doble titulación en el Liceo Alcira Colón de Ahumada.

**Versión actual:** V1 (`v1.0.0`). Ver [CHANGELOG.md](CHANGELOG.md).

Construido con [Astro](https://astro.build), Tailwind CSS, GSAP y Lenis.

## Comandos

| Comando           | Acción                                               |
| :---------------- | :--------------------------------------------------- |
| `npm install`     | Instala las dependencias                             |
| `npm run dev`     | Servidor de desarrollo en `http://localhost:4321`    |
| `npm run build`   | Genera el sitio de producción en `./dist/`           |
| `npm run preview` | Previsualiza el sitio generado antes de publicarlo   |

## Publicación (Hostinger)

Cada `git push` a `main` ejecuta [.github/workflows/deploy.yml](.github/workflows/deploy.yml): GitHub Actions compila la web y publica `dist/` en la rama **`deploy`**. Hostinger está conectado a la rama `deploy` (no a `main`) con despliegue automático hacia `public_html`.

No edites la rama `deploy` a mano: se reescribe en cada publicación.

## Estructura

```text
public/
  images/
    home/       Fotos de la página de inicio
    liceo/      Fotos de la página del Liceo
    nosotros/   Fotos de la página Nosotros
    docentes/   Fotos del equipo docente (inicio)
    cursos/     Imágenes de los cursos
src/
  components/   Header, Footer, formularios, logos y tarjetas
  content/
    cursos/     Un archivo .md por curso (nombre, horario, imagen, descripción)
  layouts/      Plantilla base (SEO, fuentes, header y footer)
  pages/        Inicio, Cursos, Liceo, Nosotros, Contacto, Inscripción y 404
  scripts/      Animaciones (motion.ts)
  styles/       Estilos globales
```

## Imágenes

Las fotos se guardan en `public/images/<página>/` en formato **WebP**, redimensionadas al ancho que necesita cada espacio (unos 700–1600 px), para que la web cargue rápido.

## Formularios (Formspree)

| Formulario  | Archivo                                 | Endpoint                            |
| :---------- | :-------------------------------------- | :---------------------------------- |
| Inscripción | `src/components/InscripcionForm.astro`  | `https://formspree.io/f/xgaaarde`   |
| Contacto    | `src/pages/contacto.astro`              | `https://formspree.io/f/mljjjvrb`   |

## Agregar o editar un curso

Crea o edita un archivo en `src/content/cursos/`. El campo `slug` define la URL (`/cursos/<slug>`). Si agregas un curso nuevo, añádelo también a la lista de programas en `src/components/InscripcionForm.astro`.
