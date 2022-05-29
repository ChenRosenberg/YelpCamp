if(process.env.NODE_ENV !== "production") {
    //from commend line run = "NODE_ENV=production node app.js"
    require('dotenv').config();
    // we have map token as well that we we need in prod.
};


//console.log(process.env.CLOUDINARY_SECRET);
// console.log(process.env.API_KEY);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const timeNow = require('./models/timeExport'); //wasn't able

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const MongoDBStore = require('connect-mongo');

//const dbUrl = process.env.DB_URL;
//const dbUrl = 'mongodb://localhost:27017/yelp-camp'; 

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

main().catch(err => console.log(`OH No! Mongo Connecton Error: ${err}`));

async function main() {
    await mongoose.connect(dbUrl);
    // await mongoose.connect(dbUrl); //for production perpose
    console.log("Mongo connection Open");
    let currentdate = new Date(); 
    let datetime = "Last Sync: " + currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() + " @ "  
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
    console.log(datetime);
    //console.log(timeNow);


};

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection Error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
//app.use(express.static('public')); //instead use the next line
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
// //or if we'll want to replace them:
// app.use(mongoSanitize({
//       replaceWith: '_',
//     }),
//   );

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,  //the time in SECONDS that will save data,
    crypto: {
        secret
    }
});


store.on('error', function(e){
    console.log('SESSION STORE ERROR!', e);
});

const sessionConfig = {
    store,
    name: 'session', //the cookie name
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true, //not working on local host only on https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());
// // //app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/",
    "https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.js",
    "https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.css"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/",
    "https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.js",
    "https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.css"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dv5vm4sqh/",
    "https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.css"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dv5vm4sqh/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/besiyata/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/dv5vm4sqh/" ],
            childSrc   : [ "blob:" ]
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    //console.log(req.query);
    //all those variables will be availabe in each place
    if (!['/login', '/register', '/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
        // if a pic is not right it will get the image link here
        // console.log('At app.js: ln 78:')
        // console.log('req.originalUrl = ',req.originalUrl);
        // console.log('req.session.returnTo = ',req.session.returnTo);
    }       
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error'); 
    //console.log(req.session);
    next();
})

app.get('/fakeUser', async(req, res)=>{
    const user = new User({email: 'chennn@gmail.com', username: 'chennn'});
    const newUser = await User.register(user, 'chennn');
    console.log(newUser);
    res.send(newUser);
    
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title: 'My Backyard', description: 'Cheap Camping!'});   
//     await camp.save();
//     res.send(camp);
// })


//will only run if the route requested is not any of the above
app.all('*', (req, res, next) => {
    //res.send('404!') //instead we will use the error app we've built
    next(new ExpressError('Page Not Found', 404));
})

app.use((err,req, res, next) =>{
    // res.send('Oh Boy, Something went wrong!');  //instead we will use the error app we've built 
    //const { statusCode = 500, message = 'Something Went Wrong'} = err;
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No, Something went wrong'
    //res.status(statusCode).send(message);
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 3000 //3000 needs to be in ""?
app.listen(port, () => {
    console.log(`Serving on Port ${port}`);
});