#!/bin/bash

# Power CRM Development Server Startup Script
# This script sets up the environment and starts both API and client servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SERVER_DIR="packages/server"
CLIENT_DIR="packages/client"
SERVER_PORT=3001
CLIENT_PORT=3000

echo -e "${BLUE}🚀 Power CRM Development Server${NC}"
echo -e "${BLUE}===============================${NC}"

# Function to print status
print_status() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local name=$2
    if check_port $port; then
        print_warning "Port $port is in use, stopping existing $name process..."
        pkill -f ".*:$port" 2>/dev/null || true
        sleep 2
    fi
}

# Function to setup server environment
setup_server_env() {
    print_status "Setting up server environment..."

    local env_file="$SERVER_DIR/.env"

    if [ ! -f "$env_file" ]; then
        print_status "Creating server .env file..."

        # Generate a random JWT secret
        local jwt_secret=$(openssl rand -base64 32 2>/dev/null || echo "development-jwt-secret-please-change-in-production-32-chars")

        cat > "$env_file" << EOF
# Development Environment Configuration
NODE_ENV=development
PORT=3001

# Database Configuration (SQLite for development)
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="$jwt_secret"
JWT_EXPIRES_IN="7d"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SMS Configuration (Optional for development)
SMS_API_URL=""
SMS_API_KEY=""
SMS_SENDER="PowerCRM"

# Logging
LOG_LEVEL="info"
EOF
        print_success "Created server .env file with development settings"
    else
        print_success "Server .env file already exists"
    fi
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."

    cd "$SERVER_DIR"

    # Generate Prisma client
    print_status "Generating Prisma client..."
    npm run db:generate >/dev/null 2>&1

    # Push database schema
    print_status "Pushing database schema..."
    npm run db:push >/dev/null 2>&1

    # Check if we should seed the database
    if [ ! -f "prisma/dev.db" ] || [ ! -s "prisma/dev.db" ]; then
        print_status "Seeding database with sample data..."
        npm run db:seed >/dev/null 2>&1 || print_warning "Database seeding failed (this is optional)"
    fi

    cd - >/dev/null
    print_success "Database setup completed"
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."

    # Check Node.js version
    local node_version=$(node --version | cut -d'.' -f1 | sed 's/v//')
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js 18+ is required. Current version: $(node --version)"
        exit 1
    fi

    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install >/dev/null 2>&1
    fi

    print_success "Dependencies check completed"
}

# Function to start server
start_server() {
    print_status "Starting API server..."

    cd "$SERVER_DIR"

    # Kill any existing process on the port
    kill_port $SERVER_PORT "API server"

    # Start the server in background
    npm run dev > ../server.log 2>&1 &
    SERVER_PID=$!

    cd - >/dev/null

    # Wait for server to start
    local max_attempts=30
    local attempt=1

    print_status "Waiting for API server to start..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$SERVER_PORT/api/health" >/dev/null 2>&1; then
            print_success "API server started successfully on port $SERVER_PORT"
            return 0
        fi

        # Check if process is still running
        if ! kill -0 $SERVER_PID 2>/dev/null; then
            print_error "API server process died. Check the logs:"
            tail -n 20 packages/server.log
            return 1
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_error "API server failed to start within 60 seconds"
    return 1
}

# Function to start client
start_client() {
    print_status "Starting client application..."

    cd "$CLIENT_DIR"

    # Kill any existing process on the port
    kill_port $CLIENT_PORT "client application"

    # Check if client dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_status "Installing client dependencies..."
        npm install >/dev/null 2>&1
    fi

    # Start the client in background
    npm run dev > ../client.log 2>&1 &
    CLIENT_PID=$!

    cd - >/dev/null

    # Wait for client to start
    local max_attempts=30
    local attempt=1

    print_status "Waiting for client application to start..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$CLIENT_PORT" >/dev/null 2>&1; then
            print_success "Client application started successfully on port $CLIENT_PORT"
            return 0
        fi

        # Check if process is still running
        if ! kill -0 $CLIENT_PID 2>/dev/null; then
            print_error "Client process died. Check the logs:"
            tail -n 20 packages/client.log
            return 1
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_error "Client application failed to start within 60 seconds"
    return 1
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up..."

    if [ ! -z "$SERVER_PID" ] && kill -0 $SERVER_PID 2>/dev/null; then
        print_status "Stopping API server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null || true
    fi

    if [ ! -z "$CLIENT_PID" ] && kill -0 $CLIENT_PID 2>/dev/null; then
        print_status "Stopping client application (PID: $CLIENT_PID)..."
        kill $CLIENT_PID 2>/dev/null || true
    fi

    # Additional cleanup for any remaining processes
    kill_port $SERVER_PORT "API server"
    kill_port $CLIENT_PORT "client application"

    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo -e "${CYAN}Power CRM Development Server${NC}"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --server-only    Start only the API server"
    echo "  --client-only    Start only the client application"
    echo "  --help           Show this help message"
    echo
    echo "Default: Start both server and client"
    echo
    echo "The script will:"
    echo "  1. Check dependencies and Node.js version"
    echo "  2. Set up environment configuration"
    echo "  3. Initialize the database"
    echo "  4. Start the development servers"
    echo
    echo "URLs:"
    echo "  API Server: http://localhost:$SERVER_PORT"
    echo "  Client App: http://localhost:$CLIENT_PORT"
    echo
    echo "Logs are saved to:"
    echo "  API: packages/server.log"
    echo "  Client: packages/client.log"
}

# Main execution
main() {
    local start_server=true
    local start_client=true

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --server-only)
                start_client=false
                shift
                ;;
            --client-only)
                start_server=false
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    print_status "Starting Power CRM development environment..."
    echo

    # Set up signal handlers for cleanup
    trap cleanup EXIT INT TERM

    # Check dependencies
    check_dependencies
    echo

    if [ "$start_server" = true ]; then
        # Setup server environment
        setup_server_env
        echo

        # Setup database
        setup_database
        echo

        # Start server
        if ! start_server; then
            print_error "Failed to start API server"
            exit 1
        fi
        echo
    fi

    if [ "$start_client" = true ]; then
        # Start client
        if ! start_client; then
            print_error "Failed to start client application"
            exit 1
        fi
        echo
    fi

    # Show success message
    echo -e "${GREEN}🎉 Development servers are running!${NC}"
    echo
    if [ "$start_server" = true ]; then
        echo -e "${CYAN}📡 API Server:${NC}     http://localhost:$SERVER_PORT"
        echo -e "${CYAN}📖 API Docs:${NC}      http://localhost:$SERVER_PORT/api"
    fi
    if [ "$start_client" = true ]; then
        echo -e "${CYAN}🌐 Client App:${NC}    http://localhost:$CLIENT_PORT"
    fi
    echo
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "  • Press Ctrl+C to stop all servers"
    echo "  • Check logs: tail -f packages/server.log packages/client.log"
    echo "  • API health: curl http://localhost:$SERVER_PORT/api/health"
    echo

    # Keep the script running
    print_status "Servers are running. Press Ctrl+C to stop..."
    wait
}

# Run main function with all arguments
main "$@"
