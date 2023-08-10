const express=require('express');
const app = express();
const connectToMongo=require('./DataContext/dataBase')
const cors = require('cors')

var cookieSession = require('cookie-session')
//connectToMongo();

const oneDay = 1000 * 60 * 60 * 24;
app.use(express.static('uploads'))
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(cors());

//CookieSession for store user session at browzer
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: oneDay
  }))



app.use('/',require('./Controller/Product.js'))
app.use('/user', require('./Controller/User'));
app.use('/sqlUser', require('./Controller/User'));

//api 
app.use('/api.user', require('./Controller/api.User'));
app.use('/api.product', require('./Controller/api.Product'));


app.listen(process.env.PORT || 8080, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});