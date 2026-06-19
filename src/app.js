const express = require('express');
const dotenv = require('dotenv');
const restaurantsRouter = require('./routes/restaurants');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.json');
const expensesRouter = require('./routes/expenses');
const billingRouter = require('./routes/billing');
const foodRouter = require('./routes/food');
const debugRouter = require('./routes/debug');

dotenv.config();

const app = express();
app.use(express.json());

app.use('/restaurants', restaurantsRouter);
app.use('/expenses', expensesRouter);
app.use('/billing', billingRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/debug', debugRouter);

app.use('/food', foodRouter);

app.get('/', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
