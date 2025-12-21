// fuen necesario isntalr expresss para relizar un solicitud de los datos mas extacta y vincularla a mysql//
import express from "express";
import mysql from "mysql";
import dotenv from "dotenv";
import bcrypr from "bcrypt";
dotenv.config(); // Para leer el archivo .env

const app = express();
// app.use(express.json()); // para solicitudes con cuerpo JSON
app.use(express.urlencoded({ extended: true })); // para formularios HTML
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const S_PORT = process.env.S_PORT;
const S_HOST = process.env.S_HOST;

const LOGIN = process.env.LOGIN;
const REGISTER = process.env.REGISTER;

app.use(express.static("public")); // para poder acceder a los archivos estaticos como html, css, js, etc

// preparamos la conexion //

/**
 * Creates a connection to the MySQL database.
 *
 * @constant {mysql.Connection} conexion - The MySQL connection instance.
 * @property {string} host - The hostname of the database server (e.g., 'localhost').
 * @property {number} port - The port number on which the database server is running (default: 3306).
 * @property {string} user - The username used to authenticate with the database (e.g., 'root').
 * @property {string} password - The password used to authenticate with the database.
 * @property {string} database - The name of the database to connect to (e.g., 'smed_technology').
 */
const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// mensaje de error //

conexion.connect((err) => {
  if (err) {
    console.error("Error en la conexion del mysql:", err);
    return;
  }
  console.log("Conexion exitosa a la base de datos:", conexion.config.database);
});

// ruta del la tabal de registro //

app.post(REGISTER, async (req, res) => {
  const { nombre, apellido, email, password } = req.body;
  console.log("Datos recibidos en registro:", req.body);

  try {
    const hashedPassword = await bcrypr.hash(password, 10); //10 veces que realiza salt rounds

    const sql =
      "INSERT INTO smed_technology.smed_user (nombre, apellido, email, password) VALUES (?,?,?,?)";
    conexion.query(
      sql,
      [nombre, apellido, email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error("Error al ingresar datos:", err);
          res.status(500).send("Error al registrar un ususario");
          return;
        }
        console.log("Registro insertado:", result);
        // redireccionar a la pagina de login
        res
          .status(200)
          .send(
            `<script>alert("Te has registrado exitosamente"); window.location.href = "http://${HOST}:${PORT}/pages/login.html"</script>`
          );
      }
    );
  } catch (err) {
    console.log("Error interno", err);
    res.status(500).json({ mensaje: "Error interno" });
  }
});

// ruta del la tabal de login //
app.post(LOGIN, (req, res) => {
  const { email, password } = req.body;
  console.log("Datos recibidos en login:", req.body);

  const sql = "SELECT * FROM smed_technology.smed_user WHERE email = ?";
  conexion.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("Error al ingresar datos:", err);
      return res.status(500).json({ mensaje: "Error al consultar usuario" });
    }

    if (result.length === 0) {
      return res.status(401).json({ mensaje: "Usuario no encontrado" });
    }

    const user = result[0];
    const isPasswordValid = await bcrypr.compare(password, user.password);

    if (isPasswordValid) {
      console.log("User Found", result);
      const nombre = encodeURIComponent(user.nombre);
      res
        .status(200)
        .send(
          `<script> alert("Bienvenido ${nombre} a SMED Technology"); window.location.href = "http://${HOST}:${PORT}/pages/support_admin.html?nombre=${nombre}"; </script>`
        );
    } else {
      console.log("Incorrect Password!");
      res
        .status(401)
        .send(
          `<script> alert("Credenciales incorrectas"); window.location.href = "http://${HOST}:${PORT}/pages/login.html"; </script>`
        );
    }
  });
});

// inicio del servidor //

app.listen(S_PORT, () => {
  console.log(`El servidor esta corriendo en http://${S_HOST}:${S_PORT}`);
});
