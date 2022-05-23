//Modulos 
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const getCookie = require("../helpers/cookie")
//Rotas
//Get

//Categorias
router.get("/", getCookie.getCookie, (req, res) => {
    res.render("admin/index")
})

router.get("/posts", (req, res) => {
    res.send("Página de posts")
})

router.get("/categorias", getCookie.getCookie, (req, res) => {
    //Buscando dados para renderizar no Handlebars
    Categoria.find().then((categorias) => {
        res.render("admin/categorias", { categorias })
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })

})

router.get("/categorias/add", getCookie.getCookie, (req, res) => {
    res.render("admin/addCategorias")
})

router.get("/categorias/edit/:id",  getCookie.getCookie, (req, res) => {
    //Buscando dados pelo ID
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render("admin/editCategorias", { categoria })
    }).catch((error) => {
        req.flash("error_msg", "Essa categoria não existe")
        res.redirect("/admin")
    })

})



//Postagens
router.get("/postagens", getCookie.getCookie, (req, res) => {
    //Renderizando postagens
    Postagem.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render("admin/postagens", { postagens })
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens!")
        res.redirect("/admin")
    })

})

router.get("/postagens/add", getCookie.getCookie, (req, res) => {
    //Renderizando formulario de postagens
    Categoria.find().then((categoria) => {
        res.render("admin/addPostagem", { categoria })
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulirio!")
        res.redirect("/admin/postagens")
    })

})

router.get("/postagens/edit/:id", getCookie.getCookie, (req, res) => {

    Postagem.findOne({ _id: req.params.id }).then((postagens) => {

        Categoria.find().then((categorias) => {
            res.render("admin/editPostagens", { postagens, categorias })

        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao carregar as categorias!")
            res.redirect("/admin/postagens")
        })

    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario de edição!")
        res.redirect("/admin/postagens")
    })

})

router.get("/postagens/deletar/:id", getCookie.getCookie, (req, res) => {
    //Deletando postagem do banco de dados
    Postagem.deleteOne({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem!")
        res.redirect("/admin/postagens")
    })
})

//Post
//Categorias
router.post("/categorias/nova", (req, res) => {
    //Validando dados do formulario
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }
    if (req.body.nome.length <= 2) {
        erros.push({ texto: "Nome muito pequeno, utilize no minimo 3 caracteres" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug Inválido" })
    }
    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros })
    } else {

        //Salvando categoria no banco de dados
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug,
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria")
            res.redirect("/admin/categorias")
        })
    }
})

router.post("/categorias/edit", (req, res) => {
    //Validando dados do formulario
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }
    if (req.body.nome.length <= 2) {
        erros.push({ texto: "Nome muito pequeno, utilize no minimo 3 caracteres" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug Inválido" })
    }
    if (erros.length > 0) {
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {
            res.render("admin/editCategorias", { erros: erros, categoria })
        })

    } else {
        //Buscando no banco de dados pelo ID
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((error) => {
                req.flash("error_msg", "Houve um erro ao editar a categoria.")
                res.redirect("/admin/categorias")
            })

        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria")
            res.redirect("/admin/categorias")
        })
    }
})

router.post("/categorias/deletar", (req, res) => {
    //Buscando no banco de dados e deletando
    Categoria.findByIdAndDelete({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao deletar essa categoria!")
    })
})

//Postagens
router.post("/postagens/nova", (req, res) => {
    //Validando dados
    var erros = []

    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria invalida, registre uma categoria!" })
    }
    if (erros.length > 0) {
        res.render("admin/addPostagem", { erros })
    } else {
        //Salvando no banco de dados
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao salvar a postagem!")
            res.redirect("/admin/postagens")
        })
    }
})

router.post("/postagens/edit", (req, res) => {
    //Salvando postagem editada no banco de dados
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {

       
            postagem.titulo = req.body.titulo
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria
            postagem.slug = req.body.slug
        

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")

        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao salvar a postagem!")
            res.redirect("/admin/postagens")
        })

    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao editar a postagem!")
        res.redirect("/admin/postagens")
    })
})

module.exports = router