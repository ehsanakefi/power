# Power CRM Backend Server

Backend API server for the Power Distribution Company CRM system, built with Express.js, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

- **RESTful API** with Express.js and TypeScript
- **Authentication** with JWT and Passport.js
- **Database** integration with PostgreSQL and Prisma ORM
- **SMS-based login** system for Iranian phone numbers
- **Role-based access control** (Client, Employee, Manager, Admin)
- **Request validation** with express-validator and Zod
- **Rate limiting** and security middleware
- **Comprehensive logging** and error handling
- **Database migrations** and seeding

## 📋 Prerequisites

- Node.js (>= 18.0.0)
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/power_crm?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3001
   NODE_ENV="development"
   ```

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

4. **Push database schema:**
   ```bash
   npm run db:push
   ```

5. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

## 🚀 Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### POST `/auth/login`
Login with phone number (creates user if doesn't exist)

**Request:**
```json
{
  "phone": "09123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "phone": "09123456789",
      "role": "CLIENT",
      "createdAt": "2023-10-01T12:00:00Z",
      "updatedAt": "2023-10-01T12:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/auth/verify`
Verify SMS code (placeholder implementation)

**Request:**
```json
{
  "phone": "09123456789",
  "code": "1234"
}
```

#### GET `/auth/profile`
Get current user profile (protected)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "phone": "09123456789",
      "role": "CLIENT",
      "createdAt": "2023-10-01T12:00:00Z",
      "updatedAt": "2023-10-01T12:00:00Z"
    }
  }
}
```

### Health Check

#### GET `/health`
Check server and database health

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2023-10-01T12:00:00Z",
  "environment": "development",
  "version": "1.0.0"
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **CLIENT**: Regular customers who can create and view their own tickets
- **EMPLOYEE**: Staff members who can view and update tickets
- **MANAGER**: Managers who can manage tickets and view reports
- **ADMIN**: Full system access

## 🗄️ Database Schema

### Users
- `id`: Primary key
- `phone`: Unique Iranian phone number
- `role`: User role (CLIENT, EMPLOYEE, MANAGER, ADMIN)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Tickets
- `id`: Primary key
- `title`: Ticket title
- `content`: Ticket content/description
- `status`: Current status (unseen, in_progress, resolved, etc.)
- `authorId`: Foreign key to Users
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Logs
- `id`: Primary key
- `ticketId`: Foreign key to Tickets
- `before`: Previous state (JSON)
- `after`: New state (JSON)
- `changes`: Applied changes (JSON)
- `user`: User who made the change
- `createdAt`: Creation timestamp

## 🧪 Testing

### Test Users (Seeded Data)

After running `npm run db:seed`, you can use these test accounts:

- **Admin**: `09123456789`
- **Manager**: `09123456788`
- **Employee**: `09123456787`
- **Client**: `09123456786`

Use verification code `1234` for development.

### API Testing

Use tools like Postman, Insomnia, or curl to test the API:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "09123456789"}'

# Get profile (replace <token> with actual token)
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Database Configuration

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE power_crm;
CREATE USER power_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE power_crm TO power_user;
```

## 🚨 Security

- **Helmet.js** for security headers
- **CORS** configuration
- **Rate limiting** on all endpoints
- **JWT token validation**
- **Input validation** and sanitization
- **SQL injection protection** via Prisma

## 📝 Logging

The application includes comprehensive logging:

- **Morgan** for HTTP request logging
- **Console logging** for application events
- **Error logging** with stack traces in development
- **Database query logging** in development mode

## 🐛 Error Handling

- Global error handler middleware
- Standardized error responses
- Proper HTTP status codes
- Development vs production error details

## 🔄 Development Workflow

1. **Make changes** to the code
2. **Hot reload** will restart the server automatically
3. **Check logs** in the console for any issues
4. **Test API endpoints** with your preferred tool
5. **Update database schema** if needed:
   ```bash
   npm run db:push
   npm run db:generate
   ```

## 📂 Project Structure

```
src/
├── config/         # Configuration files
│   ├── database.ts    # Prisma client setup
│   ├── env.ts         # Environment validation
│   └── passport.ts    # Passport.js configuration
├── middleware/     # Express middleware
│   ├── auth.ts        # Authentication middleware
│   └── errorHandler.ts # Error handling
├── routes/         # API routes
│   └── auth.ts        # Authentication routes
├── services/       # Business logic
│   └── authService.ts # Authentication service
├── types/          # TypeScript type definitions
│   └── index.ts       # Common types
└── index.ts        # Main application file

prisma/
├── schema.prisma   # Database schema
└── seed.ts         # Database seeding
```

## 🤝 Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Update documentation
5. Test your changes

## 📄 License

MIT License - see LICENSE file for details.