#!/bin/bash

# Power CRM Setup Script
# This script helps you quickly set up the development environment

set -e

echo "🚀 Power CRM Setup Script"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed and running."
    echo "   You can install it with:"
    echo "   - Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "   - macOS: brew install postgresql"
    echo "   - Or use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
fi

# Create database if it doesn't exist
echo "📊 Setting up database..."
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -s -p "Enter PostgreSQL password: " DB_PASSWORD
echo

read -p "Enter database name (default: power_crm): " DB_NAME
DB_NAME=${DB_NAME:-power_crm}

read -p "Enter database host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter database port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

# Try to create database
echo "🔧 Creating database if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database might already exist or check your credentials."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment file
echo "⚙️  Setting up environment variables..."
cd packages/server

if [ ! -f .env ]; then
    cp .env.example .env

    # Update DATABASE_URL in .env
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "please-change-this-jwt-secret-to-something-secure-minimum-32-characters")

    # Update .env file
    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|g" .env
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|g" .env
    rm .env.bak 2>/dev/null || true

    echo "✅ Created .env file with your database configuration"
else
    echo "ℹ️  .env file already exists, skipping..."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push database schema
echo "📊 Setting up database schema..."
npm run db:push

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

# Build the application
echo "🏗️  Building the application..."
npm run build

cd ../..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development server:"
echo "   npm run dev:server"
echo ""
echo "2. Test the API:"
echo "   curl http://localhost:3001/health"
echo ""
echo "3. Test login with sample user:"
echo "   curl -X POST http://localhost:3001/api/auth/login \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"phone\": \"09123456789\"}'"
echo ""
echo "🔐 Test users (use verification code 1234):"
echo "   Admin: 09123456789"
echo "   Manager: 09123456788"
echo "   Employee: 09123456787"
echo "   Client: 09123456786"
echo ""
echo "📚 Documentation:"
echo "   Server: packages/server/README.md"
echo "   Technical Spec: TECHNICAL_SPEC.md"
echo ""
echo "🐛 If you encounter issues:"
echo "   1. Check that PostgreSQL is running"
echo "   2. Verify database credentials in packages/server/.env"
echo "   3. Ensure Node.js version is 18+"
echo ""
echo "Happy coding! 🚀"
