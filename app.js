// Aplicacion CORREGIDA: misma funcionalidad, sin las vulnerabilidades
const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const dns = require("dns").promises;
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));

// 8. Corregido: los datos de conexion se leen de variables de entorno
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// 1. Corregido: consulta parametrizada con "?"
app.get("/usuario", (req, res) => {
  db.query("SELECT * FROM usuarios WHERE id = ?", [req.query.id], (err, filas) => res.json(filas));
});

// 2. Corregido: se responde JSON, no HTML armado con datos del usuario
app.get("/saludo", (req, res) => {
  res.json({ saludo: "Hola " + String(req.query.nombre || "") });
});

// 3. Corregido: no se ejecutan comandos del sistema; se valida el host y se usa DNS
app.get("/ping", async (req, res) => {
  const host = String(req.query.host || "");
  if (!/^[a-zA-Z0-9.-]{1,253}$/.test(host)) {
    return res.status(400).json({ error: "Host invalido" });
  }
  try {
    const respuesta = await dns.lookup(host);
    res.json({ host, ip: respuesta.address, alcanzable: true });
  } catch (e) {
    res.json({ host, alcanzable: false });
  }
});

// 4. Corregido: sin eval; solo operaciones permitidas con numeros
const OPERACIONES = {
  sumar: (a, b) => a + b,
  restar: (a, b) => a - b,
  multiplicar: (a, b) => a * b,
  dividir: (a, b) => (b !== 0 ? a / b : null)
};
app.post("/calcular", (req, res) => {
  const a = Number(req.body.a);
  const b = Number(req.body.b);
  const op = String(req.body.op || "");
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Object.hasOwn(OPERACIONES, op)) {
    return res.status(400).json({ error: "Datos invalidos" });
  }
  res.json({ resultado: OPERACIONES[op](a, b) });
});

// 5. Corregido: el secreto JWT viene de una variable de entorno y el token expira
app.post("/login", (req, res) => {
  const token = jwt.sign({ usuario: String(req.body.usuario || "") }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// 6. Corregido: solo el nombre del archivo, siempre dentro de la carpeta publica
const CARPETA_PUBLICA = path.join(__dirname, "publico");
app.get("/archivo", (req, res) => {
  const nombre = path.basename(String(req.query.nombre || ""));
  res.sendFile(nombre, { root: CARPETA_PUBLICA });
});

// 7. Corregido: solo se redirige a destinos de una lista permitida
const DESTINOS = { inicio: "/", ayuda: "/ayuda" };
app.get("/ir", (req, res) => {
  const clave = String(req.query.destino || "");
  if (!Object.hasOwn(DESTINOS, clave)) {
    return res.status(400).json({ error: "Destino no permitido" });
  }
  res.redirect(DESTINOS[clave]);
});

app.listen(3000, () => console.log("App escuchando en el puerto 3000"));
