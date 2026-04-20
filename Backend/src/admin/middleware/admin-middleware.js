  // all required packages
  const passport = require('passport')
  const session = require('express-session')
  const model = require('../../../models')
  const LocalStrategy = require('passport-local')

  // all midlleware functions 
 

  // Serializing za user
  passport.serializeUser((user, done) =>{
    done(null,user.email, user.id)
  })

  // deserializing za user
  passport.deserializeUser(async (email, id, done) =>{
    const result =  await model['Admin'].findOne({ where: { email: email, id: id} })
    if (result) {
      done(null, result)
    }
    else {
      done (null, false)
    }
  })

  // test for exporting local strategy
  passport.use(
    new LocalStrategy({usernameField: 'email', passwordField: 'password'},
      async (email, password, done) => {
      const result = await model['Admin'].findOne({ where: { email: email, password: password } })
      if (result !== null){
        done (null, result)
      }
      else{
        done (null, false)
      }
    })

  )
  module.exports = passport
