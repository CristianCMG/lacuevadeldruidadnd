process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const fs = require('fs');
const { createServer } = require('http');
const path = require('path');
const { parse } = require('url');
const next = require('next');

const dev = false;
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = Number(process.env.PORT) || 3000;
const dir = __dirname;

console.log(`Starting server in PRODUCTION mode (Forced for Hostinger)`);
console.log(`Working directory: ${process.cwd()}`);
console.log(`App directory: ${dir}`);

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  if (Array.isArray(xf) && xf.length) return String(xf[0]).trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : 'unknown';
}

function log(level, message, context) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

const buildIdPath = path.join(dir, '.next', 'BUILD_ID');
if (!fs.existsSync(buildIdPath)) {
  console.error(`Missing Next build artifact: ${buildIdPath}`);
  console.error(`Ensure you ran "npm run build" and that ".next" was deployed to the application root.`);
  process.exit(1);
}

const app = next({ 
  dev, 
  hostname, 
  port,
  dir,
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      if (req.url && req.url.startsWith('/_next/static/')) {
        const requestUrl = new URL(req.url, `http://${hostname}:${port}`);
        const relPath = requestUrl.pathname.slice('/_next/static/'.length);

        let decodedRelPath;
        try {
          decodedRelPath = decodeURIComponent(relPath);
        } catch {
          res.statusCode = 400;
          log('warn', 'Static asset request decode failed', {
            path: req.url,
            method: req.method,
            ip: getClientIp(req),
          });
          res.end('bad request');
          return;
        }

        const staticRoot = path.resolve(dir, '.next', 'static');
        const candidatePath = path.resolve(staticRoot, decodedRelPath);

        if (!candidatePath.startsWith(staticRoot + path.sep)) {
          res.statusCode = 400;
          log('warn', 'Static asset request path traversal blocked', {
            path: req.url,
            method: req.method,
            ip: getClientIp(req),
          });
          res.end('bad request');
          return;
        }

        let stat;
        try {
          stat = await fs.promises.stat(candidatePath);
        } catch {
          res.statusCode = 404;
          log('warn', 'Static asset not found', {
            path: req.url,
            method: req.method,
            ip: getClientIp(req),
          });
          res.end('not found');
          return;
        }
        if (!stat.isFile()) {
          res.statusCode = 404;
          log('warn', 'Static asset not a file', {
            path: req.url,
            method: req.method,
            ip: getClientIp(req),
          });
          res.end('not found');
          return;
        }

        const ext = path.extname(candidatePath).toLowerCase();
        const contentType =
          ext === '.js'
            ? 'application/javascript; charset=utf-8'
            : ext === '.css'
              ? 'text/css; charset=utf-8'
              : ext === '.json'
                ? 'application/json; charset=utf-8'
                : ext === '.map'
                  ? 'application/json; charset=utf-8'
                  : ext === '.svg'
                    ? 'image/svg+xml'
                    : ext === '.png'
                      ? 'image/png'
                      : ext === '.jpg' || ext === '.jpeg'
                        ? 'image/jpeg'
                        : ext === '.webp'
                          ? 'image/webp'
                          : ext === '.gif'
                            ? 'image/gif'
                            : ext === '.ico'
                              ? 'image/x-icon'
                              : ext === '.woff2'
                                ? 'font/woff2'
                                : ext === '.woff'
                                  ? 'font/woff'
                                  : ext === '.ttf'
                                    ? 'font/ttf'
                                    : ext === '.eot'
                                      ? 'application/vnd.ms-fontobject'
                                      : 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Length', String(stat.size));

        if (req.method === 'HEAD') {
          res.statusCode = 200;
          res.end();
          return;
        }

        res.statusCode = 200;
        const stream = fs.createReadStream(candidatePath);
        stream.on('error', (err) => {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end('internal server error');
          } else {
            res.destroy();
          }
          log('error', 'Static asset stream error', {
            path: req.url,
            method: req.method,
            ip: getClientIp(req),
            error: err && err.message ? err.message : String(err),
          });
        });
        stream.pipe(res);
        return;
      }

      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
