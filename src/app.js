const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const restaurantsRouter = require('./routes/restaurants');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.json');
const expensesRouter = require('./routes/expenses');
const billingRouter = require('./routes/billing');
const foodRouter = require('./routes/food');
const debugRouter = require('./routes/debug');
const usersRouter = require('./routes/users');

const app = express();
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use('/restaurants', restaurantsRouter);
app.use('/expenses', expensesRouter);
app.use('/billing', billingRouter);
app.use('/users', usersRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/debug', debugRouter);

app.use('/food', foodRouter);

app.get('/', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
