## User Stories (Feature-wise)

Legend: [x] Completed · [ ] Planned

### Authentication & Authorization
1. [x] As a visitor, I can register a new account to start using the shop.
2. [x] As a user, I can log in and receive a JWT to authenticate requests.
3. [x] As a user, I can refresh my JWT to stay signed in without re-entering credentials.
4. [x] As a user, I can request a password reset link/token when I forget my password.
5. [x] As a user, I can reset my password using a valid reset token.
6. [x] As a user, protected endpoints require a valid JWT and reject unauthenticated requests.
  - Acceptance Criteria
    - When requesting any protected endpoint without `Authorization` header, respond `401` with `{ "error": true, "message": "Unauthorized", "data": {} }`.
    - When `Authorization` header is present but not `Bearer <token>`, respond `401` with the same error format.
    - When JWT is invalid or expired, respond `401` with the same error format.
    - When JWT is valid but the user does not exist or is inactive, respond `401` with `{ "error": true, "message": "User not found or inactive", "data": {} }`.
    - When JWT is valid and user is active, the request proceeds and the handler can access user context (id, email, role) for authorization decisions.
7. [x] As an admin, I can access admin-only endpoints guarded by role-based authorization.
  - Acceptance Criteria
    - Access to admin endpoints requires a valid JWT; failures for missing/invalid/expired tokens match the `401` behavior defined above.
    - If the authenticated user’s role is not `ADMIN`, respond `403` with `{ "error": true, "message": "Forbidden", "data": {} }`.
    - If the authenticated user is `ADMIN` and active, the request succeeds (e.g., `200`) and returns the expected resource payload.
    - Role is verified against the database on each request (not only from JWT claims) so that role changes or deactivations take effect immediately.
    - Authorization is enforced consistently across all admin endpoints (users, orders, products, analytics, inventory, etc.).

### User Profile & Addresses
8. [x] As an authenticated user, I can view my profile details.
  - Acceptance Criteria
    - Route: `GET /api/v1/users/profile`.
    - Requires `Authorization: Bearer <jwt>` header. Missing/invalid/expired token responds `401` with `{ "error": true, "message": "Unauthorized", "data": {} }`.
    - If the authenticated user does not exist or is inactive, responds `401` with `{ "error": true, "message": "User not found or inactive", "data": {} }`.
    - On success, responds `200` with JSON: `{ "error": false, "message": "Profile retrieved", "data": { "user": { id, email, firstName, lastName, role, isActive, createdAt, updatedAt } } }`.
    - The response never includes sensitive fields such as password or password hashes.
    - The profile returned is always the authenticated user derived from the verified JWT; query/path params cannot select other users.
    - User details are fetched from the database at request time so recent updates are reflected.
    - Response `Content-Type` is `application/json`.
9. [x] As an authenticated user, I can update my profile details (name, email).
  - Acceptance Criteria
    - Route: `PUT /api/v1/users/profile`.
    - Requires `Authorization: Bearer <jwt>` header; missing/invalid/expired token responds `401` with `{ "error": true, "message": "Unauthorized", "data": {} }`.
    - If the authenticated user does not exist or is inactive, responds `401` with `{ "error": true, "message": "User not found or inactive", "data": {} }`.
    - Request body accepts only: `{ firstName?, lastName?, email? }`. Extra fields are rejected with `400`.
    - At least one updatable field must be provided; otherwise respond `400` with a validation error message.
    - `email`, when provided, must be a valid email format; invalid formats respond `400`.
    - If `email` is provided and already in use by another user, respond `409` with `{ "error": true, "message": "Email already in use", "data": {} }`.
    - On success, responds `200` with JSON: `{ "error": false, "message": "Profile updated", "data": { "user": { id, email, firstName, lastName, role, isActive, createdAt, updatedAt } } }`.
    - The response never includes sensitive fields such as `password` or password hashes.
    - Only the authenticated user's profile is updated. Supplying identifiers in query/path/body to target other users is ignored or rejected (`403` if attempted explicitly).
    - Changes are persisted to the database and `updatedAt` reflects the update time; `createdAt` remains unchanged.
    - Response `Content-Type` is `application/json`.
