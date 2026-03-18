# Seller Frontend API Contract Draft (Backend-Agnostic)

Status: Draft for backend handoff
Scope: Seller portal pages only (dashboard, products, orders, messages, settings)
Owner: Frontend

## 1) Contract Principles

- Keep endpoint naming stable; backend can change internal implementation.
- Keep response envelope consistent across all seller endpoints.
- All list endpoints support pagination and filtering.
- All mutations return the updated resource (or an operation receipt).
- Prefer action-driven order updates (for workflow safety) over raw status writes.

## 2) Base URL and Versioning

- Base URL: `{API_BASE_URL}`
- Version prefix: `/api/v1`
- Seller prefix: `/seller`
- Full prefix pattern: `{API_BASE_URL}/api/v1/seller`

## 3) Auth Requirements

- Required for all seller endpoints: `Authorization: Bearer <access_token>`
- Required role: Seller (store owner)
- Optional headers:
  - `X-Request-Id: <uuid>` for tracing
  - `Accept-Language: en` for future localization

## 4) Common Response Shape

### Success envelope

```json
{
  "success": {
    "code": 200,
    "message": "OK",
    "data": {}
  }
}
```

### Error envelope

```json
{
  "error": {
    "code": 400,
    "type": "VALIDATION_ERROR",
    "message": "Invalid payload",
    "details": {
      "field": "message"
    }
  }
}
```

## 5) Standard Query Parameters

Use on list endpoints where relevant:

- `page` (number, default 1)
- `per_page` (number, default 20)
- `search` (string)
- `sort_by` (string)
- `sort_order` (`asc` | `desc`)
- `status` (string)
- `from` (ISO date)
- `to` (ISO date)

Pagination response block (inside `success.data`):

