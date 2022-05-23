//Modulos
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { json } = require("express/lib/response")
const segredo = "segredo-secreto"

//Rotas

//Registro
router.get("/registro", (req, res) => [
    res.render("usuarios/registro")
])

router.post("/registro", (req, res) => {
    //Validando dados
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome Inválido!" })
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "E-mail Inválido!" })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha Inválida!" })
    }

    if (req.body.senha.length < 8) {
        erros.push({ texto: "Senha muito curta, utilize no minimo 8 caracteres." })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senhas são diferentes, tente novamente!" })
    }

    if (erros.length > 0) {
        res.render("usuarios/registro", { erros })
    } else {
        //Verificando preexistência do usuario no Banco de dados
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta com esse email, tente outro")
                res.redirect("/usuarios/registro")
            } else {
                //Salvando no bando de dados.
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                //Hasheando a senha 
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamente da sua conta, tente novamente!")
                            res.redirect("/")
                        } else {
                            novoUsuario.senha = hash

                            novoUsuario.save().then(() => {
                                req.flash("success_msg", "Usuário criado com sucesso")
                                res.redirect('/')
                            }).catch((error) => {
                                req.flash("error_msg", "Houve um erro ao registrar, tente novamente.")
                            })
                        }
                    })
                })


            }
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao tentar registrar!")
            res.redirect("/")
        })
    }

})

//Login

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", async(req, res) => {

   await Usuario.findOne({ email: req.body.email }).then((usuario) => {
        //Verificiando a preexistencia no banco de dados
        if (!usuario) {
            req.flash("error_msg", "Email não cadastrado, tente se registrar!")
            res.redirect("/usuarios/login")
        }

        //Verificando senha 
        bcrypt.compare(req.body.senha, usuario.senha).then((senhaAceita) => {
            if (!senhaAceita) {
                req.flash("error_msg", "Email ou senha incorretos!")
                res.redirect("/usuarios/login")
            } else {
                //Criando token de autorização e armazenando em um cookie
                const token = jwt.sign({ id: usuario.id, admin: usuario.admin, nome: usuario.nome }, segredo)
                res.cookie("authorizathionToken", token) 
                req.flash("success_msg", "Logado com sucesso!")
                res.redirect("/")
            }
        }).catch((error) => {
            console.log(error)
        })
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro interno!")
        res.redirect("/usuarios/login")
    })
})

//Logout 

router.get( "/logout", (req, res) => {
    var cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }
        res.cookie(prop, '', { expires: new Date(0) });
    }
    req.flash("success_msg", "Logout feito com sucesso!")
    res.redirect('/');
})

router.get("/cookie", (req, res) => {
    token = {
        cookie: req.cookies.authorizathionToken
    } 

    res.send(token)
})

module.exports = router