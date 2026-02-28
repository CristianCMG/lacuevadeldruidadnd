# Plan de Migración a Hostinger (Node.js Apps Flow)

Este documento detalla la estrategia para desplegar la aplicación en **Hostinger Business Web Hosting** utilizando la funcionalidad nativa **Node.js Apps**.

## 1. Análisis del Entorno

*   **Plataforma**: Hostinger Business Web Hosting.
*   **Método de Despliegue**: "Node.js Apps" (hPanel -> Websites -> Add Website).
*   **Estrategia**: Subida de código fuente (ZIP o GitHub) + Build automático en servidor.
*   **Persistencia**: Almacenamiento externo para base de datos JSON y tokens.

## 2. Preparación del Código

### A. Persistencia de Datos (Crítico)
La aplicación ha sido configurada para leer/escribir datos fuera de la carpeta del proyecto mediante la variable `DATA_STORAGE_PATH`. Esto evita que los datos se pierdan cuando Hostinger reconstruye la aplicación.

*   **Código modificado**: `src/lib/db.ts` y `src/config/hostinger.ts` usan `process.env.DATA_STORAGE_PATH`.

### B. Empaquetado
Se utiliza el script `scripts/package-for-hostinger.ps1` que ahora empaqueta **solo el código fuente**, excluyendo `node_modules` y builds locales.

## 3. Configuración en Hostinger (Paso a Paso)

### Paso 1: Configurar Almacenamiento Persistente
Antes de desplegar la app, debemos crear la carpeta donde vivirán los datos reales.

1.  Entra al **Administrador de Archivos** en hPanel.
2.  Navega a la carpeta raíz de tu usuario (normalmente un nivel arriba de `public_html` o en `/home/uXXXXXXX/domains/tudominio.com/`).
3.  Crea una carpeta llamada `private_storage`.
4.  Sube tus archivos actuales:
    *   `src/data/orders.json` -> `private_storage/orders.json`
    *   `src/data/secure/*` -> `private_storage/secure/*`
5.  Nota la **Ruta Absoluta** de esta carpeta (puedes verla en la barra superior del administrador de archivos). Ejemplo: `/home/u123456789/domains/lacuevadeldruidadnd.com/private_storage`.

### Paso 2: Crear la Aplicación Node.js
1.  Ve a **Websites** en la barra lateral.
2.  Haz clic en **Add Website**.
3.  Selecciona **Node.js Apps**.
4.  Elige el método de despliegue:
    *   **Opción A (Recomendada)**: Conectar con **GitHub**. Selecciona tu repositorio.
    *   **Opción B (Manual)**: Subir archivo. Sube el archivo `project_source.zip` generado por nuestro script.

### Paso 3: Configuración del Build
Hostinger detectará que es una app Next.js.
1.  **Build Command**: `npm run build`
2.  **Start Command**: `npm start` (o `node server.js` si prefieres usar el server custom).
3.  **Node Version**: v18 o v20.

### Paso 4: Variables de Entorno
En la pantalla de configuración de la nueva app (antes o después del primer deploy), busca la sección de **Environment Variables** y añade las siguientes (usa `.env.production.example` como guía):

*   `DATA_STORAGE_PATH`: (La ruta absoluta del Paso 1)
*   `MP_ACCESS_TOKEN`: ...
*   `MELI_APP_ID`: ...
*   (Añade todas las demás variables del archivo de ejemplo)

### Paso 5: Desplegar
Haz clic en **Deploy**. Hostinger instalará dependencias y construirá la aplicación.

## 4. Gestión Post-Despliegue

### Actualizaciones
*   **Si usas GitHub**: Simplemente haz push a tu rama `main`. Hostinger redespelgará automáticamente.
*   **Si usas ZIP**: Debes subir un nuevo ZIP en la sección de gestión de la app.

### Backups
Los datos importantes están en `private_storage`. Configura un Cron Job para respaldar esa carpeta regularmente usando el script `scripts/backup-hostinger.sh` (asegúrate de actualizar las rutas en el script).

```bash
# Ejemplo de Cron Job
bash /home/uXXXX/domains/lacuevadeldruidadnd.com/public_html/scripts/backup-hostinger.sh
```

(Nota: Tendrás que subir la carpeta `scripts` a una ubicación accesible si no se despliega dentro de la estructura estándar accesible para cron).

## 5. Solución de Problemas
*   **Error 403 / 500**: Revisa los logs de la aplicación en el panel de Hostinger.
*   **Datos perdidos**: Verifica que `DATA_STORAGE_PATH` esté bien configurada y que la aplicación tenga permisos de escritura en esa carpeta (chmod 700 o 755).