```json
{
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 6) Dashboard Page Contract

### 6.1 Get dashboard summary cards
- Method: `GET`
- Endpoint: `/seller/dashboard/summary`
- Query params: `from`, `to`
- Request body: none
- Response data:

```json
{
  "store": {
    "id": "store_123",
    "name": "TechHub GH"
  },
  "metrics": {
    "available_balance": 0,
    "pending_balance": 0,
    "total_orders": 0,
    "total_products": 0,
    "total_customers": 0,
    "sales_change_pct": 0,
    "orders_change_pct": 0,
    "products_change_pct": 0,
    "customers_change_pct": 0
  }
}
```

### 6.2 Get top products snapshot
- Method: `GET`
- Endpoint: `/seller/dashboard/top-products`
- Query params: `limit`, `from`, `to`
- Response data:

```json
{
  "items": [
    {
      "id": "prod_1",
      "name": "iPhone 14 Pro Max",
      "sales_count": 45,
      "revenue": 247500,
      "stock": 12
    }
  ]
}
```

### 6.3 Get recent orders snapshot
- Method: `GET`
- Endpoint: `/seller/dashboard/recent-orders`
- Query params: `limit`
- Response data: `{ "items": SellerOrder[] }`

### 6.4 Get recent messages snapshot
- Method: `GET`
- Endpoint: `/seller/dashboard/recent-messages`
- Query params: `limit`
- Response data:

```json
{
  "items": [
    {
      "conversation_id": "conv_1",
      "customer_name": "Kwame Asante",
      "snippet": "Is this still available?",
      "timestamp": "2026-03-17T09:21:00Z",
      "unread": true
    }
  ]
}
```

### 6.5 Withdraw funds
- Method: `POST`
- Endpoint: `/seller/wallet/withdraw`
- Request body:

```json
{
  "amount": 100,
  "account_id": "acct_123"
}
```

- Response data:

```json
{
  "withdrawal_id": "wd_123",
  "status": "pending",
  "requested_amount": 100,
  "requested_at": "2026-03-17T10:00:00Z"
}
```

---

## 7) Products Page Contract

### 7.1 List store products
- Method: `GET`
- Endpoint: `/seller/products`
- Query params: `page`, `per_page`, `search`, `status`, `sort_by`, `sort_order`, `category`
- Response data:

```json
{
  "items": [
    {
      "id": "prod_1",
      "name": "AirPods Pro",
      "description": "...",
      "price": 2150,
      "compare_price": 2400,
      "quantity": 15,
      "status": "active",
      "category": "electronics",
      "tags": ["audio"],
      "images": ["https://..."],
      "thumbnail": "https://...",
      "sold_count": 12,
      "view_count": 200,
      "created_at": "2026-03-01T09:00:00Z"
    }
  ],
  "pagination": {}
}
```

### 7.2 Create product
- Method: `POST`
- Endpoint: `/seller/products`
- Content type: `multipart/form-data`
- Body fields:
  - `name` (string, required)
  - `description` (string, required)
  - `price` (number, required)
  - `compare_price` (number, optional)
  - `quantity` (number, required)
  - `min_order_quantity` (number, optional)
  - `max_order_quantity` (number, optional)
  - `category` (string, required)
  - `tags[]` (string array, optional)
  - `status` (`active` | `draft` | `paused` | `sold_out`, optional)
  - `is_featured` (boolean, optional)
  - `images[]` (files, optional)
- Response data: `{ "product": SellerProduct }`

### 7.3 Get product detail
- Method: `GET`
- Endpoint: `/seller/products/{product_id}`
- Response data: `{ "product": SellerProduct }`

### 7.4 Update product
- Method: `PUT`
- Endpoint: `/seller/products/{product_id}`
- Content type: `multipart/form-data` or `application/json`
- Body: partial of create fields
- Response data: `{ "product": SellerProduct }`

### 7.5 Update product status only
- Method: `PATCH`
- Endpoint: `/seller/products/{product_id}/status`
- Request body:

```json
{
  "status": "paused"
}
```

- Response data: `{ "product": SellerProduct }`

### 7.6 Delete product
- Method: `DELETE`
- Endpoint: `/seller/products/{product_id}`
- Response data:

```json
{
  "deleted": true,
  "product_id": "prod_1"
}
```

---

## 8) Orders Page Contract

### 8.1 List store orders
- Method: `GET`
- Endpoint: `/seller/orders`
- Query params:
  - `page`, `per_page`, `search`, `sort_by`, `sort_order`
  - `status` (`pending` | `processing` | `delivered` | `completed` | `cancelled` | `refunded` | `disputed`)
  - `from`, `to`
- Response data: `{ "items": SellerOrder[], "pagination": {} }`

### 8.2 Get order detail
- Method: `GET`
- Endpoint: `/seller/orders/{order_id}`
- Response data: `{ "order": SellerOrder }`

### 8.3 Perform seller order action (preferred)
- Method: `POST`
- Endpoint: `/seller/orders/{order_id}/actions`
- Request body:

```json
{
  "action": "process"
}
```

- Allowed actions:
  - `process`
  - `deliver`
  - `cancel`
  - `refund`
  - `resolve_dispute`
- Response data:

```json
{
  "order": {},
  "transition": {
    "from": "pending",
    "to": "processing",
    "action": "process",
    "changed_at": "2026-03-17T10:10:00Z"
  }
}
```

### 8.4 Update order status (fallback if action endpoint not used)
- Method: `PATCH`
- Endpoint: `/seller/orders/{order_id}/status`
- Request body:

```json
{
  "status": "processing"
}
```

- Response data: `{ "order": SellerOrder }`

### 8.5 Order receipt data (optional, if backend-generated)
- Method: `GET`
- Endpoint: `/seller/orders/{order_id}/receipt`
- Query params: `format` (`json` | `pdf`)
- Response:
  - If `json`: `{ "receipt": SellerOrderReceipt }`
  - If `pdf`: binary file stream

---

## 9) Messages Page Contract

### 9.1 List conversations
- Method: `GET`
- Endpoint: `/seller/messages/conversations`
- Query params: `page`, `per_page`, `search`, `filter` (`all` | `unread` | `starred` | `with-order` | `no-order`)
- Response data:

```json
{
  "items": [
    {
      "id": "conv_1",
      "customer": {
        "id": "user_1",
        "name": "Kwame Asante",
        "avatar": null
      },
      "product": {
        "id": "prod_1",
        "name": "iPhone 14 Pro Max",
        "image": "https://...",
        "price": 9500
      },
      "last_message": {
        "content": "Is this available?",
        "timestamp": "2026-03-17T09:15:00Z",
        "sender": "customer"
      },
      "unread_count": 2,
      "is_starred": true,
      "has_order": false,
      "order_number": null
    }
  ],
  "pagination": {}
}
```

### 9.2 Get conversation messages
- Method: `GET`
- Endpoint: `/seller/messages/conversations/{conversation_id}/messages`
- Query params: `page`, `per_page`, `before`, `after`
- Response data: `{ "items": SellerMessage[], "pagination": {} }`

### 9.3 Send message
- Method: `POST`
- Endpoint: `/seller/messages/conversations/{conversation_id}/messages`
- Content type: `multipart/form-data` or `application/json`
- Request body:

```json
{
  "content": "Your order is on the way",
  "image": null
}
```

- Response data: `{ "message": SellerMessage }`

### 9.4 Mark conversation as read
- Method: `POST`
- Endpoint: `/seller/messages/conversations/{conversation_id}/read`
- Request body: none
- Response data:

```json
{
  "conversation_id": "conv_1",
  "unread_count": 0
}
```

### 9.5 Toggle star conversation
- Method: `PATCH`
- Endpoint: `/seller/messages/conversations/{conversation_id}/star`
- Request body:

```json
{
  "is_starred": true
}
```

- Response data: `{ "conversation": SellerConversation }`

---

## 10) Settings Page Contract

### 10.1 Get store settings bundle
- Method: `GET`
- Endpoint: `/seller/settings`
- Response data:

```json
{
  "store": {
    "id": "store_1",
    "store_name": "TechHub GH",
    "store_slug": "techhub-gh",
    "institution": "ug",
    "description": "...",
    "logo": "https://...",
    "banner": "https://...",
    "email": "contact@techhub.gh",
    "phone_number": "+233...",
    "location": "Legon",
    "website": "https://...",
    "business_hours": "Mon-Fri: 9AM-6PM"
  },
  "notifications": {
    "new_order": true,
    "new_message": true,
    "low_stock": true,
    "reviews": true
  },
  "auto_responder": {
    "enabled": true,
    "bot_name": "TechBot",
    "message": "Thanks for reaching out"
  }
}
```

### 10.2 Update store profile/branding/contact
- Method: `PUT`
- Endpoint: `/seller/settings`
- Content type: `multipart/form-data` or `application/json`
- Body fields (partial allowed):
  - `store_name`, `store_slug`, `description`, `institution`
  - `email`, `phone_number`, `location`, `website`, `business_hours`
  - `logo` (file/url), `banner` (file/url)
- Response data: settings bundle

### 10.3 Get auto-responder
- Method: `GET`
- Endpoint: `/seller/settings/auto-responder`
- Response data:

```json
{
  "enabled": true,
  "bot_name": "TechBot",
  "message": "..."
}
```

### 10.4 Update auto-responder
- Method: `PUT`
- Endpoint: `/seller/settings/auto-responder`
- Request body:

```json
{
  "enabled": true,
  "bot_name": "TechBot",
  "message": "Thanks for your message"
}
```

- Response data: `{ "auto_responder": AutoResponderConfig }`

### 10.5 Update notification preferences
- Method: `PUT`
- Endpoint: `/seller/settings/notifications`
- Request body:

```json
{
  "new_order": true,
  "new_message": true,
  "low_stock": true,
  "reviews": true
}
```

- Response data: `{ "notifications": SellerNotificationPrefs }`

### 10.6 Deactivate store (danger action)
- Method: `POST`
- Endpoint: `/seller/settings/deactivate`
- Request body:

```json
{
  "reason": "temporary_break"
}
```

- Response data: `{ "deactivated": true, "effective_at": "2026-03-17T10:20:00Z" }`

### 10.7 Delete store (danger action)
- Method: `DELETE`
- Endpoint: `/seller/settings/store`
- Request body (optional, if required by backend policy):

```json
{
  "confirm_text": "DELETE_MY_STORE"
}
```

- Response data: `{ "deleted": true }`

---

## 11) Shared Entity Shapes

### SellerProduct

```json
{
  "id": "prod_1",
  "name": "Product name",
  "description": "...",
  "price": 0,
  "compare_price": null,
  "quantity": 0,
  "status": "active",
  "category": "electronics",
  "tags": [],
  "images": [],
  "thumbnail": null,
  "sold_count": 0,
  "view_count": 0,
  "created_at": "2026-03-17T10:00:00Z"
}
```

### SellerOrder

```json
{
  "id": "ord_1",
  "order_number": "CPZ-ABC123",
  "status": "pending",
  "store_id": "store_1",
  "buyer": {
    "id": "user_1",
    "name": "Customer Name",
    "phone": "+233..."
  },
  "items": [
    {
      "product_id": "prod_1",
      "product_name": "AirPods Pro",
      "quantity": 1,
      "unit_price": 2150,
      "line_total": 2150
    }
  ],
  "totals": {
    "subtotal": 2150,
    "delivery_fee": 0,
    "discount": 0,
    "total": 2150
  },
  "shipping_address": {
    "full_name": "Buyer Name",
    "phone_number": "+233...",
    "institution": "UG",
    "hall": "Akuafo",
    "notes": "..."
  },
  "timeline": [
    {
      "status": "pending",
      "timestamp": "2026-03-17T10:00:00Z",
      "note": "Order placed"
    }
  ],
  "created_at": "2026-03-17T10:00:00Z",
  "updated_at": "2026-03-17T10:05:00Z"
}
```

### SellerMessage

```json
{
  "id": "msg_1",
  "conversation_id": "conv_1",
  "sender": "seller",
  "content": "Thanks for reaching out",
  "image_url": null,
  "is_read": true,
  "timestamp": "2026-03-17T10:12:00Z"
}
```

---

## 12) Error Matrix (Minimum Expected)

All seller endpoints should consistently return:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 NOT_FOUND`
- `409 CONFLICT` (status transition or business rule conflict)
- `422 UNPROCESSABLE_ENTITY`
- `429 RATE_LIMITED` (optional)
- `500 INTERNAL_ERROR`

## 13) Frontend Notes for Backend Team

- Current frontend uses both list-level and detail-level order actions.
- Order workflow is action-based in UI (`process`, `deliver`, `cancel`, `refund`, `resolve_dispute`).
- Product create/update currently supports image upload from UI.
- Settings page expects auto-responder and notification preferences as separate save targets.
- Messages page currently runs on mocks; endpoints in section 9 are required for live integration.

## 14) Open Decisions (Backend + Frontend Alignment)

- Confirm canonical status enum values for orders and products.
- Confirm whether receipt is frontend-generated only or backend-generated (PDF/JSON).
- Confirm if seller endpoints should be nested under `/store/*` or `/seller/*` (frontend can map either via service layer).
- Confirm websocket events for real-time message updates and order status updates.

## 15) Handoff Acceptance Checklist

- Endpoint list approved
- Auth + role policy approved
- Status enums approved
- Pagination and filter keys approved
- Error envelope approved
- Final response field naming approved (snake_case vs camelCase)
- Priority implementation order approved