10. [x] As an authenticated user, I can list my saved addresses.
  - Acceptance Criteria
    - Route: `GET /api/v1/addresses`.
    - Requires `Authorization: Bearer <jwt>` header; missing/invalid/expired token responds `401` with `{ "error": true, "message": "Unauthorized", "data": {} }`.
    - If the authenticated user does not exist or is inactive, responds `401` with `{ "error": true, "message": "User not found or inactive", "data": {} }`.
    - Returns only the addresses belonging to the authenticated user; query/path parameters cannot request other users' addresses.
    - On success, responds `200` with JSON: `{ "error": false, "message": "Addresses retrieved", "data": { "addresses": [ { id, type, firstName, lastName, company?, street, city, state, postalCode, country, phone?, isDefault, createdAt, updatedAt } ] } }`.
    - If the user has no addresses, responds `200` with an empty `addresses` array.
    - Response `Content-Type` is `application/json`.
11. [x] As an authenticated user, I can add a new shipping/billing address.
  - Acceptance Criteria
    - Route: `POST /api/v1/addresses`.
    - Requires `Authorization: Bearer <jwt>` header; missing/invalid/expired token responds `401` with `{ "error": true, "message": "Unauthorized", "data": {} }`.
    - If the authenticated user does not exist or is inactive, responds `401` with `{ "error": true, "message": "User not found or inactive", "data": {} }`.
    - Request body accepts only:
      `{ type, firstName, lastName, company?, street, city, state, postalCode, country, phone?, isDefault? }`.
    - `type` must be one of `SHIPPING` or `BILLING`; required string fields must be non-empty.
    - Extra/unknown fields are rejected with `400` and a validation error message.
    - If `isDefault` is `true`, the new address is set as default and any existing default address for the same `type` for this user is unset.
    - On success, responds `201` with JSON:
      `{ "error": false, "message": "Address created", "data": { "address": { id, type, firstName, lastName, company?, street, city, state, postalCode, country, phone?, isDefault, createdAt, updatedAt } } }`.
    - The address is always created for the authenticated user; attempts to specify a `userId` are ignored or rejected with `403` if explicitly provided.
    - Response `Content-Type` is `application/json`.
12. [x] As an authenticated user, I can update an existing address.
  - Acceptance Criteria
    - Route: `PUT /api/v1/addresses/:id`.
    - Requires `Authorization: Bearer <jwt>` header; missing/invalid/expired token responds `401` with `{ "error": true, "message": "Unauthorized", "data": {} }`.
    - Only the owner can update their address. If the address does not exist for the authenticated user, respond `404` with `{ "error": true, "message": "Address not found", "data": {} }`.
    - Request body accepts only: `{ type?, firstName?, lastName?, company?, street?, city?, state?, postalCode?, country?, phone?, isDefault? }`.
    - At least one updatable field must be provided; otherwise respond `400` with a validation error.
    - `type`, when provided, must be one of `SHIPPING` or `BILLING`; required string fields (if provided) must be non-empty.
    - Extra/unknown fields are rejected with `400` and a validation error message.
    - If `isDefault` is set to `true`, the updated address becomes default and any existing default for the same `type` and user is unset.
    - If `type` is changed and `isDefault` is `true`, ensure default uniqueness for the new `type`.
    - On success, responds `200` with JSON:
      `{ "error": false, "message": "Address updated", "data": { "address": { id, type, firstName, lastName, company?, street, city, state, postalCode, country, phone?, isDefault, createdAt, updatedAt } } }`.
    - Response `Content-Type` is `application/json`.
13. [x] As an authenticated user, I can delete an address.
  - Acceptance Criteria
    - Route: `DELETE /api/v1/addresses/:id`.
    - Requires `Authorization: Bearer <jwt>` header; missing/invalid/expired token responds `401` with `{ "error": true, "message": "Unauthorized", "data": {} }`.
    - Only the owner can delete their address. If the address does not exist for the authenticated user, respond `404` with `{ "error": true, "message": "Address not found", "data": {} }`.
    - Deleting a default address is allowed; after deletion there may be no default for that `type` until another is set explicitly.
    - On success, responds `200` with JSON: `{ "error": false, "message": "Address deleted", "data": {} }`.
    - Response `Content-Type` is `application/json`.
