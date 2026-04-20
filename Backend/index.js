// Importing
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path');
const passport = require('passport');
const session = require('express-session');

require('dotenv').config();
require('./src/accounts/middleware/accounts-middleware')

// [NOT NEEDED ON VERCEL] Background tasks do not run in serverless environments
// const { setupArchiveCleanup } = require('./src/cronJobs'); 

// importing routes here
const adminsRoutes = require('./src/admin/admins-routes')
const productRoutes = require('./src/products/product-route')
const packageRoutes = require('./src/packages/package-route')
const sellerRoutes = require('./src/sellers/seller-route')
const logRoutes = require('./src/logreports/adminlog-routes')
const notificationRoutes = require('./src/services/emailNotif-routes')

// [NOT NEEDED ON VERCEL] 
const { startAutoNotifications } = require('./src/services/autoNotifSched')

// for testing
const accountsRoutes = require('./src/accounts/accounts-routes')


// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '-1');
    next();
});
app.use(cors({
    credentials: true, // ← This allows cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.text());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false,
    cookie:{
        maxAge: 24 * 60 * 60 * 1000, //supposed to be a day
        secure: true, // ← [CHANGED FOR VERCEL] Must be true because Vercel uses HTTPS
        sameSite: 'lax' // ← Important for credentials
    },

    // saveUninitialized: true,
    // cookie:{
    //     maxAge: 24 * 60 * 60 * 1000  //supposed to be a day
    // }
}))
app.use(passport.initialize());
app.use(passport.session());


// Enter routes here
app.get('/', (req,res) => {
    res.send("Test")
})

// app.use('/admins', require('./src/admin/admins-routes'))
app.use('/admins',adminsRoutes);
app.use('/products', productRoutes);
app.use('/packages', packageRoutes);
app.use('/sellers', sellerRoutes);
app.use('/logs', logRoutes);
app.use('/email/notifications', notificationRoutes);

// [NOT NEEDED ON VERCEL]
setupArchiveCleanup(); 
startAutoNotifications();

// [NOT NEEDED ON VERCEL] Serverless functions don't listen on ports
// app.listen(3000, () => {
//     console.log(`Server has started at http://localhost:3000`)
//     console.log('Cron jobs initialized');
// })

// [ADDED FOR VERCEL] You must export the app so Vercel can run it
module.exports = app;