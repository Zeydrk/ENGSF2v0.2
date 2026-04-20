// all required packages
const models = require("../../../models")

// middleware functions

async function checkAccount(req,res,next){
    const email = req.body.email
    const admins = await models['Admin'].findOne({where:{email:email}})
    if(admins){
        return res.status(409).send("Account already exists")  
    }
    next()
}

module.exports = checkAccount