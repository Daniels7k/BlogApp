//Módulos
const express = require("express")
const app = express()
const cookieParser = require('cookie-parser');
const { engine } = require("express-handlebars")
const mongoose = require("mongoose")
const adminRoute = require("./routes/admin")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const authUser = require("./helpers/authUser")
const authAdmin = require("./helpers/authAdmin")
const getUser = require("./helpers/cookie")

//Configurações

//Session
app.use(session({
    secret: "BlogAPP89461321",
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

//Middleware

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next()
})

//Bodyparser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//Handlebars
app.engine('handlebars', engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views')

//Mongoose
mongoose.connect("mongodb+srv://curso:curso@cluster0.mv0re.mongodb.net/BlogAPP", (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("Mongo Connected")
    }
})

//Public
app.use(express.static(path.join(__dirname, "public")))

//Rotas
app.get("/", getUser.getCookie, (req, res) => {
    //Renderizando postagens para a pagina principal
    Postagem.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render("index", { postagens })
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens!")
        res.redirect("/404")
    })

})

app.get("/postagem/:slug", getUser.getCookie, (req, res) => {
    //Procurando a postagem no banco de dados
    Postagem.findOne({ slug: req.params.slug }).then((postagem) => {
        if (postagem) {
            res.render("postagem/index", { postagem })
        } else {
            req.flash("error_msg", "Essa postagem não existe!")
            res.redirect("/")
        }
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao listar essa postagem")
        res.redirect("/")
    })
})

app.get("/categorias", getUser.getCookie, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("categorias/index", { categorias })
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias!")
        res.redirect("/")
    })
})
app.get("/categorias/:slug", getUser.getCookie, (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).then((categoria) => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).then((postagens) => {
                res.render("categorias/postagens", { postagens, categoria })
            }).catch((error) => {
                req.flash("error_msg", "Houve um erro ao listar as postagens dessa categoria!")
                res.redirect("/")
            })

        } else {
            req.flash("error_msg", "Essa categoria não existe!")
            res.redirect("/")
        }
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao carregar a página dessa categoria!")
        res.redirect("/")
    })
})
app.get("/404", (req, res) => {
    res.send("erro 404!")
})

//Routes
app.use("/admin",  authUser, authAdmin, adminRoute, getUser.getCookie,)

app.use("/usuarios", getUser.getCookie, usuarios)

//Outros
const PORT = 3000;
app.listen(PORT, () => { console.log("Server running on port", PORT) })