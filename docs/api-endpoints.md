# Fast Shop API v1 - Endpoints Documentation

## Overview

This document outlines all REST API endpoints for Fast Shop v1, organized by feature area.

## Authentication & Authorization

### POST /api/auth/register
Register a new user account.
- **Body**: `{ email, password, firstName?, lastName? }`
- **Response**: `{ user, token }`

### POST /api/auth/login
Authenticate user and return JWT token.
- **Body**: `{ email, password }`
- **Response**: `{ user, token }`

### POST /api/auth/refresh
Refresh JWT access token.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ token }`

### POST /api/auth/forgot-password
Initiate password reset process.
- **Body**: `{ email }`
- **Response**: `{ message }`

### POST /api/auth/reset-password
Reset password with token.
- **Body**: `{ token, newPassword }`
- **Response**: `{ message }`

## User Management

### GET /api/users/profile
Get current user profile.
- **Auth**: Required
- **Response**: `{ user }`

### PUT /api/users/profile
Update current user profile.
- **Auth**: Required
- **Body**: `{ firstName?, lastName?, email? }`
- **Response**: `{ user }`

### GET /api/users/addresses
Get user's addresses.
- **Auth**: Required
- **Response**: `{ addresses[] }`

### POST /api/users/addresses
Create new address.
- **Auth**: Required
- **Body**: `{ type, firstName, lastName, street, city, state, postalCode, country, phone?, isDefault? }`
- **Response**: `{ address }`

### PUT /api/users/addresses/:id
Update address.
- **Auth**: Required
- **Response**: `{ address }`

### DELETE /api/users/addresses/:id
Delete address.
- **Auth**: Required
- **Response**: `{ message }`

## Product Management

### GET /api/products
Get products with pagination and filtering.
- **Query**: `page?, limit?, category?, search?, minPrice?, maxPrice?, sort?`
- **Response**: `{ products[], pagination }`

### GET /api/products/:id
Get single product details.
- **Response**: `{ product }`

### POST /api/products
Create new product (Admin only).
- **Auth**: Admin required
- **Body**: `{ name, description?, price, categoryId, sku?, qty?, images[]?, ... }`
- **Response**: `{ product }`

### PUT /api/products/:id
Update product (Admin only).
- **Auth**: Admin required
- **Response**: `{ product }`

### DELETE /api/products/:id
Delete product (Admin only).
- **Auth**: Admin required
- **Response**: `{ message }`

## Category Management

### GET /api/categories
Get all active categories.
- **Response**: `{ categories[] }`

### GET /api/categories/:id
Get category with products.
- **Response**: `{ category, products[] }`

### POST /api/categories
Create category (Admin only).
- **Auth**: Admin required
- **Body**: `{ name, description?, slug?, image? }`
- **Response**: `{ category }`

### PUT /api/categories/:id
Update category (Admin only).
- **Auth**: Admin required
- **Response**: `{ category }`

### DELETE /api/categories/:id
Delete category (Admin only).
- **Auth**: Admin required
- **Response**: `{ message }`

## Shopping Cart

### GET /api/cart
Get current user's cart.
- **Auth**: Required
- **Response**: `{ cart, items[], totals }`

### POST /api/cart/items
Add item to cart.
- **Auth**: Required
- **Body**: `{ productId, quantity }`
- **Response**: `{ cart, items[], totals }`

### PUT /api/cart/items/:id
Update cart item quantity.
- **Auth**: Required
- **Body**: `{ quantity }`
- **Response**: `{ cart, items[], totals }`

### DELETE /api/cart/items/:id
Remove item from cart.
- **Auth**: Required
- **Response**: `{ cart, items[], totals }`

### DELETE /api/cart
Clear entire cart.
- **Auth**: Required
- **Response**: `{ message }`

## Order Management

### GET /api/orders
Get user's orders with pagination.
- **Auth**: Required
- **Query**: `page?, limit?, status?`
- **Response**: `{ orders[], pagination }`

### GET /api/orders/:id
Get order details.
- **Auth**: Required (own orders or admin)
- **Response**: `{ order, items[] }`

### POST /api/orders
Create order from cart.
- **Auth**: Required
- **Body**: `{ shippingAddressId, billingAddressId?, paymentMethodId, notes? }`
- **Response**: `{ order, items[] }`

### PUT /api/orders/:id/status
Update order status (Admin only).
- **Auth**: Admin required
- **Body**: `{ status }`
- **Response**: `{ order }`

### PUT /api/orders/:id/cancel
Cancel order (if pending).
- **Auth**: Required (own order)
- **Response**: `{ order }`

## Payment Methods

### GET /api/payment-methods
Get user's payment methods.
- **Auth**: Required
- **Response**: `{ paymentMethods[] }`

### POST /api/payment-methods
Add payment method.
- **Auth**: Required
- **Body**: `{ type, provider, cardNumber?, expiryMonth?, expiryYear?, ... }`
- **Response**: `{ paymentMethod }`

### PUT /api/payment-methods/:id/default
Set as default payment method.
- **Auth**: Required
- **Response**: `{ paymentMethod }`

### DELETE /api/payment-methods/:id
Delete payment method.
- **Auth**: Required
- **Response**: `{ message }`

## Admin Dashboard

### GET /api/admin/dashboard
Get dashboard analytics.
- **Auth**: Admin required
- **Response**: `{ stats: { totalOrders, totalRevenue, totalUsers, totalProducts } }`

### GET /api/admin/users
Get users with pagination (Admin only).
- **Auth**: Admin required
- **Query**: `page?, limit?, search?`
- **Response**: `{ users[], pagination }`

### PUT /api/admin/users/:id/role
Update user role (Admin only).
- **Auth**: Admin required
- **Body**: `{ role }`
- **Response**: `{ user }`

### GET /api/admin/orders
Get all orders (Admin only).
- **Auth**: Admin required
- **Query**: `page?, limit?, status?, userId?, dateFrom?, dateTo?`
- **Response**: `{ orders[], pagination }`

### GET /api/admin/products/inventory
Get low stock products (Admin only).
- **Auth**: Admin required
- **Response**: `{ products[] }`

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
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { ... }
  }
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
