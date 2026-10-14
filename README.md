# Repair Academy

Aplicación web estática en español para descubrir y seguir guías visuales de reparación de iPhone. La interfaz consulta la API pública de iFixit v2.0 bajo demanda, conserva una fotografía diferente por paso y añade un flujo de seguridad y verificación posreparación basado en Apple Support.

## Funciones

- Catálogo curado de 23 modelos, desde iPhone X hasta iPhone 17, iPhone Air y variantes compatibles.
- Ranking editorial que exige coincidencia exacta entre categoría, modelo, asunto “Battery” y título de reemplazo.
- Exclusión de guías archivadas o en progreso.
- Idioma español mediante `?langid=es`, con contenido real de iFixit.
- Galería independiente por paso desde `step.media.data[]`; no reutiliza la portada.
- Navegación completa por pasos, progreso, teclado, miniaturas y ampliación.
- Herramientas y piezas procedentes de la guía elegida.
- Saneamiento de HTML remoto con DOMPurify.
- Modos claro y oscuro, diseño móvil, objetivos táctiles y movimiento reducido.
- Estados de carga, vacío, error, imágenes rotas y desconexión.
- Flujo posterior con Repair Assistant, pruebas funcionales y reciclaje.

## Ejecutar

Sirve esta carpeta mediante HTTP:

```bash
python -m http.server 8080
```

Abre `http://localhost:8080/repair-academy.html`.

> No abras el HTML mediante `file://`: el navegador puede impedir cargar el catálogo JSON local.

## Arquitectura

- `repair-academy.html`: interfaz, estilos y cliente API en un único punto de entrada.
- `assets/curated-battery-guides.json`: índice validado; solo conserva metadatos y enlaces, no copia las guías completas.
- Al seleccionar un modelo se consulta `https://www.ifixit.com/api/2.0/guides/{id}?langid=es`.
- Las imágenes se resuelven en orden `large → standard → original → thumbnail` y se deduplican por paso.

## Fuentes

- [API iFixit v2.0](https://www.ifixit.com/api/2.0/doc/)
- [Apple Self Service Repair](https://support.apple.com/self-service-repair)
- [Repair Assistant](https://support.apple.com/en-us/120579)
- [Información de baterías genuinas](https://support.apple.com/en-us/103269)

## Licencias

El código original está bajo MIT. Los datos, textos e imágenes de las guías pertenecen a sus autores y se presentan con atribución a iFixit bajo CC BY-NC-SA 3.0. El proyecto no almacena ni redistribuye masivamente el contenido completo: solicita una guía cuando el usuario la abre.