14. [x] As an authenticated user, I can set an address as my default for shipping/billing.
  - Acceptance Criteria
    - Route: `PUT /api/v1/addresses/:id/default`.
    - Requires `Authorization: Bearer <jwt>` header; missing/invalid/expired token responds `401` with `{ "error": true, "message": "Unauthorized", "data": {} }`.
    - Only the owner can set default; if the address does not exist for the authenticated user, respond `404` with `{ "error": true, "message": "Address not found", "data": {} }`.
    - Sets the specified address as default (`isDefault: true`) and unsets any other default address for the same `type` for this user.
    - Operation is idempotent: if the address is already default for its `type`, respond `200` with the same payload.
    - On success, responds `200` with JSON:
      `{ "error": false, "message": "Default address set", "data": { "address": { id, type, firstName, lastName, company?, street, city, state, postalCode, country, phone?, isDefault, createdAt, updatedAt } } }`.
    - Response `Content-Type` is `application/json`.

### Product Catalog & Categories
15. [ ] As a shopper, I can browse products with pagination and filtering.
16. [ ] As a shopper, I can search products by name/description/category.
17. [ ] As a shopper, I can view a product’s details.
18. [ ] As an admin, I can create new products.
19. [ ] As an admin, I can update existing products.
20. [ ] As an admin, I can delete products.
21. [ ] As a shopper, I can browse categories.
22. [ ] As an admin, I can create, update, and delete categories.

### Shopping Cart
23. [ ] As an authenticated user, I can view my cart with items and totals.
24. [ ] As an authenticated user, I can add a product to my cart with a quantity.
25. [ ] As an authenticated user, I can update a cart item’s quantity.
26. [ ] As an authenticated user, I can remove a cart item.
27. [ ] As an authenticated user, I can clear my entire cart.
28. [ ] As an authenticated user, my cart persists across sessions.

### Orders
29. [ ] As an authenticated user, I can create an order from my cart, providing shipping/billing addresses and a payment method.
30. [ ] As an authenticated user, I can view my orders with pagination.
31. [ ] As an authenticated user, I can view the details of a specific order.
32. [ ] As an authenticated user, I can cancel my pending order.
33. [ ] As an admin, I can update an order’s status (e.g., processing, shipped, delivered).

### Payment Methods
34. [ ] As an authenticated user, I can view my saved payment methods.
35. [ ] As an authenticated user, I can add a new payment method (provider metadata stored securely).
36. [ ] As an authenticated user, I can set a default payment method.
37. [ ] As an authenticated user, I can delete a payment method.

### Admin Dashboard
38. [ ] As an admin, I can view basic analytics (total orders, revenue, users, products).
39. [ ] As an admin, I can list users with pagination and search.
40. [ ] As an admin, I can update a user’s role.
41. [ ] As an admin, I can list and filter all orders.
42. [ ] As an admin, I can view products with low stock.

### Security, Validation & Observability
43. [x] As a developer, I have centralized error handling with safe messages.
44. [x] As a developer, I have security headers and CORS enabled for safer defaults.
45. [x] As a developer, I validate environment variables at startup.
46. [x] As a developer, I validate request payloads on implemented routes (auth flows).
47. [ ] As a developer, I enforce a consistent error response envelope across all endpoints.
48. [ ] As a developer, I add input validation to all remaining routes.
49. [ ] As a developer, I apply rate limiting to public and authenticated endpoints.

### Infrastructure & Developer Experience
50. [x] As a developer, I can use Prisma with PostgreSQL and generated client.
51. [x] As a developer, I can run the API locally with fast reload and logging.
52. [ ] As a developer, I can run the API via Docker locally and in CI.
53. [ ] As a developer, I can use Redis for caching where appropriate.
54. [ ] As a developer, I can view API docs (OpenAPI/Swagger) for all endpoints.


