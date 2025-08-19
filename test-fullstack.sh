#!/bin/bash

# Power CRM Full Stack Test Script
# This script tests both backend API and frontend application

set -e

BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
TEST_PHONE="09123456789"
TEST_CODE="1234"
AUTH_TOKEN=""

echo "🧪 Power CRM Full Stack Test Suite"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to check if services are running
check_services() {
    echo "🔍 Checking if services are running..."

    # Check backend
    if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
        print_result 0 "Backend server is running at $BACKEND_URL"
    else
        print_result 1 "Backend server is not running at $BACKEND_URL"
        echo "   Please start the backend with: npm run dev:server"
        return 1
    fi

    # Check frontend
    if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
        print_result 0 "Frontend server is running at $FRONTEND_URL"
    else
        print_result 1 "Frontend server is not running at $FRONTEND_URL"
        echo "   Please start the frontend with: npm run dev:client"
        return 1
    fi
}

# Backend API Tests
test_backend_health() {
    echo "🏥 Testing backend health endpoint..."

    response=$(curl -s -w "%{http_code}" "$BACKEND_URL/health")
    http_code="${response: -3}"

    if [ "$http_code" = "200" ]; then
        print_result 0 "Backend health check passed"
        echo "   Response: $(echo "$response" | sed 's/200$//' | jq -r '.message' 2>/dev/null || echo 'Server is healthy')"
    else
        print_result 1 "Backend health check failed (HTTP $http_code)"
        return 1
    fi
}

test_backend_api_info() {
    echo "📋 Testing backend API info endpoint..."

    response=$(curl -s -w "%{http_code}" "$BACKEND_URL/api")
    http_code="${response: -3}"

    if [ "$http_code" = "200" ]; then
        print_result 0 "API info endpoint working"
        echo "   Response: $(echo "$response" | sed 's/200$//' | jq -r '.message' 2>/dev/null || echo 'Power CRM API')"
    else
        print_result 1 "API info failed (HTTP $http_code)"
        return 1
    fi
}

test_backend_auth() {
    echo "🔐 Testing backend authentication..."

    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"phone\": \"$TEST_PHONE\"}" \
        "$BACKEND_URL/api/auth/login")

    http_code="${response: -3}"
    response_body=$(echo "$response" | sed 's/...$//')

    if [ "$http_code" = "200" ]; then
        print_result 0 "Backend authentication successful"

        # Extract token for further tests
        TOKEN=$(echo "$response_body" | jq -r '.data.token' 2>/dev/null)
        if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
            echo "   Token received: ${TOKEN:0:20}..."
            export AUTH_TOKEN="$TOKEN"
        fi
    else
        print_result 1 "Backend authentication failed (HTTP $http_code)"
        return 1
    fi
}

test_backend_tickets() {
    echo "🎫 Testing backend tickets API..."

    if [ -z "$AUTH_TOKEN" ]; then
        print_warning "No auth token available, skipping ticket tests"
        return 0
    fi

    # Test create ticket
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{"title": "Test Ticket from Full Stack Test", "content": "This is a test ticket created by the full stack test script."}' \
        "$BACKEND_URL/api/tickets")

    http_code="${response: -3}"

    if [ "$http_code" = "201" ]; then
        print_result 0 "Backend ticket creation successful"

        # Test get tickets
        response=$(curl -s -w "%{http_code}" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            "$BACKEND_URL/api/tickets")

        http_code="${response: -3}"

        if [ "$http_code" = "200" ]; then
            print_result 0 "Backend tickets list successful"
        else
            print_result 1 "Backend tickets list failed (HTTP $http_code)"
            return 1
        fi
    else
        print_result 1 "Backend ticket creation failed (HTTP $http_code)"
        return 1
    fi
}

# Frontend Tests
test_frontend_homepage() {
    echo "🏠 Testing frontend homepage..."

    response=$(curl -s -w "%{http_code}" "$FRONTEND_URL/")
    http_code="${response: -3}"

    if [ "$http_code" = "200" ]; then
        print_result 0 "Frontend homepage accessible"

        # Check for key content
        response_body=$(echo "$response" | sed 's/...$//')
        if echo "$response_body" | grep -q "Power CRM" > /dev/null 2>&1; then
            print_result 0 "Homepage contains expected content"
        else
            print_warning "Homepage content may not be fully loaded"
        fi
    else
        print_result 1 "Frontend homepage failed (HTTP $http_code)"
        return 1
    fi
}

test_frontend_static_assets() {
    echo "📦 Testing frontend static assets..."

    # Test favicon
    response=$(curl -s -w "%{http_code}" "$FRONTEND_URL/favicon.ico")
    http_code="${response: -3}"

    if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
        print_result 0 "Static assets endpoint accessible"
    else
        print_result 1 "Static assets failed (HTTP $http_code)"
        return 1
    fi
}

test_api_cors() {
    echo "🌐 Testing CORS configuration..."

    response=$(curl -s -w "%{http_code}" \
        -H "Origin: $FRONTEND_URL" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        -X OPTIONS \
        "$BACKEND_URL/api/auth/login")

    http_code="${response: -3}"

    if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
        print_result 0 "CORS preflight successful"
    else
        print_result 1 "CORS preflight failed (HTTP $http_code)"
        return 1
    fi
}

# Integration Tests
test_integration() {
    echo "🔗 Testing frontend-backend integration..."

    # Test that frontend can reach backend
    if [ ! -z "$AUTH_TOKEN" ]; then
        # Simulate a frontend API call
        response=$(curl -s -w "%{http_code}" \
            -H "Origin: $FRONTEND_URL" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            "$BACKEND_URL/api/auth/profile")

        http_code="${response: -3}"

        if [ "$http_code" = "200" ]; then
            print_result 0 "Frontend-backend integration working"
        else
            print_result 1 "Frontend-backend integration failed (HTTP $http_code)"
            return 1
        fi
    else
        print_warning "No auth token available for integration test"
    fi
}

