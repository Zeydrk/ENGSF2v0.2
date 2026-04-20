// insert required packages
const jwt = require('jsonwebtoken')


// insert models here
const models = require('../../models')


// functions for CRUD
// not sure if I will use this for the accounts
async function createAccount(req, res) {
    const account = await models['Account'].create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        contactNo: req.body.contactNo
    })
    res.send(account)
}

async function createAccount2(req,res){
    const seller = await models["Seller"].create({
        seller_FName: req.body.seller_FName,
        seller_LName: req.body.seller_LName,
        seller_Email: req.body.seller_Email,
        seller_Password: req.body.seller_Password,
        seller_ContactNo: req.body.seller_ContactNo
    })
    res.send(seller)
}

// async function login(req,res){
//     if (req.body == email && password){
//         res.send("here is the admin")
//     }
//     else{
//         res.send("here is the seller")
//     }
//     const { seller_Email, seller_Password } = req.body;
//     const { email, password} = req.body
//     const admin = await models['Admin'].findOne({ where: { email, password } });
//     const seller = await models['Seller'].findOne({ where: { seller_Email, seller_Password } });
//     if (seller){
//         res.status(200).send({
//             code: 200,
//             message: "Welcome Seller " + seller.seller_FName
//         });
//     }
//     if (admin){
//         res.status(200).json({
//             code: 200,
//             message: "Welcome Admin"
//         });
//         res.send(admin);
//     }
// }



async function login(req,res,next){
    if (req.isAuthenticated()){
       next()
    }
    else{
        res.status(401).send("error 401: Unauthorized")
    }
}

async function loginRole(req,res){
    if(req.user.role === "admin"){
        res.send({
            status: 200,
            message:"Welcome Admin"})
    }
    else if (req.user.role === 'seller'){
        res.send({
            status: 200,
            message:"Welcome Seller"})
    }
    else{
        res.send("An error occured")
    }
}





async function getAccount(req,res){
    const admin = await models['Admin'].findByPk()
}

// Exporting
module.exports = {
    createAccount,
    createAccount2,
    login,
    loginRole,
}
