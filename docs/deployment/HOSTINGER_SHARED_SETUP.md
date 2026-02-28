# Guía de Despliegue en Hostinger (Plan Business / Shared Hosting)

Esta guía es específica para el plan **Hostinger Business Web Hosting** (Compartido) que soporta aplicaciones Node.js. Si tienes un VPS, usa la guía `HOSTINGER_SETUP.md`.

## 1. Preparación del Proyecto (Local)

Antes de subir los archivos, necesitamos preparar la aplicación en tu entorno local.

### Opción A: Usar el script de empaquetado (Recomendado)

Si estás en Windows, puedes usar el script automatizado que hemos creado:

1.  **Ejecuta el comando**:
    ```bash
    npm run package:hostinger:build
    ```
    Esto compilará tu proyecto y creará un archivo `project_build.zip` en la carpeta raíz.

### Opción B: Manualmente

1.  **Asegúrate de tener el archivo `server.js`**:
    Ya tienes un archivo `server.js` en la raíz de la carpeta `web`. Este archivo actuará como el punto de entrada para Hostinger.

2.  **Construir la aplicación**:
    Ejecuta el siguiente comando en tu terminal para crear la versión de producción:
    ```bash
    npm run build
    ```
    Esto creará una carpeta `.next`.

3.  **Preparar los archivos para subir**:
    Crea un archivo `.zip` que contenga **SOLO** los siguientes archivos y carpetas (dentro de `web`):
    -   Carpeta `.next` (con todo su contenido)
    -   Carpeta `public`
    -   Carpeta `scripts`
    -   Archivo `package.json`
    -   Archivo `package-lock.json`
    -   Archivo `server.js`
    -   Archivo `next.config.ts`
    -   Archivo `.env` o `.env.production` (si tienes variables de entorno)

    > **Nota**: NO subas la carpeta `node_modules`. La instalaremos en el servidor.

## 2. Configuración en Hostinger (hPanel)

1.  **Accede al Administrador de Archivos**:
    -   Ve a tu panel de Hostinger.
    -   Entra en "Archivos" -> "Administrador de Archivos".
    -   Navega a la carpeta `public_html`. (Si quieres que la app esté en la raíz del dominio, borra el archivo `default.php` si existe).

2.  **Subir y Descomprimir**:
    -   Sube tu archivo `.zip` a `public_html`.
    -   Haz clic derecho en el zip y selecciona "Extract" (Extraer).
    -   Asegúrate de que los archivos (`server.js`, `.next`, etc.) queden directamente en `public_html` (o en la subcarpeta que desees, pero ajusta la ruta en el siguiente paso).

3.  **Configurar Node.js**:
    -   Vuelve al menú principal del hPanel.
    -   Busca la sección "Avanzado" y haz clic en **Node.js**.
    -   **Configuración**:
        -   **Node.js Version**: Selecciona la versión **18** o **20** (Next.js 15 requiere Node 18.17+).
        -   **Application Mode**: `Production`.
        -   **Application Root**: `public_html` (o la ruta donde subiste los archivos).
        -   **Application Startup File**: `server.js` (Esto es muy importante).
    -   Haz clic en **Create** (Crear).

4.  **Instalar Dependencias**:
    -   Una vez creada la app, verás un botón que dice **NPM Install**. Haz clic en él.
    -   Esto leerá tu `package.json` e instalará los módulos necesarios.
    -   *Nota*: Si esto falla (a veces pasa por límites de memoria), tendrás que subir tu carpeta `node_modules` desde tu PC (tarda más) o intentar instalar solo las dependencias de producción (`npm install --production`) vía SSH si tienes acceso.

5.  **Variables de Entorno**:
    -   En la misma sección de Node.js en hPanel, puedes añadir variables de entorno si no subiste el archivo `.env`.

## 3. Apuntar el Dominio (DNS)

Dado que estás usando Hosting Compartido, la IP de tu servidor es diferente a la de un VPS.

1.  En hPanel, ve a **Hosting** -> **Detalles del Plan** (o en la barra lateral izquierda, verás la IP). Copia la **Dirección IP** del sitio web.
2.  Ve a **DNS / Nameservers**.
3.  Actualiza el registro **A** principal (`@`):
    -   **Tipo**: A
    -   **Nombre**: @
    -   **Apunta a**: La IP que copiaste en el paso 1.
4.  Asegúrate de que el registro **CNAME** para `www` apunte a tu dominio raíz (`lacuevadeldruidadnd.com`).

## 4. Verificar y Reiniciar

1.  En la sección de Node.js de hPanel, haz clic en **Restart** (Reiniciar) para asegurarte de que los cambios surtan efecto.
2.  Visita tu dominio `https://lacuevadeldruidadnd.com`.

### Solución de Problemas Comunes

-   **Error 500 / App no carga**: Revisa el archivo `error_log` en el Administrador de Archivos (en `public_html` o `logs`).
-   **Next.js no encuentra módulos**: Asegúrate de que `node_modules` se creó correctamente.
-   **Problemas con `next.config.ts`**: Si tienes errores al iniciar porque Hostinger no puede leer el archivo de configuración TypeScript, intenta renombrar `next.config.ts` a `next.config.js` y convertir la sintaxis a JavaScript estándar antes de construir y subir.
