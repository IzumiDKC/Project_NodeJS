var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
let {CreateErrorRes} = require('./utils/responseHandler')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const menuRouter = require('./routes/menu');
const cartRoutes = require('./routes/cart');

var app = express();

const cors = require('cors'); 
app.use(cors({ origin: "http://localhost:3000" }));

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
app.use(express.urlencoded({ extended: false }));
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
  console.log(`Thằng này là main http://localhost:${PORT}/Products/view/all`);
});

module.exports = app;