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
const inventoryRouter = require('./routes/inventory');
const ordersRouter = require('./routes/orders');
const customersRouter = require('./routes/customers');
const rolesRouter = require('./routes/roles');

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

app.use('/api/v1/restaurants', restaurantsRouter);
app.use('/api/v1/expenses', expensesRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/roles', rolesRouter);
app.use('/api/v1/customers', customersRouter);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/debug', debugRouter);

app.use('/api/v1/food', foodRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/orders', ordersRouter);

app.get('/', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
