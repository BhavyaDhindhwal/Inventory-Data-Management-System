# Inventory and Data Management System

**Web Dev III – Assignment 3 | Unit 3 | CO3**

A RESTful backend that manages a store or warehouse product catalogue. The implementation follows the assignment stack restriction: Node.js, Express.js, MongoDB, Mongoose and dotenv only.

## Assignment requirements covered

- Product schema and field-level validation using Mongoose
- Express application connected to MongoDB using Mongoose
- Create, read, update and delete product operations
- Query-string filtering, sorting and pagination
- MongoDB aggregation for category-wise inventory reports
- Safe stock increments/decrements for restock and sale
- Low-stock alert report
- Centralized error handling and asynchronous route error middleware
- Environment variables managed using dotenv

## Setup

1. Install Node.js 18+ and make sure MongoDB local service or MongoDB Atlas is available.
2. Open this project folder in VS Code or a terminal.
3. Install packages:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env` and configure your database:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/inventory_management
   NODE_ENV=development
   ```

   For MongoDB Atlas, use your own cluster connection string. Never share or commit `.env`.

5. Start the server:

   ```bash
   npm run dev
   ```

   Or use `npm start`.

Server URL: `http://localhost:5000`

## Product schema

| Field | Type | Validation |
|---|---|---|
| name | String | Required, 2–100 characters |
| sku | String | Required, unique, uppercase, 3–30 characters |
| category | String | Required, maximum 60 characters |
| price | Number | Required, minimum 0 |
| quantity | Number | Required, non-negative integer |
| reorderLevel | Number | Required, non-negative integer |
| supplier | String | Optional, defaults to Not specified |

The schema also includes automatic `createdAt` and `updatedAt` timestamps and a virtual `stockValue` (`price × quantity`).

## API endpoints

Base URL: `http://localhost:5000/api/products`

| Method | Endpoint | Function |
|---|---|---|
| POST | `/` | Create product |
| GET | `/` | Get all products with filters, sort and pagination |
| GET | `/:id` | Get one product by MongoDB ID |
| PUT | `/:id` | Update product fields |
| DELETE | `/:id` | Delete product |
| PATCH | `/:id/stock` | Restock or record a sale |
| GET | `/low-stock` | Low-stock alert report |
| GET | `/summary` | Category-wise aggregation report |

### 1. Create product

`POST /api/products`

JSON body:

```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 48,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```

Returns HTTP `201 Created` and the saved product.

### 2. Get all products – filtering, sorting and pagination

`GET /api/products`

Examples:

```text
/api/products
/api/products?category=Stationery
/api/products?search=pen
/api/products?minPrice=50&maxPrice=500
/api/products?sort=price
/api/products?sort=-quantity
/api/products?page=2&limit=5
/api/products?category=Stationery&search=gel&sort=-price&page=1&limit=10
```

Supported sort fields: `name`, `price`, `quantity`, `category`, `createdAt`, `updatedAt`. Prefix a field with `-` for descending order.

Response includes `total`, `page`, `limit`, `totalPages`, `count` and `products`.

### 3. Get a single product

`GET /api/products/PRODUCT_ID`

Replace `PRODUCT_ID` with the `_id` returned when you create a product.

### 4. Update product

`PUT /api/products/PRODUCT_ID`

Example JSON body:

```json
{
  "price": 140,
  "quantity": 60
}
```

Mongoose validators run during updates.

### 5. Delete product

`DELETE /api/products/PRODUCT_ID`

Returns a deletion confirmation and the deleted ID.

### 6. Stock adjustment

`PATCH /api/products/PRODUCT_ID/stock`

Restock 10 units:

```json
{ "change": 10 }
```

Record a sale of 3 units:

```json
{ "change": -3 }
```

Only non-zero integers are accepted. The update is atomic and prevents stock from becoming negative.

### 7. Low-stock alert report

`GET /api/products/low-stock`

Returns products where `quantity` is less than or equal to `reorderLevel`, sorted by lowest quantity first.

### 8. Category-wise inventory summary

`GET /api/products/summary`

Aggregation pipeline calculates:
- Number of products in each category
- Total quantity in each category
- Total stock value (`price × quantity`)
- Average product price

## Testing with Postman or Thunder Client

The assignment PDF demonstrates API testing through Postman. Follow this order:

1. Start MongoDB and run the server.
2. Send the Create Product POST request.
3. Copy the returned product `_id`.
4. Test Get All Products and query parameters.
5. Test Get Single Product.
6. Test Update Product.
7. Test positive stock change (restock) and negative stock change (sale).
8. Try a sale larger than available stock; the API should reject it.
9. Test Delete Product.
10. Test Low-Stock Report and Category Summary.

## Project structure

```text
inventory-data-management-system/
├── config/
│   └── db.js
├── controllers/
│   └── productController.js
├── middleware/
│   ├── asyncHandler.js
│   └── errorMiddleware.js
├── models/
│   └── Product.js
├── routes/
│   └── productRoutes.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Important assignment note

The PDF explicitly prohibits a pre-built admin panel, CMS or inventory-management boilerplate and restricts the stack to Node.js, Express, Mongoose and dotenv. Therefore, this submission is an API backend, not a separate React frontend. Use Postman/Thunder Client to demonstrate the expected API outputs shown in the assignment screenshots.
