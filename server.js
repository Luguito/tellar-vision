import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Habilitar CORS para todas las solicitudes
app.use(cors());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '', 'index.html'));
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(join(__dirname, '', 'favicon.ico'));
});
app.get('/js/:filename', (req, res) => {
  const { filename } = req.params;

  res.sendFile(join(__dirname, 'src', `${filename}.js`));
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
