# Fast Shop API v1 - Endpoints Documentation

## Overview

This document outlines all REST API endpoints for Fast Shop v1, organized by feature area.

### GET /api/v1/health
Health check endpoint.
- **Response**: `{ error, message, data: {} }`

## Authentication & Authorization

### POST /api/v1/auth/register
Register a new user account.
- **Body**: `{ email, password, firstName?, lastName? }`
- **Response**: `{ error, message, data: { user, token } }`

### POST /api/v1/auth/login
Authenticate user and return JWT token.
- **Body**: `{ email, password }`
- **Response**: `{ error, message, data: { user, token } }`

### POST /api/v1/auth/refresh
Refresh JWT access token.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ error, message, data: { token } }`

### POST /api/v1/auth/forgot-password
Initiate password reset process.
- **Body**: `{ email }`
- **Response**: `{ error, message, data: {} }`

### POST /api/v1/auth/reset-password
Reset password with token.
- **Body**: `{ token, newPassword }`
- **Response**: `{ error, message, data: {} }`

## User Management

### GET /api/v1/users/profile
Get current user profile.
- **Auth**: Required
- **Response**: `{ error, message, data: { user } }`

### PUT /api/v1/users/profile
Update current user profile.
- **Auth**: Required
- **Body**: `{ firstName?, lastName?, email? }`
- **Response**: `{ error, message, data: { user } }`

## Address Management

### GET /api/v1/addresses
Get user's addresses.
- **Auth**: Required
- **Response**: `{ error, message, data: { addresses[] } }`

### POST /api/v1/addresses
Create new address.
- **Auth**: Required
- **Body**: `{ type, firstName, lastName, company?, street, city, state, postalCode, country, phone?, isDefault? }`
- **Response**: `{ error, message, data: { address } }`

### PUT /api/v1/addresses/:id
Update address.
- **Auth**: Required
- **Body**: `{ type?, firstName?, lastName?, company?, street?, city?, state?, postalCode?, country?, phone?, isDefault? }`
- **Response**: `{ error, message, data: { address } }`

### PUT /api/v1/addresses/:id/default
Set address as default.
- **Auth**: Required
- **Response**: `{ error, message, data: { address } }`

### DELETE /api/v1/addresses/:id
Delete address.
- **Auth**: Required
- **Response**: `{ error, message, data: {} }`

## Product Management

*Note: Product endpoints are planned but not yet implemented.*

### GET /api/v1/products
Get products with pagination and filtering.
- **Query**: `page?, limit?, category?, search?, minPrice?, maxPrice?, sort?`
- **Response**: `{ error, message, data: { products[], pagination } }`

### GET /api/v1/products/:id
Get single product details.
- **Response**: `{ error, message, data: { product } }`

### POST /api/v1/products
Create new product (Admin only).
- **Auth**: Admin required
- **Body**: `{ name, description?, price, categoryId, sku?, qty?, images[]?, ... }`
- **Response**: `{ error, message, data: { product } }`

### PUT /api/v1/products/:id
Update product (Admin only).
- **Auth**: Admin required
- **Response**: `{ error, message, data: { product } }`

### DELETE /api/v1/products/:id
Delete product (Admin only).
- **Auth**: Admin required
- **Response**: `{ error, message, data: {} }`

## Category Management

*Note: Category endpoints are planned but not yet implemented.*

### GET /api/v1/categories
Get all active categories.
- **Response**: `{ error, message, data: { categories[] } }`

### GET /api/v1/categories/:id
Get category with products.
- **Response**: `{ error, message, data: { category, products[] } }`

### POST /api/v1/categories
Create category (Admin only).
- **Auth**: Admin required
- **Body**: `{ name, description?, slug?, image? }`
- **Response**: `{ error, message, data: { category } }`

### PUT /api/v1/categories/:id
Update category (Admin only).
- **Auth**: Admin required
- **Response**: `{ error, message, data: { category } }`

### DELETE /api/v1/categories/:id
Delete category (Admin only).
- **Auth**: Admin required
- **Response**: `{ error, message, data: {} }`

## Shopping Cart

*Note: Shopping cart endpoints are planned but not yet implemented.*

### GET /api/v1/carts
Get current user's cart.
- **Auth**: Required
- **Response**: `{ error, message, data: { cart, items[], totals } }`

### POST /api/v1/carts/items
Add item to cart.
- **Auth**: Required
- **Body**: `{ productId, quantity }`
- **Response**: `{ error, message, data: { cart, items[], totals } }`

### PUT /api/v1/carts/items/:id
Update cart item quantity.
- **Auth**: Required
- **Body**: `{ quantity }`
- **Response**: `{ error, message, data: { cart, items[], totals } }`

### DELETE /api/v1/carts/items/:id
Remove item from cart.
- **Auth**: Required
- **Response**: `{ error, message, data: { cart, items[], totals } }`

### DELETE /api/v1/carts
Clear entire cart.
- **Auth**: Required
- **Response**: `{ error, message, data: {} }`

## Order Management

*Note: Order management endpoints are planned but not yet implemented.*

### GET /api/v1/orders
Get user's orders with pagination.
- **Auth**: Required
- **Query**: `page?, limit?, status?`
- **Response**: `{ error, message, data: { orders[], pagination } }`

### GET /api/v1/orders/:id
Get order details.
- **Auth**: Required (own orders or admin)
- **Response**: `{ error, message, data: { order, items[] } }`

### POST /api/v1/orders
Create order from cart.
- **Auth**: Required
- **Body**: `{ shippingAddressId, billingAddressId?, paymentMethodId, notes? }`
- **Response**: `{ error, message, data: { order, items[] } }`

### PUT /api/v1/orders/:id/status
Update order status (Admin only).
- **Auth**: Admin required
- **Body**: `{ status }`
- **Response**: `{ error, message, data: { order } }`

### PUT /api/v1/orders/:id/cancel
Cancel order (if pending).
- **Auth**: Required (own order)
- **Response**: `{ error, message, data: { order } }`

## Payment Methods

*Note: Payment method endpoints are planned but not yet implemented.*

### GET /api/v1/payments
Get user's payment methods.
- **Auth**: Required
- **Response**: `{ error, message, data: { paymentMethods[] } }`

### POST /api/v1/payments
Add payment method.
- **Auth**: Required
- **Body**: `{ type, provider, cardNumber?, expiryMonth?, expiryYear?, ... }`
- **Response**: `{ error, message, data: { paymentMethod } }`

### PUT /api/v1/payments/:id/default
Set as default payment method.
- **Auth**: Required
- **Response**: `{ error, message, data: { paymentMethod } }`

### DELETE /api/v1/payments/:id
Delete payment method.
- **Auth**: Required
- **Response**: `{ error, message, data: {} }`

## Admin Dashboard

*Note: Admin dashboard endpoints are planned but not yet implemented.*

### GET /api/v1/admin/dashboard
Get dashboard analytics.
- **Auth**: Admin required
- **Response**: `{ error, message, data: { stats: { totalOrders, totalRevenue, totalUsers, totalProducts } } }`

### GET /api/v1/admin/users
Get users with pagination (Admin only).
- **Auth**: Admin required
- **Query**: `page?, limit?, search?`
- **Response**: `{ error, message, data: { users[], pagination } }`

### PUT /api/v1/admin/users/:id/role
Update user role (Admin only).
- **Auth**: Admin required
- **Body**: `{ role }`
- **Response**: `{ error, message, data: { user } }`

### GET /api/v1/admin/orders
Get all orders (Admin only).
- **Auth**: Admin required
- **Query**: `page?, limit?, status?, userId?, dateFrom?, dateTo?`
- **Response**: `{ error, message, data: { orders[], pagination } }`

### GET /api/v1/admin/products/inventory
Get low stock products (Admin only).
- **Auth**: Admin required
- **Response**: `{ error, message, data: { products[] } }`

## Common Patterns

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Pagination
Endpoints supporting pagination use these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response format:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Responses
All endpoints return consistent error format:
```json
{
  "error": true,
  "message": "Error description",
  "data": {}
}
```

### Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Rate Limiting
- Public endpoints: 100 requests/hour per IP
- Authenticated endpoints: 1000 requests/hour per user
- Admin endpoints: 5000 requests/hour per admin

## Content Types
- Request: `application/json`
- Response: `application/json`
