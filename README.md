# Repair Academy

Repair Academy es un **espacio operativo de reparación de iPhone**: una aplicación web modular para buscar, evaluar y ejecutar guías de reparación con una cadena de trazabilidad visible. No es un clon ni un espejo de contenido.

## Qué resuelve

- Descubrimiento por modelo y componente.
- Selección de guías con una puntuación explicable: coincidencia del modelo, título de reemplazo, componente, guía destacada y recursos disponibles.
- Exclusión de resultados archivados o en progreso de la recomendación principal.
- Consulta de la guía individual en español primero; si no está disponible, la interfaz comunica el fallback.
- Imágenes exclusivamente vinculadas a `step.media.data` de cada paso.
- Espacio de trabajo con prechequeo, herramientas, piezas, alerta por tipo de intervención, progreso de pasos y enlace de trazabilidad a la fuente.
- Estados de carga, ausencia de fotografías, fuente no disponible y errores de red.

## Estructura

```text
repair-academy/
├── index.html              # shell y vistas de la app
├── assets/
│   ├── styles.css          # sistema visual responsive y accesible
│   ├── catalog.js          # índice curado de dispositivos/componentes
│   └── app.js              # estado, rutas, API, ranking y workspace
├── repair-academy.html     # redirección de compatibilidad
└── README.md
```

## Ejecutar localmente

No necesita Node.js ni build pipeline.

```bash
git clone https://github.com/thesenaiyt-boop/repair-academy.git
cd repair-academy
python3 -m http.server 8080
```

Abre [http://localhost:8080](http://localhost:8080). Se recomienda un servidor local porque abrir `index.html` con `file://` puede impedir solicitudes de API en algunos navegadores.

## GitHub Pages

1. Abre **Settings → Pages** en el repositorio.
2. Selecciona **Deploy from a branch**.
3. Elige `main` y la carpeta `/ (root)`.
4. Guarda y abre la URL que GitHub genera.

## Integraciones

### iFixit

La aplicación usa lectura bajo demanda de la API v2 de iFixit:

- Búsqueda de guías: `GET /guides/search?query=...`
- Guía individual: `GET /guides/{id}?langid=es`
- Fallback: `GET /guides/{id}`

No descarga, indexa ni persiste masivamente las guías. La URL de la guía fuente se muestra dentro de cada orden de reparación. La interfaz elimina etiquetas HTML del texto remoto antes de renderizarlo.

### Apple / cierre de reparación

Para piezas genuinas, manuales oficiales, herramientas de servicio, configuración de piezas o Repair Assistant, el flujo de empresa debe consultar los recursos oficiales de Apple y los requisitos aplicables en cada región. Repair Academy no afirma ser un servicio autorizado ni sustituye manuales o diagnósticos oficiales.

## Cumplimiento y licencia

El contenido de cada guía, imágenes y su autoría pertenecen a sus fuentes. Antes de usar material de terceros en un contexto comercial, revisa la licencia de cada guía, términos de uso y los requisitos de licenciamiento de la API. No se deben presentar piezas como compatibles o genuinas sin validación de inventario, modelo y proveedor.

## Próxima evolución empresarial

La aplicación está preparada como base frontend. Para producción con equipos, inventario o clientes se recomienda añadir:

- Backend con proxy autenticado y cache con términos aprobados.
- Inicio de sesión, roles (técnico, supervisor, administrador) y registro de auditoría.
- Catálogo de inventario y compatibilidad de piezas validado por SKU.
- Órdenes de trabajo persistentes, fotos de entrada/salida y firma de entrega.
- Checklists de QA, pruebas funcionales y reportes de reparación.
- Gestión de consentimiento y políticas de privacidad.