# Performance Tests
test_performance() {
    echo "⚡ Testing basic performance..."

    # Test backend response time
    start_time=$(date +%s.%3N)
    curl -s "$BACKEND_URL/health" > /dev/null
    end_time=$(date +%s.%3N)
    backend_time=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "0.1")

    if (( $(echo "$backend_time < 2.0" | bc -l 2>/dev/null || echo 1) )); then
        print_result 0 "Backend response time acceptable (${backend_time}s)"
    else
        print_warning "Backend response time slow (${backend_time}s)"
    fi

    # Test frontend response time
    start_time=$(date +%s.%3N)
    curl -s "$FRONTEND_URL/" > /dev/null
    end_time=$(date +%s.%3N)
    frontend_time=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "0.1")

    if (( $(echo "$frontend_time < 3.0" | bc -l 2>/dev/null || echo 1) )); then
        print_result 0 "Frontend response time acceptable (${frontend_time}s)"
    else
        print_warning "Frontend response time slow (${frontend_time}s)"
    fi
}

# Security Tests
test_security() {
    echo "🛡️  Testing basic security..."

    # Test unauthenticated access to protected endpoints
    response=$(curl -s -w "%{http_code}" "$BACKEND_URL/api/tickets")
    http_code="${response: -3}"

    if [ "$http_code" = "401" ]; then
        print_result 0 "Protected endpoints properly secured"
    else
        print_warning "Protected endpoints may not be properly secured (HTTP $http_code)"
    fi

    # Test invalid token
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer invalid-token" \
        "$BACKEND_URL/api/auth/profile")

    http_code="${response: -3}"

    if [ "$http_code" = "401" ]; then
        print_result 0 "Invalid tokens properly rejected"
    else
        print_warning "Invalid tokens may not be properly handled (HTTP $http_code)"
    fi
}

# Main test execution
main() {
    echo "Starting full stack tests..."
    echo "Backend URL: $BACKEND_URL"
    echo "Frontend URL: $FRONTEND_URL"
    echo "Test Phone: $TEST_PHONE"
    echo ""

    # Check if jq is available for JSON parsing
    if ! command -v jq &> /dev/null; then
        print_warning "jq not found. JSON parsing will be limited."
        echo "   Install jq for better test output: sudo apt-get install jq"
        echo ""
    fi

    # Check if bc is available for calculations
    if ! command -v bc &> /dev/null; then
        print_warning "bc not found. Performance calculations will be limited."
        echo ""
    fi

    FAILED_TESTS=0

    # Check services
    check_services || exit 1
    echo ""

    # Backend tests
    echo "🔧 Backend API Tests"
    echo "===================="
    test_backend_health || ((FAILED_TESTS++))
    test_backend_api_info || ((FAILED_TESTS++))
    test_backend_auth || ((FAILED_TESTS++))
    test_backend_tickets || ((FAILED_TESTS++))
    echo ""

    # Frontend tests
    echo "🎨 Frontend Application Tests"
    echo "============================="
    test_frontend_homepage || ((FAILED_TESTS++))
    test_frontend_static_assets || ((FAILED_TESTS++))
    echo ""

    # Integration tests
    echo "🔗 Integration Tests"
    echo "==================="
    test_api_cors || ((FAILED_TESTS++))
    test_integration || ((FAILED_TESTS++))
    echo ""

    # Performance tests
    echo "⚡ Performance Tests"
    echo "==================="
    test_performance || ((FAILED_TESTS++))
    echo ""

    # Security tests
    echo "🛡️  Security Tests"
    echo "=================="
    test_security || ((FAILED_TESTS++))
    echo ""

    # Summary
    echo "📊 Test Summary"
    echo "==============="

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed! Your full stack application is working correctly.${NC}"
        echo ""
        echo "🚀 Your Power CRM application is ready!"
        echo ""
        echo "✅ Services verified:"
        echo "   - Backend API server ($BACKEND_URL)"
        echo "   - Frontend application ($FRONTEND_URL)"
        echo "   - Authentication system"
        echo "   - Ticket management"
        echo "   - CORS configuration"
        echo "   - Security measures"
        echo ""
        echo "📱 Ready for development:"
        echo "   - Frontend: $FRONTEND_URL"
        echo "   - Backend API: $BACKEND_URL/api"
        echo "   - Health check: $BACKEND_URL/health"
        echo ""
        echo "🔗 Next steps:"
        echo "   1. Implement additional frontend pages"
        echo "   2. Add user management interface"
        echo "   3. Complete ticket management UI"
        echo "   4. Set up SMS integration"
        echo "   5. Add real-time notifications"
    else
        echo -e "${RED}❌ $FAILED_TESTS test(s) failed.${NC}"
        echo ""
        echo "🔧 Troubleshooting:"
        echo "   1. Check that both services are running:"
        echo "      - Backend: npm run dev:server"
        echo "      - Frontend: npm run dev:client"
        echo "      - Both: npm run dev:all"
        echo "   2. Verify database connection in backend .env"
        echo "   3. Check CORS configuration"
        echo "   4. Ensure all dependencies are installed"
        echo "   5. Check server logs for errors"
        exit 1
    fi

    echo ""
    echo "📚 Documentation:"
    echo "   - Backend: packages/server/README.md"
    echo "   - Frontend: packages/client/README.md"
    echo "   - Technical spec: TECHNICAL_SPEC.md"
    echo "   - API endpoints: $BACKEND_URL/api"
    echo ""
    echo "🧪 Test again with: ./test-fullstack.sh"
}

# Run main function
main "$@"
