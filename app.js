var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
let {CreateErrorRes} = require('./utils/responseHandler')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const menuRouter = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const voucherRoute = require('./routes/voucher');
var app = express();

const cors = require('cors'); 
app.use(cors({ origin: "http://localhost:3000" }));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
      maxAge: 1000 * 60 * 60 
  }
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // user login
  res.locals.successMessage = req.session.successMessage || null;
  res.locals.errorMessage = req.session.errorMessage || null;
  next();
});

mongoose.connect("mongodb://localhost:27017/S5");
mongoose.connection.on('connected',()=>{
  console.log("Database connected");
})
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');
var methodOverride = require('method-override');
app.use(methodOverride('_method'));  // Giả lập PUT, DELETE

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.set('layout', 'layouts/layout'); // Đặt layout mặc định cho tất cả các view
app.set('views', path.join(__dirname, 'views'));

app.set('layout', 'layouts/layout');

app.use(express.static('public')); 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/menu', menuRouter); 
app.use('/roles', require('./routes/roles'));
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));
app.use('/cart', require('./routes/cart'));
app.use('/brands', require('./routes/brands'));
app.use('/voucher', voucherRoute);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  CreateErrorRes(res,err.message,err.status||500);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang hoạt động ở cổng http://localhost:${PORT}`);
  console.log(`Login: http://localhost:${PORT}/Auth/Login`);
  console.log(`Product: http://localhost:${PORT}/Products/view/all`);
});

module.exports = app;