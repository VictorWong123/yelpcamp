const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const mongoose = require('mongoose')
const ExpressError = require('./utils/ExpressError')
const session = require('express-session')
const flash = require('connect-flash')
mongoose.connect('mongodb://localhost:27017/yelp-camp')

const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected")
})
const methodOverride = require('method-override');

app.engine('ejs', ejsMate)
app.set('view engine', "ejs")
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'shouldbebettersecret',
    resave: false,
    saveUnitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) => {
    res.render('home')
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = "Oh no somehting went wrong"
    res.status(statusCode).render('errors', { err })

})

app.listen(3000, () => {
    console.log('on port 3000')
})