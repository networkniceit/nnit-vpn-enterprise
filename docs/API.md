# API Documentation

## Base URLs

- **Development**: `http://localhost:3002`
- **Production**: `https://api.nnitvpn.com`

## Authentication

All API requests (except registration and login) require authentication using JWT tokens.

Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Auth API

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "emailVerified": false
  }
}
```

### Login

**POST** `/api/auth/login`

Authenticate a user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "emailVerified": true
  }
}
```

### Refresh Token

**POST** `/api/auth/refresh`

Obtain a new access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "accessToken": "new-access-token"
}
```

### Forgot Password

**POST** `/api/auth/forgot-password`

Request a password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

## MFA API

### Setup TOTP

**POST** `/api/mfa/totp/setup`

Setup Time-based One-Time Password (Google Authenticator).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "userId": "user-id",
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "TOTP setup initiated",
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": [
    "A1B2-C3D4",
    "E5F6-G7H8",
    ...
  ]
}
```

### Verify TOTP

**POST** `/api/mfa/totp/verify`

Verify a TOTP token.

**Request Body:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "token": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "TOTP verified successfully"
}
```

### Send SMS Code

**POST** `/api/mfa/sms/send`

Send SMS verification code.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "SMS code sent"
}
```

## Users API

### Get All Users

**GET** `/api/users`

Retrieve list of all users (Admin only).

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "subscriptionTier": "premium",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "perPage": 20
}
```

### Get User by ID

**GET** `/api/users/:id`

Retrieve a specific user.

**Response:** `200 OK`
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "subscriptionTier": "premium",
  "mfaEnabled": true,
  "status": "active",
  "lastLoginAt": "2024-01-15T10:30:00Z"
}
```

## Servers API

### Get All Servers

**GET** `/api/servers`

Retrieve list of all VPN servers.

**Response:** `200 OK`
```json
{
  "servers": [
    {
      "id": "server-id",
      "name": "US - New York",
      "location": "New York, USA",
      "country": "US",
      "city": "New York",
      "ipAddress": "203.0.113.1",
      "protocol": "wireguard",
      "port": 51820,
      "capacity": 1000,
      "currentLoad": 450,
      "status": "online"
    }
  ]
}
```

### Get Server by ID

**GET** `/api/servers/:id`

Retrieve specific server details.

**Response:** `200 OK`
```json
{
  "id": "server-id",
  "name": "US - New York",
  "location": "New York, USA",
  "country": "US",
  "city": "New York",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "ipAddress": "203.0.113.1",
  "protocol": "wireguard",
  "port": 51820,
  "capacity": 1000,
  "currentLoad": 450,
  "status": "online",
  "wireguardPublicKey": "public-key-here"
}
```

## Connections API

### Get User Connections

**GET** `/api/connections`

Retrieve user's connection history.

**Response:** `200 OK`
```json
{
  "connections": [
    {
      "id": "connection-id",
      "serverId": "server-id",
      "serverName": "US - New York",
      "protocol": "wireguard",
      "connectedAt": "2024-01-15T10:00:00Z",
      "disconnectedAt": "2024-01-15T12:00:00Z",
      "duration": 7200,
      "bytesReceived": 1073741824,
      "bytesSent": 536870912,
      "status": "disconnected"
    }
  ]
}
```

### Create Connection

**POST** `/api/connections`

Initiate a new VPN connection.

**Request Body:**
```json
{
  "serverId": "server-id",
  "protocol": "wireguard"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "connection": {
    "id": "connection-id",
    "serverId": "server-id",
    "protocol": "wireguard",
    "connectedAt": "2024-01-15T10:00:00Z",
    "status": "active"
  },
  "configuration": "wireguard-config-here"
}
```

## Subscriptions API

### Get User Subscription

**GET** `/api/subscriptions`

Retrieve user's subscription details.

**Response:** `200 OK`
```json
{
  "id": "subscription-id",
  "plan": "premium",
  "status": "active",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "autoRenew": true,
  "price": 9.99,
  "currency": "USD"
}
```

### Create Subscription

**POST** `/api/subscriptions`

Create a new subscription.

**Request Body:**
```json
{
  "plan": "premium",
  "paymentMethodId": "stripe-payment-method-id"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "subscription": {
    "id": "subscription-id",
    "plan": "premium",
    "status": "active",
    "startDate": "2024-01-15T00:00:00Z"
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

API requests are rate-limited:
- **Default**: 100 requests per 15 minutes per IP
- **Authenticated**: 1000 requests per 15 minutes per user

Rate limit headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `perPage` - Items per page (default: 20, max: 100)

**Response includes pagination metadata:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Interactive API Documentation

Access the interactive Swagger UI documentation:

http://localhost:3002/api-docs
