const fs = require('fs');

const spec = {
  openapi: '3.0.0',
  info: { 
    title: 'Restaurant Management API', 
    version: '1.0.0', 
    description: 'API for managing restaurants, menus, expenses, live orders, billing, and customers.' 
  },
  servers: [
    { url: 'http://api.engineeringtadka.com/api/v1', description: 'Production API server' },
    { url: 'http://localhost:3000/api/v1', description: 'Local development server' }
  ],
  tags: [
    { name: 'Users & Auth', description: 'Manage users, login, and registration' },
    { name: 'Restaurants', description: 'Manage restaurants' },
    { name: 'Food', description: 'Menu / food items' },
    { name: 'Expenses', description: 'Track expenses' },
    { name: 'Billing', description: 'Manage billings/invoices' },
    { name: 'Orders', description: 'Live kitchen orders' },
    { name: 'Customers', description: 'Customer profiles and loyalty database' },
    { name: 'Roles', description: 'Custom roles and permissions configurations' },
    { name: 'Debug', description: 'Internal testing and system diagnostics' }
  ],
  paths: {
    '/': { 
      get: { 
        tags: ['Restaurants'], 
        summary: 'API root', 
        operationId: 'getRoot', 
        responses: { 
          '200': { 
            description: 'Service status', 
            content: { 'application/json': { example: { status: 'ok' } } } 
          } 
        } 
      } 
    },
    '/users/login': {
      post: {
        tags: ['Users & Auth'],
        summary: 'User Login',
        description: 'Authenticates a user and returns their details along with a JWT bearer token.',
        operationId: 'loginUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginCredentials' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful. Returns user details and token.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '401': { description: 'Invalid email or password' }
        }
      }
    },
    '/users/register': {
      post: {
        tags: ['Users & Auth'],
        summary: 'User Registration',
        description: 'Registers a new user and returns their details along with a JWT bearer token.',
        operationId: 'registerUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully. Returns user details and token.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '400': { description: 'Bad Request (missing fields, duplicate email)' }
        }
      }
    },
    '/users': {
      get: {
        tags: ['Users & Auth'],
        summary: 'List users',
        operationId: 'listUsers',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'A list of users',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/User' } }
              }
            }
          },
          '401': { description: 'Unauthorized' }
        }
      },
      post: {
        tags: ['Users & Auth'],
        summary: 'Admin Create User',
        operationId: 'adminCreateUser',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '400': { description: 'Bad Request' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/users/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User ID' }],
      get: {
        tags: ['Users & Auth'],
        summary: 'Get user details',
        operationId: 'getUser',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'User not found' }
        }
      },
      put: {
        tags: ['Users & Auth'],
        summary: 'Update user details',
        operationId: 'updateUser',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserCreate' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'User not found' }
        }
      },
      delete: {
        tags: ['Users & Auth'],
        summary: 'Delete user',
        operationId: 'deleteUser',
        security: [{ bearerAuth: [] }],
        responses: {
          '204': { description: 'No Content' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'User not found' }
        }
      }
    },
    '/restaurants': {
      get: { 
        tags: ['Restaurants'], 
        summary: 'List restaurants', 
        operationId: 'listRestaurants', 
        responses: { '200': { description: 'A list of restaurants', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Restaurant' } } } } } } 
      },
      post: { 
        tags: ['Restaurants'], 
        summary: 'Create a restaurant', 
        operationId: 'createRestaurant', 
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RestaurantCreate' } } } }, 
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } } } } } 
      }
    },
    '/restaurants/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Restaurant UUID' }],
      get: { 
        tags: ['Restaurants'], 
        summary: 'Get a restaurant (Requires auth if ID specified)', 
        operationId: 'getRestaurant', 
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } } } }, '404': { description: 'Not Found' } } 
      },
      put: { 
        tags: ['Restaurants'], 
        summary: 'Update a restaurant', 
        operationId: 'updateRestaurant', 
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RestaurantCreate' } } } }, 
        responses: { '200': { description: 'Updated' }, '404': { description: 'Not Found' } } 
      },
      delete: { 
        tags: ['Restaurants'], 
        summary: 'Delete a restaurant', 
        operationId: 'deleteRestaurant', 
        security: [{ bearerAuth: [] }],
        responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } 
      }
    },
    '/food': {
      get: { 
        tags: ['Food'], 
        summary: 'List food items', 
        operationId: 'listFood', 
        responses: { '200': { description: 'A list of food items', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Food' } } } } } } 
      },
      post: { 
        tags: ['Food'], 
        summary: 'Create a food item', 
        operationId: 'createFood', 
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/FoodCreate' } } } }, 
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Food' } } } } } 
      }
    },
    '/food/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { 
        tags: ['Food'], 
        summary: 'Get a food item', 
        operationId: 'getFood', 
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Food' } } } }, '404': { description: 'Not Found' } } 
      },
      put: { 
        tags: ['Food'], 
        summary: 'Update a food item', 
        operationId: 'updateFood', 
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/FoodCreate' } } } }, 
        responses: { '200': { description: 'Updated' }, '404': { description: 'Not Found' } } 
      },
      delete: { 
        tags: ['Food'], 
        summary: 'Delete a food item', 
        operationId: 'deleteFood', 
        security: [{ bearerAuth: [] }],
        responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } 
      }
    },
    '/expenses': {
      get: { 
        tags: ['Expenses'], 
        summary: 'List expenses', 
        operationId: 'listExpenses', 
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'A list of expenses', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Expense' } } } } } } 
      },
      post: { 
        tags: ['Expenses'], 
        summary: 'Create an expense', 
        operationId: 'createExpense', 
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseCreate' } } } }, 
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Expense' } } } } } 
      }
    },
    '/expenses/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { 
        tags: ['Expenses'], 
        summary: 'Get an expense', 
        operationId: 'getExpense', 
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Expense' } } } }, '404': { description: 'Not Found' } } 
      },
      put: { 
        tags: ['Expenses'], 
        summary: 'Update an expense', 
        operationId: 'updateExpense', 
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseCreate' } } } }, 
        responses: { '200': { description: 'Updated' }, '404': { description: 'Not Found' } } 
      },
      delete: { 
        tags: ['Expenses'], 
        summary: 'Delete an expense', 
        operationId: 'deleteExpense', 
        security: [{ bearerAuth: [] }],
        responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } 
      }
    },
    '/billing': {
      get: { 
        tags: ['Billing'], 
        summary: 'List billings', 
        operationId: 'listBilling', 
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'A list of billings', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Billing' } } } } } } 
      },
      post: { 
        tags: ['Billing'], 
        summary: 'Create a billing (Public guest checkout)', 
        operationId: 'createBilling', 
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BillingCreate' } } } }, 
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Billing' } } } } } 
      }
    },
    '/billing/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { 
        tags: ['Billing'], 
        summary: 'Get a billing info', 
        operationId: 'getBilling', 
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Billing' } } } }, '404': { description: 'Not Found' } } 
      },
      put: { 
        tags: ['Billing'], 
        summary: 'Update a billing status/info', 
        operationId: 'updateBilling', 
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BillingCreate' } } } }, 
        responses: { '200': { description: 'Updated' }, '404': { description: 'Not Found' } } 
      },
      delete: { 
        tags: ['Billing'], 
        summary: 'Delete a billing invoice', 
        operationId: 'deleteBilling', 
        security: [{ bearerAuth: [] }],
        responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } 
      }
    },
    '/orders': {
      get: { 
        tags: ['Orders'], 
        summary: 'List live kitchen orders', 
        operationId: 'listOrders', 
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'restaurantId', in: 'query', schema: { type: 'string' } }], 
        responses: { '200': { description: 'A list of orders', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } } } 
      },
      post: { 
        tags: ['Orders'], 
        summary: 'Create a live kitchen order', 
        operationId: 'createOrder', 
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderCreate' } } } }, 
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } } } 
      }
    },
    '/orders/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { 
        tags: ['Orders'], 
        summary: 'Get order tracking info', 
        operationId: 'getOrder', 
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } }, '404': { description: 'Not Found' } } 
      },
      put: { 
        tags: ['Orders'], 
        summary: 'Update order status', 
        operationId: 'updateOrder', 
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderCreate' } } } }, 
        responses: { '200': { description: 'Updated' }, '404': { description: 'Not Found' } } 
      },
      delete: { 
        tags: ['Orders'], 
        summary: 'Delete order', 
        operationId: 'deleteOrder', 
        security: [{ bearerAuth: [] }],
        responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } 
      }
    },
    '/customers': {
      get: { 
        tags: ['Customers'], 
        summary: 'List customer profiles', 
        operationId: 'listCustomers', 
        responses: { '200': { description: 'A list of customers', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Customer' } } } } } } 
      },
      post: { 
        tags: ['Customers'], 
        summary: 'Create a customer profile', 
        operationId: 'createCustomer', 
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerCreate' } } } }, 
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Customer' } } } } } 
      }
    },
    '/customers/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { 
        tags: ['Customers'], 
        summary: 'Get a customer profile', 
        operationId: 'getCustomer', 
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Customer' } } } }, '404': { description: 'Not Found' } } 
      },
      put: { 
        tags: ['Customers'], 
        summary: 'Update a customer profile', 
        operationId: 'updateCustomer', 
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerCreate' } } } }, 
        responses: { '200': { description: 'Updated' }, '404': { description: 'Not Found' } } 
      },
      delete: { 
        tags: ['Customers'], 
        summary: 'Delete a customer profile', 
        operationId: 'deleteCustomer', 
        security: [{ bearerAuth: [] }],
        responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } 
      }
    },
    '/customers/lookup': {
      get: { 
        tags: ['Customers'], 
        summary: 'Lookup customer details by phone or email', 
        operationId: 'lookupCustomer', 
        parameters: [{ name: 'mobile', in: 'query', schema: { type: 'string' } }, { name: 'emailId', in: 'query', schema: { type: 'string' } }], 
        responses: { '200': { description: 'Customer details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Customer' } } } }, '404': { description: 'Not Found' } } 
      }
    },
    '/roles': {
      get: { 
        tags: ['Roles'], 
        summary: 'List all custom roles', 
        operationId: 'listRoles', 
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'A list of roles', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Role' } } } } } } 
      },
      post: { 
        tags: ['Roles'], 
        summary: 'Create a custom role', 
        operationId: 'createRole', 
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RoleCreate' } } } }, 
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Role' } } } } } 
      }
    },
    '/roles/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { 
        tags: ['Roles'], 
        summary: 'Get role details', 
        operationId: 'getRole', 
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Role' } } } }, '404': { description: 'Not Found' } } 
      },
      put: { 
        tags: ['Roles'], 
        summary: 'Update a custom role', 
        operationId: 'updateRole', 
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RoleCreate' } } } }, 
        responses: { '200': { description: 'Updated' }, '404': { description: 'Not Found' } } 
      },
      delete: { 
        tags: ['Roles'], 
        summary: 'Delete a custom role', 
        operationId: 'deleteRole', 
        security: [{ bearerAuth: [] }],
        responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } 
      }
    },
    '/debug/clean-db': {
      post: { 
        tags: ['Debug'], 
        summary: 'Wipe and reset database collections', 
        operationId: 'cleanDatabase', 
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Success message', content: { 'application/json': { example: { message: 'Database cleaned' } } } } } 
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Restaurant: { type: 'object', properties: { id: { type: 'string', example: 'uuid-1' }, name: { type: 'string', example: 'Cafe Example' }, address: { type: 'string', example: '123 Main St' } }, required: ['id', 'name'] },
      RestaurantCreate: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, address: { type: 'string' } } },
      Food: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, price: { type: 'number' }, description: { type: 'string' }, category: { type: 'string' } }, required: ['id', 'name', 'price'] },
      FoodCreate: { type: 'object', required: ['name', 'price'], properties: { name: { type: 'string' }, price: { type: 'number' }, description: { type: 'string' }, category: { type: 'string' } } },
      Expense: { type: 'object', properties: { id: { type: 'string' }, amount: { type: 'number' }, description: { type: 'string' }, date: { type: 'string', format: 'date' }, category: { type: 'string' } }, required: ['id', 'amount'] },
      ExpenseCreate: { type: 'object', required: ['amount'], properties: { amount: { type: 'number' }, description: { type: 'string' }, date: { type: 'string', format: 'date' }, category: { type: 'string' } } },
      Billing: { type: 'object', properties: { id: { type: 'string' }, amount: { type: 'number' }, restaurantId: { type: 'string' }, date: { type: 'string', format: 'date' }, description: { type: 'string' }, status: { type: 'string', enum: ['pending', 'paid', 'overdue'] }, mobile: { type: 'string', example: '9870859624' }, emailId: { type: 'string', example: 'customer@example.com' }, cgst: { type: 'number', example: 1.25 }, sgst: { type: 'number', example: 1.25 }, foodItems: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' }, quantity: { type: 'number' }, time: { type: 'string' } } } }, orderNumber: { type: 'number' }, discount: { type: 'number', default: 0 } }, required: ['id', 'amount'] },
      BillingCreate: { type: 'object', required: ['amount'], properties: { amount: { type: 'number' }, restaurantId: { type: 'string' }, date: { type: 'string', format: 'date' }, description: { type: 'string' }, status: { type: 'string' }, mobile: { type: 'string' }, emailId: { type: 'string' }, cgst: { type: 'number' }, sgst: { type: 'number' }, foodItems: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' }, quantity: { type: 'number' }, time: { type: 'string' } } } }, orderNumber: { type: 'number' }, discount: { type: 'number', default: 0 } } },
      Order: { type: 'object', properties: { id: { type: 'string' }, restaurantId: { type: 'string' }, tableNo: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' }, quantity: { type: 'number' } } } }, status: { type: 'string', enum: ['received', 'preparing', 'ready', 'completed', 'cancelled'] }, totalAmount: { type: 'number' }, date: { type: 'string' }, mobile: { type: 'string' }, emailId: { type: 'string' }, orderNumber: { type: 'number' }, discount: { type: 'number', default: 0 } }, required: ['id', 'restaurantId', 'totalAmount'] },
      OrderCreate: { type: 'object', required: ['restaurantId', 'totalAmount'], properties: { restaurantId: { type: 'string' }, tableNo: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' }, quantity: { type: 'number' } } } }, status: { type: 'string' }, totalAmount: { type: 'number' }, date: { type: 'string' }, mobile: { type: 'string' }, emailId: { type: 'string' }, discount: { type: 'number', default: 0 } } },
      Customer: { type: 'object', properties: { id: { type: 'string' }, mobile: { type: 'string' }, emailId: { type: 'string' }, loyaltyPoints: { type: 'number' }, lastLoyaltyActivity: { type: 'string', format: 'date-time' } }, required: ['id'] },
      CustomerCreate: { type: 'object', properties: { mobile: { type: 'string' }, emailId: { type: 'string' }, loyaltyPoints: { type: 'number' } } },
      Role: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, sidebarAccess: { type: 'array', items: { type: 'string' } }, deleteAccess: { type: 'boolean' } }, required: ['id', 'name'] },
      RoleCreate: { type: 'object', properties: { name: { type: 'string' }, sidebarAccess: { type: 'array', items: { type: 'string' } }, deleteAccess: { type: 'boolean' } }, required: ['name'] },
      LoginCredentials: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email', example: 'admin@example.com' }, password: { type: 'string', example: 'admin123' } } },
      UserCreate: { type: 'object', required: ['firstName', 'lastName', 'email', 'password', 'dob', 'age'], properties: { firstName: { type: 'string', example: 'John' }, lastName: { type: 'string', example: 'Doe' }, email: { type: 'string', format: 'email', example: 'john.doe@example.com' }, password: { type: 'string', example: 'password123' }, dob: { type: 'string', format: 'date', example: '1995-05-15' }, age: { type: 'number', example: 31 }, role: { type: 'string', default: 'Admin', example: 'Admin' } } },
      User: { type: 'object', properties: { id: { type: 'string', example: 'uuid-user-1' }, firstName: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string', format: 'email' }, dob: { type: 'string' }, age: { type: 'number' }, role: { type: 'string' }, rights: { type: 'object', properties: { sidebarAccess: { type: 'array', items: { type: 'string' } }, deleteAccess: { type: 'boolean' } } }, token: { type: 'string', description: 'Signed JWT Token returned upon successful login or registration.' } }, required: ['id', 'firstName', 'lastName', 'email', 'dob', 'age'] }
    }
  }
};

fs.writeFileSync('src/swagger.json', JSON.stringify(spec, null, 2) + '\n');
console.log('swagger.json written');
