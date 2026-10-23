// Aplicacion vulnerable A PROPOSITO para el laboratorio SAST con Semgrep
const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));

// 8. Contrasena de la base de datos escrita en el codigo
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Admin2026!",
  database: "tienda"
});

// 1. Inyeccion SQL
app.get("/usuario", (req, res) => {
  const sql = "SELECT * FROM usuarios WHERE id = " + req.query.id;
  db.query(sql, (err, filas) => res.json(filas));
});

// 2. XSS reflejado
app.get("/saludo", (req, res) => {
  res.send("<h1>Hola " + req.query.nombre + "</h1>");
});

// 3. Inyeccion de comandos
app.get("/ping", (req, res) => {
  exec("ping -c 1 " + req.query.host, (err, salida) => res.send(salida));
});

// 4. Uso de eval con datos del usuario
app.post("/calcular", (req, res) => {
  const resultado = eval(req.body.expresion);
  res.send("Resultado: " + resultado);
});

// 5. Secreto JWT escrito en el codigo
app.post("/login", (req, res) => {
  const token = jwt.sign({ usuario: req.body.usuario }, "secreto123");
  res.json({ token });
});

// 6. Path traversal
app.get("/archivo", (req, res) => {
  res.sendFile(path.join(__dirname, "publico", req.query.nombre));
});

// 7. Redireccion abierta
app.get("/ir", (req, res) => {
  res.redirect(req.query.url);
});

app.listen(3000, () => console.log("App escuchando en el puerto 3000"));
