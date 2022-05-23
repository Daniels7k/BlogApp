const jwt = require("jsonwebtoken")

function getCookie (req, res, next){
   const token = req.cookies.authorizathionToken
   var decode = jwt.decode(token , {complete: true})

   try {
    res.locals.user = decode.payload
    next()
   } catch (error) {
        next()       
   }



} 

module.exports = {getCookie}