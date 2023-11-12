const fs = require("fs");

//Importar o express
const express = require("express");

//Importar as bibliotecas de sessão e cookies
const session = require("express-session");
const cookieParser = require("cookie-parser");

// Inicializar o express
const app = express();

//Importação do CSRF
const csrf = require("csurf");

//Importação do bcrypt para encrypt a senha
const bcrypt = require("bcrypt");
const saltRounds = 10;

//Configurar os cookies
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

//Configurar as sessões
app.use(
  session({
    secret: "minhaChave", //Chave secreta para assinar o cookies da sessão
    resave: false, //Evita regravar sessões sem alterações
    saveUninitialized: true, //Salva sessões não inicalizadas
  })
);
//Importação do env
const dotenv = require("dotenv");

dotenv.config({
  path: "./.env",
});

//Importação do mysql
// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: process.env.DARTABASE_HOST,
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE,
// });

//Importação do path
const path = require("path", __dirname + "/public");
const publicDirectory = path.join("");
app.use(express.static(publicDirectory));

app.use(csrf({ cookie: true }));
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();

  next();
});

const produtos = [
  {
    id: 1,
    nome: "Arroz",
    preco: 25,
  },
  {
    id: 2,
    nome: "Feijão",
    preco: 28,
  },
  {
    id: 3,
    nome: "Bife",
    preco: 40,
  },
];

// db.connect((error) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Conecção feita");
//   }
// });
app.set("views", __dirname + "/views");
app.set("view engine", "hbs");

//Rota inicial
app.get("/", (req, res) => {
  res.render("index", { csrfToken: req.csrfToken() });
});

//Auth
app.post("/login", async (req, res) => {
  const login = req.body.login;
  //Encriptando a senha
  const senha = req.body.senha;

  // db.query("SELECT * FROM login WHERE login = ? ", [login], (err, results) => {
  //   const result = results[0];

  //   bcrypt.compare(senha, result.senha).then(function (match) {
  //     if (match) {
  //       res.redirect("/produtos");
  //     } else {
  //       res.redirect("/");
  //       console.log("Senha incorreta");
  //     }
  //   });
  // });

  fs.readFile("./login.json", (err, file) => {
    if (err) {
      res.statusCode = 500;
      res.end(err.code);
      return;
    }
    const logins = JSON.parse(file);

    for (let i = 0; i < logins.length; i++) {
      const log = logins[i];

      if (log.login != login) continue;

      bcrypt.compare(senha, log.senha).then(function (match) {
        if (match) {
          res.redirect("/produtos");
        } else {
          res.redirect("/");
          console.log("Senha incorreta");
        }
      });
    }
  });
});

// Rota inical para exibir produtos
app.get("/produtos", (req, res) => {
  res.render("produtos", { produtos });
});

//Rota de Adicionar
app.get("/adicionar/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const produto = produtos.find((p) => p.id === id);

  if (produto) {
    if (!req.session.carrinho) {
      req.session.carrinho = [];
    }
    req.session.carrinho.push(produto);
  }
  res.redirect("/produtos");
});

//Carrinho rota
app.get("/carrinho", (req, res) => {
  const carrinho = req.session.carrinho || [];
  const total = carrinho.reduce((acc, produto) => acc + produto.preco, 0);

  res.render("carrinho", { carrinho, total });
});

async function hashPassword(senha) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(senha, salt);

    return hash;
  } catch (error) {
    throw error;
  }
}

app.listen(3000, () => {
  console.log("Aplicação rodando");
});
