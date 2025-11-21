# Refresh Token Authentication - Implementation Guide

## Overview
LearnIt now uses a dual-token authentication system for enhanced security and better user experience.

## How It Works

### Token Types
1. **Access Token** (Short-lived: 15 minutes)
   - Used for API authentication
   - Stored in localStorage as `accessToken`
   - Included in Authorization header: `Bearer <accessToken>`
   - Expires quickly to limit exposure window

2. **Refresh Token** (Long-lived: 7 days)
   - Used to obtain new access tokens
   - Stored in localStorage as `refreshToken`
   - Only sent to `/api/auth/refresh` endpoint
   - Can be revoked server-side

### Authentication Flow

#### 1. Initial Login/Registration
```
User -> POST /api/auth/login -> Backend
Backend -> Returns { accessToken, refreshToken, user }
Frontend -> Stores both tokens in localStorage
```

#### 2. API Requests
```
Frontend -> GET /api/some-endpoint (Authorization: Bearer <accessToken>)
Backend -> Validates accessToken -> Returns data
```

#### 3. Automatic Token Refresh (on 401 error)
```
Frontend -> GET /api/some-endpoint (expired accessToken)
Backend -> Returns 401 Unauthorized
Axios Interceptor -> Catches 401
Interceptor -> POST /api/auth/refresh { refreshToken }
Backend -> Validates refreshToken -> Returns new accessToken
Frontend -> Stores new accessToken
Interceptor -> Retries original request with new accessToken
Backend -> Returns original data
```

#### 4. Proactive Token Refresh
```
AuthContext -> Every 14 minutes (before 15m expiry)
AuthContext -> POST /api/auth/refresh { refreshToken }
Backend -> Returns new accessToken
Frontend -> Updates accessToken in localStorage
```

#### 5. Logout
```
Frontend -> POST /api/auth/logout { refreshToken }
Backend -> Revokes refreshToken in database
Frontend -> Clears both tokens from localStorage
```

#### 6. Logout from All Devices
```
Frontend -> POST /api/auth/logout-all (Authorization: Bearer <accessToken>)
Backend -> Revokes all user's refreshTokens
Frontend -> Clears local tokens
```

## Backend Implementation

### Database Schema
```sql
CREATE TABLE refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

### Refresh Token Model (`backend/db/models/refreshTokens.js`)
- `createRefreshToken(userId)` - Generate and store 40-byte hex token
- `verifyRefreshToken(token)` - Check validity (exists, not revoked, not expired)
- `revokeRefreshToken(token)` - Revoke single token
- `revokeAllUserTokens(userId)` - Revoke all user's tokens
- `deleteExpiredTokens()` - Cleanup utility
- `getUserActiveTokens(userId)` - List active sessions

### Auth Endpoints

#### POST /api/auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as register

#### POST /api/auth/refresh
**Request:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/logout
**Request:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /api/auth/logout-all
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out from all devices"
}
```

## Frontend Implementation

### AuthContext (`frontend/context/AuthContext.tsx`)

**State:**
- `user` - Current user object
- `token` - Access token (for backward compatibility)
- `loading` - Loading state

**localStorage:**
- `accessToken` - Short-lived access token
- `refreshToken` - Long-lived refresh token

**Functions:**
- `login(email, password)` - Authenticate and store both tokens
- `register(email, password, name)` - Create account and store both tokens
- `logout()` - Revoke refresh token on server and clear local storage
- `refreshToken()` - Manually refresh access token (automatic via interceptor)

**Auto-refresh:**
- Runs every 14 minutes (1 minute before expiry)
- Ensures seamless user experience without interruptions

### API Client (`frontend/lib/api.ts`)

**Axios Interceptor:**
```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const { accessToken } = await refresh(refreshToken);
        localStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest); // Retry original request
      }
    }
    return Promise.reject(error);
  }
);
```

## Environment Configuration

### Backend `.env`
```env
# JWT Secrets (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-chars

# Token Expiry
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Other configs...
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Security Considerations

### Benefits
1. **Limited Exposure Window** - Access tokens expire in 15 minutes
2. **Server-Side Revocation** - Refresh tokens can be revoked (logout from all devices)
3. **Automatic Refresh** - Users stay logged in without interruption
4. **Session Management** - Track active sessions via refresh tokens
5. **Stolen Token Protection** - Short-lived access tokens limit damage

### Best Practices
1. **HTTPS Only** - Always use HTTPS in production
2. **HttpOnly Cookies** - Consider moving refresh tokens to HttpOnly cookies (future)
3. **Token Rotation** - Rotate refresh tokens on each use (future enhancement)
4. **Rate Limiting** - Already implemented (5 attempts per 15 minutes)
5. **Secure Storage** - Never expose tokens in URLs or logs
6. **Regular Cleanup** - Run `deleteExpiredTokens()` periodically (cron job)

## Testing

### Manual Testing Flow
1. **Register/Login** - Verify both tokens are returned and stored
2. **API Request** - Verify accessToken works
3. **Wait 15+ minutes** - Let accessToken expire
4. **Make API Request** - Verify automatic refresh happens
5. **Check localStorage** - Verify new accessToken is stored
6. **Logout** - Verify tokens are cleared and server revokes refreshToken
7. **Try API Request** - Verify 401 and redirect to login

### Testing Endpoints
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Refresh token
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'

# Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'

# Logout from all devices
curl -X POST http://localhost:3001/api/auth/logout-all \
  -H "Authorization: Bearer your-access-token"
```

## Troubleshooting

### Issue: "Invalid or expired refresh token"
**Solution:** Refresh token has expired or been revoked. User must log in again.

### Issue: Infinite redirect to /login
**Solution:** Check if refresh token exists in localStorage. Clear localStorage and try again.

### Issue: Access token not refreshing automatically
**Solution:** Check axios interceptor is properly configured. Verify refreshToken exists in localStorage.

### Issue: "jwt malformed" error
**Solution:** Check JWT_SECRET and JWT_REFRESH_SECRET are at least 32 characters in .env file.

## Future Enhancements
1. **Refresh Token Rotation** - Issue new refresh token on each refresh
2. **HttpOnly Cookies** - Move refresh tokens to HttpOnly cookies for better security
3. **Device Tracking** - Store device info with refresh tokens
4. **IP Validation** - Validate IP address doesn't change drastically
5. **Suspicious Activity Detection** - Monitor unusual login patterns
6. **Email Notifications** - Notify users of new logins
7. **Session Management UI** - Let users view and revoke active sessions

## Migration from Single Token

If you had previous code using single token:

**Before:**
```typescript
const response = await authApi.login(email, password);
localStorage.setItem('token', response.token);
```

**After:**
```typescript
const response = await authApi.login(email, password);
// Automatically handled by AuthContext
// Both tokens stored: accessToken and refreshToken
```

The migration is transparent - old code using AuthContext will work automatically!
