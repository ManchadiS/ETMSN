const fs = require('fs');

const spec = {
  openapi: '3.0.0',
  info: { title: 'Restaurant Management API', version: '1.0.0', description: 'API for managing restaurants, menus, expenses and billing.' },
  servers: [{ url: 'http://localhost:3000', description: 'Local development server' }],
  tags: [
    { name: 'Restaurants', description: 'Manage restaurants' },
    { name: 'Food', description: 'Menu / food items' },
    { name: 'Expenses', description: 'Track expenses' },
    { name: 'Billing', description: 'Manage billings/invoices' }
  ],
  paths: {
    '/': { get: { tags: ['Restaurants'], summary: 'API root', operationId: 'getRoot', responses: { '200': { description: 'Service status', content: { 'application/json': { example: { status: 'ok' } } } } } } },
    '/restaurants': {
      get: { tags: ['Restaurants'], summary: 'List restaurants', operationId: 'listRestaurants', responses: { '200': { description: 'A list of restaurants', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Restaurant' } } } } } } },
      post: { tags: ['Restaurants'], summary: 'Create a restaurant', operationId: 'createRestaurant', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RestaurantCreate' } } } }, responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } } } } } }
    },
    '/restaurants/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Restaurant UUID' }],
      get: { tags: ['Restaurants'], summary: 'Get a restaurant', operationId: 'getRestaurant', responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } } } }, '404': { description: 'Not Found' } } },
      put: { tags: ['Restaurants'], summary: 'Update a restaurant', operationId: 'updateRestaurant', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RestaurantCreate' } } } }, responses: { '200': { description: 'Updated' }, '404': { description: 'Not Found' } } },
      delete: { tags: ['Restaurants'], summary: 'Delete a restaurant', operationId: 'deleteRestaurant', responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } }
    },
    '/food': {
      get: { tags: ['Food'], summary: 'List food items', operationId: 'listFood', responses: { '200': { description: 'A list of food items', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Food' } } } } } } },
      post: { tags: ['Food'], summary: 'Create a food item', operationId: 'createFood', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/FoodCreate' } } } }, responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Food' } } } } } }
    },
    '/food/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Food'], summary: 'Get a food item', operationId: 'getFood', responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Food' } } } }, '404': { description: 'Not Found' } } },
      put: { tags: ['Food'], summary: 'Update a food item', operationId: 'updateFood', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/FoodCreate' } } } }, responses: { '200': { description: 'Updated' }, '404': { description: 'Not Found' } } },
      delete: { tags: ['Food'], summary: 'Delete a food item', operationId: 'deleteFood', responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } }
    },
    '/expenses': {
      get: { tags: ['Expenses'], summary: 'List expenses', operationId: 'listExpenses', responses: { '200': { description: 'A list of expenses', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Expense' } } } } } } },
      post: { tags: ['Expenses'], summary: 'Create an expense', operationId: 'createExpense', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseCreate' } } } }, responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Expense' } } } } } }
    },
    '/expenses/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Expenses'], summary: 'Get an expense', operationId: 'getExpense', responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Expense' } } } }, '404': { description: 'Not Found' } } },
      put: { tags: ['Expenses'], summary: 'Update an expense', operationId: 'updateExpense', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseCreate' } } } }, responses: { '200': { description: 'Updated' }, '404': { description: 'Not Found' } } },
      delete: { tags: ['Expenses'], summary: 'Delete an expense', operationId: 'deleteExpense', responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } }
    },
    '/billing': {
      get: { tags: ['Billing'], summary: 'List billings', operationId: 'listBilling', responses: { '200': { description: 'A list of billings', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Billing' } } } } } } },
      post: { tags: ['Billing'], summary: 'Create a billing', operationId: 'createBilling', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BillingCreate' } } } }, responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Billing' } } } } } }
    },
    '/billing/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Billing'], summary: 'Get a billing', operationId: 'getBilling', responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Billing' } } } }, '404': { description: 'Not Found' } } },
      put: { tags: ['Billing'], summary: 'Update a billing', operationId: 'updateBilling', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BillingCreate' } } } }, responses: { '200': { description: 'Updated' }, '404': { description: 'Not Found' } } },
      delete: { tags: ['Billing'], summary: 'Delete a billing', operationId: 'deleteBilling', responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } }
    }
  },
  components: {
    schemas: {
      Restaurant: { type: 'object', properties: { id: { type: 'string', example: 'uuid-1' }, name: { type: 'string', example: 'Cafe Example' }, address: { type: 'string', example: '123 Main St' } }, required: ['id', 'name'] },
      RestaurantCreate: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, address: { type: 'string' } } },
      Food: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, price: { type: 'number' }, description: { type: 'string' }, category: { type: 'string' } }, required: ['id', 'name', 'price'] },
      FoodCreate: { type: 'object', required: ['name', 'price'], properties: { name: { type: 'string' }, price: { type: 'number' }, description: { type: 'string' }, category: { type: 'string' } } },
      Expense: { type: 'object', properties: { id: { type: 'string' }, amount: { type: 'number' }, description: { type: 'string' }, date: { type: 'string', format: 'date' }, category: { type: 'string' } }, required: ['id', 'amount'] },
      ExpenseCreate: { type: 'object', required: ['amount'], properties: { amount: { type: 'number' }, description: { type: 'string' }, date: { type: 'string', format: 'date' }, category: { type: 'string' } } },
      Billing: { type: 'object', properties: { id: { type: 'string' }, amount: { type: 'number' }, restaurantId: { type: 'string' }, date: { type: 'string', format: 'date' }, description: { type: 'string' }, status: { type: 'string', enum: ['pending', 'paid', 'overdue'] }, mobile: { type: 'string', example: '9870859624' }, emailId: { type: 'string', example: 'customer@example.com' }, cgst: { type: 'number', example: 18 }, sgst: { type: 'number', example: 18 }, foodItems: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' }, quantity: { type: 'number' }, time: { type: 'string' } } } } }, required: ['id', 'amount'] },
      BillingCreate: { type: 'object', required: ['amount'], properties: { amount: { type: 'number' }, restaurantId: { type: 'string' }, date: { type: 'string', format: 'date' }, description: { type: 'string' }, status: { type: 'string' }, mobile: { type: 'string' }, emailId: { type: 'string' }, cgst: { type: 'number' }, sgst: { type: 'number' }, foodItems: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' }, quantity: { type: 'number' }, time: { type: 'string' } } } } } }
    }
  }
};

fs.writeFileSync('src/swagger.json', JSON.stringify(spec, null, 2) + '\n');
console.log('swagger.json written');
