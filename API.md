# InventoryTrack API

Base URL

`http://localhost:5000/api`

Auth

- Most endpoints require `Authorization: Bearer <token>`.
- Get a token from `POST /auth/login` or `POST /auth/register`.

## Auth

### Register

`POST /auth/register`

```json
{
  "name": "Avi Patel",
  "email": "avi@example.com",
  "password": "password123",
  "role": "staff"
}
```

### Login

`POST /auth/login`

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

### Current User

`GET /auth/me`

## Products

### List Products

`GET /products`

Optional query params:

- `q` search by name or SKU
- `active=true` only active products
- `active=false` only inactive products

Example:

`GET /products?q=keyboard&active=true`

### Get Product By ID

`GET /products/:id`

### Create Product

Admin only.

`POST /products`

```json
{
  "sku": "SKU-100",
  "name": "Barcode Scanner",
  "description": "USB handheld scanner",
  "unit_cost": 49.99,
  "reorder_level": 10,
  "on_hand": 25,
  "is_active": true
}
```

### Update Product

Admin only.

`PUT /products/:id`

Send only the fields you want to change.

```json
{
  "name": "Barcode Scanner Pro",
  "unit_cost": 59.99,
  "reorder_level": 12
}
```

### Deactivate Product

Admin only.

`DELETE /products/:id`

This is a soft delete and sets `is_active = 0`.

## Movements

### List Movements

`GET /movements`

Optional query params:

- `product_id`
- `type` with values `IN`, `OUT`, `ADJUST`

Example:

`GET /movements?product_id=1&type=OUT`

### Create Movement

`POST /movements`

Rules:

- `IN`: adds quantity to stock
- `OUT`: subtracts quantity from stock
- `ADJUST`: sets stock to the quantity value
- `quantity` must be a non-negative integer

```json
{
  "product_id": 1,
  "type": "IN",
  "quantity": 5,
  "note": "Received from supplier",
  "from_location": "Dock A",
  "to_location": "Shelf 2"
}
```

### Update Movement

Admin only.

`PUT /movements/:id`

Only `note`, `from_location`, and `to_location` are editable.

```json
{
  "note": "Corrected note",
  "from_location": "Dock A",
  "to_location": "Shelf 3"
}
```

### Delete Movement

Admin only.

`DELETE /movements/:id`

Note:

- This deletes the movement record.
- Product stock is not recalculated automatically.

## Reports

### Low Stock

`GET /reports/low-stock`

Returns active products where `on_hand <= reorder_level`.

## Common Status Codes

- `200` Success
- `201` Created
- `400` Bad request
- `401` Missing or invalid token
- `403` Forbidden for current role
- `404` Resource not found
- `409` Duplicate email or SKU
- `500` Server error
