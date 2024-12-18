const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Habilitar CORS para todas las solicitudes
app.use(cors());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '', 'index2.html'));
  //   res.send('Servidor funcionando con CORS habilitado.');
});

app.get('/js/', (req, res) => {
  console.log(req.url)
  console.log(path.join(__dirname, 'src', 'snow.js'))
  res.sendFile(path.join(__dirname, 'src', 'snow.js'));
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
