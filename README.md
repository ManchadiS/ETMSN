# Restaurant Management System (Node + Express)

Minimal scaffold for a Restaurant Management System API using Node.js and Express.

Quick start

1. Change into project folder

```bash
cd restaurant-management
```

2. Install dependencies

```bash
npm install
```

3. Run in development

```bash
npm run dev
```

API overview

- `GET /restaurants` — list restaurants
- `GET /restaurants/:id` — get restaurant
- `POST /restaurants` — create restaurant
- `PUT /restaurants/:id` — update restaurant
- `DELETE /restaurants/:id` — delete restaurant

Files

- [package.json](package.json)
- [src/index.js](src/index.js)
- [src/routes/restaurants.js](src/routes/restaurants.js)
- [src/models/store.js](src/models/store.js)
