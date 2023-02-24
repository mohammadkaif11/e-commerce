const express=require('express');
const app = express();
const connectToMongo=require('./DataContext/dataBase')
var cookieSession = require('cookie-session')
connectToMongo();
const oneDay = 1000 * 60 * 60 * 24;
app.use(express.static('uploads'))
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}))
app.use(express.json());

//CookieSession for store user session at browzer
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: oneDay
  }))



app.use('/',require('./Controller/Product.js'))
app.use('/user', require('./Controller/User'));


app.listen(process.env.PORT || 8080, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});