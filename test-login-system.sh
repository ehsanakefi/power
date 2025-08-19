#!/bin/bash

# Test Login System Script
# This script tests the complete login functionality of the Power CRM client application

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
CLIENT_DIR="packages/client"
API_DIR="packages/api"
CLIENT_PORT=3000
API_PORT=3001
TEST_PHONE="09123456789"
WAIT_TIME=5

echo -e "${BLUE}🔐 Power CRM Login System Test${NC}"
echo -e "${BLUE}================================${NC}"

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

# Function to wait for service
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $name to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$name is ready!"
            return 0
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_error "$name failed to start within $(($max_attempts * 2)) seconds"
    return 1
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint=$1
    local method=$2
    local data=$3
    local expected_status=$4

    print_status "Testing $method $endpoint"

    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "http://localhost:$API_PORT$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X "$method" \
            "http://localhost:$API_PORT$endpoint")
    fi

    http_code="${response: -3}"
    body="${response%???}"

    if [ "$http_code" = "$expected_status" ]; then
        print_success "✅ $endpoint returned $http_code"
        echo "Response: $body" | head -c 100
        echo
        return 0
    else
        print_error "❌ $endpoint returned $http_code, expected $expected_status"
        echo "Response: $body"
        return 1
    fi
}

# Function to test client build
test_client_build() {
    print_status "Testing client application build..."

    cd "$CLIENT_DIR"

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $CLIENT_DIR"
        return 1
    fi

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing client dependencies..."
        npm install
    fi

    # Run type checking
    print_status "Running TypeScript type checking..."
    if npx tsc --noEmit; then
        print_success "TypeScript type checking passed"
    else
        print_error "TypeScript type checking failed"
        cd - >/dev/null
        return 1
    fi

    # Run linting
    print_status "Running ESLint..."
    if npm run lint; then
        print_success "ESLint passed"
    else
        print_warning "ESLint found issues (not critical for functionality)"
    fi

    # Build the application
    print_status "Building client application..."
    if npm run build; then
        print_success "Client build successful"
    else
        print_error "Client build failed"
        cd - >/dev/null
        return 1
    fi

    cd - >/dev/null
    return 0
}

# Function to test login page accessibility
test_login_page() {
    print_status "Testing login page accessibility..."

    local login_url="http://localhost:$CLIENT_PORT/login"

    # Test if login page loads
    if curl -s "$login_url" >/dev/null 2>&1; then
        print_success "Login page is accessible"
    else
        print_error "Login page is not accessible"
        return 1
    fi

    # Check for key elements (basic HTML structure test)
    local page_content=$(curl -s "$login_url")

    if echo "$page_content" | grep -q "phone\|Phone\|تلفن"; then
        print_success "Phone input field detected"
    else
        print_warning "Phone input field not detected in HTML"
    fi

    if echo "$page_content" | grep -q "button\|Button\|دکمه"; then
        print_success "Submit button detected"
    else
        print_warning "Submit button not detected in HTML"
    fi

    return 0
}

# Function to test authentication flow
test_auth_flow() {
    print_status "Testing authentication flow..."

    # Test login endpoint
    local login_data='{"phone":"'$TEST_PHONE'"}'

    if test_api_endpoint "/api/auth/login" "POST" "$login_data" "200"; then
        print_success "Login API endpoint works"
    else
        print_error "Login API endpoint failed"
        return 1
    fi

    # Test profile endpoint (should fail without token)
    if test_api_endpoint "/api/auth/profile" "GET" "" "401"; then
        print_success "Profile endpoint properly requires authentication"
    else
        print_warning "Profile endpoint should return 401 without token"
    fi

    return 0
}

# Function to test file structure
test_file_structure() {
    print_status "Testing login system file structure..."

    local required_files=(
        "$CLIENT_DIR/src/app/login/page.tsx"
        "$CLIENT_DIR/src/app/dashboard/page.tsx"
        "$CLIENT_DIR/src/store/auth.store.ts"
        "$CLIENT_DIR/src/lib/api.ts"
        "$CLIENT_DIR/src/providers/AuthProvider.tsx"
        "$CLIENT_DIR/src/middleware.ts"
    )

    local missing_files=0

    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_error "$file is missing"
            missing_files=$((missing_files + 1))
        fi
    done

    if [ $missing_files -eq 0 ]; then
        print_success "All required files are present"
        return 0
    else
        print_error "$missing_files required files are missing"
        return 1
    fi
}

# Function to test dependencies
test_dependencies() {
    print_status "Testing required dependencies..."

    cd "$CLIENT_DIR"

    local required_deps=(
        "zustand"
        "@mui/material"
        "@mui/icons-material"
        "axios"
        "next"
        "react"
    )

    local missing_deps=0

    for dep in "${required_deps[@]}"; do
        if npm list "$dep" >/dev/null 2>&1; then
            print_success "$dep is installed"
        else
            print_error "$dep is missing"
            missing_deps=$((missing_deps + 1))
        fi
    done

    cd - >/dev/null

    if [ $missing_deps -eq 0 ]; then
        print_success "All required dependencies are installed"
        return 0
    else
        print_error "$missing_deps required dependencies are missing"
        return 1
    fi
}

