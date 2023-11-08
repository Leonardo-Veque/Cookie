//Importar o express
const express = require("express");

//Importar as bibliotecas de sessão e cookies
const session = require("express-session");
const cookieParser = require("cookie-parser");

// Inicializar o express
const app = express();

//Configurar os cookies
app.use(cookieParser());

//Configurar as sessões
app.use(
    session({
        secret: "minhaChave", //Chave secreta para assinar o cookies da sessão
        resave: false, //Evita regravar sessões sem alterações
        saveUninitialized: true, //Salva sessões não inicalizadas
    })
);

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

// Rota inical para exibir produtos
app.get("/produtos", (req, res) => {
    res.send(`
        <h1>Lista de produtos</h1>
        <ul>
            ${produtos
                .map(
                    (produto) =>
                        `<li>
                    ${produto.nome} - ${produto.preco}<a href="/adicionar/${produto.id}">Adicionar ao carrinho</a>
                    </li>`
                )
                .join("")}

        </ul>
        <a href = "/carrinho">Ver Carrinho</a>
    `);
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

    res.send(`
        <h1>Carrinho de compras</h1>
        <ul>
            ${carrinho
                .map(
                    (produto) =>
                        `<li>
                    ${produto.nome} - ${produto.preco}
                        </li>`
                )
                .join("")}

        </ul>
        <p>Total: ${total}</p>
        <a href="/produtos">Continuar comprando</a>
    `);
});

app.listen(3000, () => {
    console.log("Aplicação rodando");
});
