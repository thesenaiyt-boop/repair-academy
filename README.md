# Repair Academy

Explorador estático de guías de reparación de iPhone. Consulta la API pública de iFixit bajo demanda: no descarga ni replica el catálogo completo.

## Ejecutar localmente

No requiere Node.js ni compilación.

```bash
git clone https://github.com/thesenaiyt-boop/repair-academy.git
cd repair-academy
python3 -m http.server 8080
```

Abre `http://localhost:8080/repair-academy.html`.

> Evita abrir el archivo con `file://`: algunos navegadores bloquean solicitudes remotas por CORS en ese modo.

## Publicar en GitHub Pages

1. En GitHub, abre **Settings** del repositorio.
2. Entra a **Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama `main` y la carpeta `/ (root)`.
5. Guarda los cambios.
6. La aplicación estará disponible en la URL que GitHub Pages muestre para el repositorio. Abre `repair-academy.html` desde esa URL.

## Criterios de calidad implementados

- Busca guías con la API v2.0 de iFixit.
- Pide el contenido individual en español primero (`langid=es`) y conserva el idioma disponible si no existe traducción.
- Puntúa resultados por coincidencia con el componente, guía destacada y tipo de reemplazo.
- Excluye guías archivadas o en progreso de la selección principal.
- No presenta fotos genéricas: cada paso utiliza solo `step.media.data` de esa guía.
- Si un paso no tiene imagen, lo declara explícitamente y no repite la imagen de portada.
- Evita insertar HTML remoto: convierte texto de la API a texto plano antes de renderizarlo.
- Incluye estados de carga, error, vacío, imágenes faltantes, progreso de sesión, modo oscuro, teclado y diseño adaptable.

## Arquitectura

Todo vive en `repair-academy.html` para facilitar el despliegue estático:

- `search()` consulta resultados y aplica un ranking de calidad.
- `openGuide()` solicita una guía individual y construye la ficha.
- `renderStep()` lee exclusivamente los recursos del paso correspondiente.
- Las URL e información de autor se muestran como atribución hacia la guía fuente.

## Licencia y atribución

Las guías, imágenes y textos consultados pertenecen a sus respectivos autores en iFixit. iFixit publica su contenido bajo CC BY-NC-SA 3.0; antes de redistribuir, comercializar, almacenar masivamente o adaptar contenido, revisa la licencia vigente y las condiciones de la API de iFixit.

Repair Academy es una interfaz independiente y no está afiliada con iFixit.
