# Repair Academy v2

Guías visuales de reparación de iPhone en español, construidas sobre la API pública de iFixit. Sitio estático: HTML + CSS + JS sin dependencias.

## Correcciones respecto a la v1

| Problema | Solución |
|---|---|
| Misma foto en todo (p. ej. batería) | Cada paso usa solo sus propias fotos (`step.media.data`). Sin foto → aviso neutro, nunca la imagen de otra guía. |
| Guía equivocada para “batería” | Ranking: tipo *replacement*, título, categoría, destacada, con foto; penaliza archivadas, “mensajes de batería”, teardowns y accesorios. |
| Guías archivadas/incompletas | Ocultas por defecto, con opción para mostrarlas. |
| Idioma mezclado | Pide `langid=es`; si no existe, avisa “Texto original en inglés”. |
| HTML inseguro de la API | Todo texto se convierte a texto plano; URLs solo `https`. |
| Imágenes rotas | Fallback por imagen, sin sustituir por otra foto. |
| Estados | Skeletons, vacío, error con reintento. |

## Funciones nuevas

- Catálogo agrupado por generación, con foto y número de guías del propio modelo (carga perezosa).
- “¿Qué le pasa a tu iPhone?”: síntoma → categoría → modelo.
- Búsqueda inteligente (“iPhone 12 batería” abre directo la reparación).
- Reparaciones recomendadas por categoría + filtros + búsqueda dentro del modelo.
- Guía con resumen, seguridad, herramientas y piezas con miniatura.
- Visor paso a paso: galería por paso, zoom, avisos destacados, progreso, teclado ← →, **modo taller** a pantalla completa.
- Tema claro/oscuro, móvil primero, accesible.

## Usar

Abre `index.html` con cualquier servidor estático (`python3 -m http.server`) o activa GitHub Pages en *Settings → Pages → main / root*.

La app necesita que la API de iFixit permita peticiones desde el navegador (CORS). Si tu navegador las bloquea, se mostrará el estado de error con reintento.

## Licencia

Contenido de iFixit: CC BY-NC-SA 3.0, uso no comercial. Ver [NOTICE.md](NOTICE.md). El archivo `repair-academy.html` es la versión anterior, conservada como referencia.