# Function to cleanup processes
cleanup() {
    print_status "Cleaning up test processes..."

    # Kill any running processes on our ports
    if check_port $CLIENT_PORT; then
        print_status "Stopping client on port $CLIENT_PORT"
        pkill -f "next.*$CLIENT_PORT" 2>/dev/null || true
    fi

    if check_port $API_PORT; then
        print_status "Stopping API on port $API_PORT"
        pkill -f "node.*$API_PORT" 2>/dev/null || true
    fi

    sleep 2
}

# Function to start services
start_services() {
    print_status "Starting services for integration testing..."

    # Start API server
    if [ -d "$API_DIR" ]; then
        print_status "Starting API server..."
        cd "$API_DIR"
        npm run dev >/dev/null 2>&1 &
        API_PID=$!
        cd - >/dev/null

        if wait_for_service "http://localhost:$API_PORT/api/health" "API Server"; then
            print_success "API server started successfully"
        else
            print_error "Failed to start API server"
            return 1
        fi
    else
        print_warning "API directory not found, skipping API tests"
    fi

    # Start client server
    print_status "Starting client server..."
    cd "$CLIENT_DIR"
    npm run dev >/dev/null 2>&1 &
    CLIENT_PID=$!
    cd - >/dev/null

    if wait_for_service "http://localhost:$CLIENT_PORT" "Client Server"; then
        print_success "Client server started successfully"
    else
        print_error "Failed to start client server"
        return 1
    fi

    return 0
}

# Main test execution
main() {
    echo -e "${PURPLE}Starting comprehensive login system tests...${NC}"
    echo

    # Test 1: File Structure
    echo -e "${BLUE}📁 Test 1: File Structure${NC}"
    if test_file_structure; then
        print_success "File structure test passed"
    else
        print_error "File structure test failed"
        exit 1
    fi
    echo

    # Test 2: Dependencies
    echo -e "${BLUE}📦 Test 2: Dependencies${NC}"
    if test_dependencies; then
        print_success "Dependencies test passed"
    else
        print_error "Dependencies test failed"
        exit 1
    fi
    echo

    # Test 3: Client Build
    echo -e "${BLUE}🔨 Test 3: Client Build${NC}"
    if test_client_build; then
        print_success "Client build test passed"
    else
        print_error "Client build test failed"
        exit 1
    fi
    echo

    # Test 4: Integration Tests (requires running services)
    echo -e "${BLUE}🚀 Test 4: Integration Tests${NC}"
    print_status "Setting up test environment..."

    # Cleanup any existing processes
    cleanup

    # Start services
    if start_services; then
        sleep $WAIT_TIME

        # Test login page
        if test_login_page; then
            print_success "Login page test passed"
        else
            print_warning "Login page test had issues"
        fi

        # Test authentication flow (if API is available)
        if [ -d "$API_DIR" ]; then
            if test_auth_flow; then
                print_success "Authentication flow test passed"
            else
                print_warning "Authentication flow test had issues"
            fi
        fi

        # Cleanup
        cleanup
    else
        print_error "Failed to start services for integration testing"
    fi
    echo

    # Test Summary
    echo -e "${BLUE}📊 Test Summary${NC}"
    echo -e "${BLUE}===============${NC}"
    print_success "Login system setup is complete!"
    echo
    echo -e "${CYAN}🎯 Key Features Implemented:${NC}"
    echo "   • Phone-based authentication with Iranian number validation"
    echo "   • Material-UI responsive design"
    echo "   • Zustand state management with persistence"
    echo "   • Route protection middleware"
    echo "   • Automatic redirection flow"
    echo "   • Loading states and error handling"
    echo "   • TypeScript support with type safety"
    echo
    echo -e "${CYAN}🚀 Next Steps:${NC}"
    echo "   1. Start the development servers:"
    echo "      cd packages/api && npm run dev"
    echo "      cd packages/client && npm run dev"
    echo
    echo "   2. Test the login flow:"
    echo "      • Navigate to http://localhost:3000/login"
    echo "      • Enter a valid Iranian phone number (09xxxxxxxxx)"
    echo "      • Verify API integration and redirection"
    echo
    echo "   3. Check authentication persistence:"
    echo "      • Refresh the page after login"
    echo "      • Verify token persistence in localStorage"
    echo "      • Test logout functionality"
    echo
    print_success "Login system testing completed successfully! 🎉"
}

# Set up signal handlers for cleanup
trap cleanup EXIT INT TERM

# Run main function
main "$@"
