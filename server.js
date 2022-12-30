const express=require('express');
const bodyParser = require('body-parser');
const app = express();
const connectToMongo=require('./DataContext/dataBase')
const session=require('express-session');
var flash = require('connect-flash');
connectToMongo();
const oneDay = 1000 * 60 * 60 * 24;
app.use(flash()); // 
app.use(express.static('uploads'))
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(session({
    secret:"this is my sceret bby thats is ",
    saveUninitialized:false,
    cookie: { maxAge: oneDay },
    resave: true 
}));



app.use('/',require('./Controller/Product.js'))
app.use('/user', require('./Controller/User'));



app.listen(process.env.PORT || 8080, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});