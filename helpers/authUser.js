const jwt = require("jsonwebtoken")
const segredo = "segredo-secreto"

//Validação por JWT
module.exports = function (req, res, next) {

    const token = req.cookies.authorizathionToken

    if (!token) {
        req.flash("error_msg", "Você precisa estar logado para acessar essa rota!")
        res.redirect("/")
    } else {

        try {
            const userVerified = jwt.verify(token, segredo)
            req.user = userVerified
            res.locals.user = req.cookies.authorizathionToken
            next()

        } catch (error) {
            console.log(error)
            req.flash("error_msg", "Houve um erro na autenticação.")
            res.redirect("/")
        }
    }
}

