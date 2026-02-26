# Configuración del Dominio y Hosting en Hostinger

Este documento detalla los pasos para configurar el dominio `lacuevadeldruidadnd.com` en Hostinger y preparar el entorno de hosting (VPS) para el despliegue de la aplicación Next.js.

## 1. Verificación de Dominio y DNS

El dominio `lacuevadeldruidadnd.com` está registrado y apuntando a Hostinger.

- **Estado Actual**:
  - Dominio: `lacuevadeldruidadnd.com`
  - Dirección IP (A Record): `2.57.91.91`
  - Estado: **Activo y Propagado** (Verificado mediante Ping)

### Configuración DNS Requerida

Asegúrese de que los registros DNS en el panel de Hostinger (sección "DNS / Nameservers") coincidan con lo siguiente:

| Tipo | Nombre | Valor (Apunta a) | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `2.57.91.91` | 14400 |
| **CNAME** | `www` | `lacuevadeldruidadnd.com` | 14400 |

## 2. Preparación del Entorno VPS (Hostinger)

Dado que estamos utilizando una aplicación Next.js con funcionalidades de servidor (API Routes, SSR), **no podemos usar un Hosting Compartido estándar**. Se requiere un **VPS** (Virtual Private Server).

### Paso 2.1: Acceso al Servidor

1.  Inicie sesión en el panel de Hostinger.
2.  Vaya a la sección **VPS** y seleccione su servidor.
3.  Obtenga la contraseña de `root` (o restablézcala si es necesario).
4.  Conéctese vía SSH desde su terminal local:
    ```bash
    ssh root@2.57.91.91
    ```

### Paso 2.2: Instalación de Dependencias

Ejecute los siguientes comandos en el servidor VPS para instalar Node.js, PM2 y Nginx:

```bash
# Actualizar el sistema
apt update && apt upgrade -y

# Instalar Node.js (Versión 18 o superior)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar instalación
node -v
npm -v

# Instalar PM2 (Gestor de procesos)
npm install -g pm2

# Instalar Nginx (Servidor Web / Proxy Inverso)
apt install -y nginx
```

## 3. Configuración de Nginx y SSL

Nginx actuará como un "proxy inverso", redirigiendo el tráfico del puerto 80/443 (Web) al puerto 3000 (Next.js).

### Paso 3.1: Configurar el Bloque de Servidor

Cree el archivo de configuración:
```bash
nano /etc/nginx/sites-available/lacuevadeldruidadnd.com
```

Pegue el siguiente contenido:

```nginx
server {
    listen 80;
    server_name lacuevadeldruidadnd.com www.lacuevadeldruidadnd.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Habilite el sitio y reinicie Nginx:
```bash
ln -s /etc/nginx/sites-available/lacuevadeldruidadnd.com /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Paso 3.2: Instalar Certificado SSL (HTTPS)

Utilice Certbot para obtener un certificado SSL gratuito de Let's Encrypt:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d lacuevadeldruidadnd.com -d www.lacuevadeldruidadnd.com
```
Siga las instrucciones en pantalla (seleccione redirigir HTTP a HTTPS).

## 4. Próximos Pasos (Despliegue)

El entorno está listo. Para desplegar la aplicación:

1.  Clone el repositorio en el VPS (o copie los archivos compilados).
2.  Instale las dependencias (`npm install`).
3.  Configure el archivo `.env.local` con las credenciales de producción.
4.  Construya la aplicación (`npm run build`).
5.  Inicie la aplicación con PM2:
    ```bash
    pm2 start npm --name "druida-app" -- start
    pm2 save
    pm2 startup
    ```
