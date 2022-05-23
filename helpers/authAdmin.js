module.exports =
    function (req, res, next) {
        if (req.user.admin) {
            res.locals.user = req.user.nome
            next()
        }
        else {
            req.flash("error_msg", "Você não tem autorização para acessar essa rota!")
            res.redirect("/")
        }
    }
