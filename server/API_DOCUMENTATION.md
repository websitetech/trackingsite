# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### User Management

#### POST /register
Register a new user with email verification.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "stateProvince": "string",
  "postalCode": "string"
}
```

#### POST /login
Login user and get JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

#### POST /verify-email
Verify email with verification code.

**Request Body:**
```json
{
  "email": "string",
  "code": "string"
}
```

### Cart Management

#### POST /cart/add
Add item to cart.

**Request Body:**
```json
{
  "item_id": "string",
  "customer": "string",
  "service_type": "string",
  "service_type_label": "string",
  "recipient_name": "string",
  "recipient_address": "string",
  "contact_number": "string",
  "origin_postal": "string",
  "destination_postal": "string",
  "weight": "number",
  "price": "number"
}
```

#### GET /cart
Get user's cart items.

#### DELETE /cart/:itemId
Remove specific item from cart.

#### DELETE /cart
Clear entire cart.

### Shipment Management

#### POST /ship
Create a new shipment.

**Request Body:**
```json
{
  "customer": "string",
  "service_type": "string",
  "service_type_label": "string",
  "recipient_name": "string",
  "recipient_address": "string",
  "contact_number": "string",
  "origin_postal": "string",
  "destination_postal": "string",
  "weight": "number",
  "price": "number"
}
```

#### POST /ship/bulk
Create multiple shipments from cart.

**Request Body:**
```json
{
  "shipments": [
    {
      "customer": "string",
      "service_type": "string",
      "service_type_label": "string",
      "recipient_name": "string",
      "recipient_address": "string",
      "contact_number": "string",
      "origin_postal": "string",
      "destination_postal": "string",
      "weight": "number",
      "price": "number"
    }
  ]
}
```

#### GET /shipments
Get user's shipments.

### Package Management

#### GET /packages
Get user's packages with shipment details.

#### POST /packages/:packageId/tracking
Add tracking history entry.

**Request Body:**
```json
{
  "status": "string",
  "location": "string",
  "description": "string"
}
```

### Payment Management

#### POST /payments
Create payment transaction.

**Request Body:**
```json
{
  "shipment_id": "number",
  "amount": "number",
  "payment_method": "string",
  "stripe_payment_intent_id": "string",
  "stripe_charge_id": "string",
  "billing_address": "object"
}
```

#### GET /payments
Get user's payment transactions.

#### PATCH /payments/:transactionId/status
Update payment status.

**Request Body:**
```json
{
  "status": "string"
}
```

### Customer Tariffs

#### GET /tariffs
Get all active customer tariffs.

### Shipping Estimates

#### POST /estimate
Create shipping estimate.

**Request Body:**
```json
{
  "origin_zip": "string",
  "destination_zip": "string",
  "weight": "number",
  "service_type": "string"
}
```

#### GET /estimates
Get recent shipping estimates.

### Tracking

#### GET /track/:trackingNumber
Track package by tracking number.

## Database Schema Overview

### Tables

1. **users** - User account information
2. **cart** - Shopping cart items
3. **shipments** - Shipment details
4. **packages** - Package information
5. **package_tracking_history** - Tracking updates
6. **payment_transactions** - Payment records
7. **customer_tariffs** - Customer-specific pricing
8. **shipping_estimates** - Shipping cost estimates

### Key Relationships

- `users` → `cart` (one-to-many)
- `users` → `shipments` (one-to-many)
- `users` → `packages` (one-to-many)
- `users` → `payment_transactions` (one-to-many)
- `packages` → `package_tracking_history` (one-to-many)
- `shipments` → `payment_transactions` (one-to-many)

## Data Flow

1. **User Registration** → Creates user record
2. **Add to Cart** → Stores cart item with user_id
3. **Create Shipment** → Creates shipment record with user_id
4. **Payment Processing** → Creates payment transaction linked to shipment
5. **Tracking Updates** → Adds entries to package_tracking_history

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `500` - Server Error 