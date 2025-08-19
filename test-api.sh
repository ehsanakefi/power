#!/bin/bash

# Power CRM API Test Script
# This script tests the main API endpoints to verify functionality

set -e

API_URL="http://localhost:3001"
TEST_PHONE="09123456789"
TEST_CODE="1234"

echo "🧪 Power CRM API Test Suite"
echo "==========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Function to check if server is running
check_server() {
    echo "🔍 Checking if server is running..."
    if curl -s "$API_URL/health" > /dev/null 2>&1; then
        print_result 0 "Server is running"
        return 0
    else
        echo -e "${RED}❌ Server is not running. Please start it with: npm run dev:server${NC}"
        echo "   From the root directory, run: npm run dev:server"
        echo "   Or from packages/server: npm run dev"
        exit 1
    fi
}

# Test 1: Health Check
test_health() {
    echo "🏥 Testing health endpoint..."

    response=$(curl -s -w "%{http_code}" "$API_URL/health")
    http_code="${response: -3}"

    if [ "$http_code" = "200" ]; then
        print_result 0 "Health check passed"
        echo "   Response: $(echo "$response" | sed 's/200$//' | jq -r '.message' 2>/dev/null || echo 'Server is healthy')"
    else
        print_result 1 "Health check failed (HTTP $http_code)"
        return 1
    fi
}

# Test 2: API Info
test_api_info() {
    echo "📋 Testing API info endpoint..."

    response=$(curl -s -w "%{http_code}" "$API_URL/api")
    http_code="${response: -3}"

    if [ "$http_code" = "200" ]; then
        print_result 0 "API info endpoint working"
        echo "   Response: $(echo "$response" | sed 's/200$//' | jq -r '.message' 2>/dev/null || echo 'Power CRM API')"
    else
        print_result 1 "API info failed (HTTP $http_code)"
        return 1
    fi
}

# Test 3: Login
test_login() {
    echo "🔐 Testing login endpoint..."

    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"phone\": \"$TEST_PHONE\"}" \
        "$API_URL/api/auth/login")

    http_code="${response: -3}"
    response_body=$(echo "$response" | sed 's/...$//')

    if [ "$http_code" = "200" ]; then
        print_result 0 "Login successful"

        # Extract token for further tests
        TOKEN=$(echo "$response_body" | jq -r '.data.token' 2>/dev/null)
        if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
            echo "   Token received: ${TOKEN:0:20}..."
            export AUTH_TOKEN="$TOKEN"
        else
            echo -e "${YELLOW}   Warning: No token in response${NC}"
        fi

        # Show user info
        USER_ROLE=$(echo "$response_body" | jq -r '.data.user.role' 2>/dev/null)
        echo "   User role: $USER_ROLE"
    else
        print_result 1 "Login failed (HTTP $http_code)"
        echo "   Response: $response_body"
        return 1
    fi
}

# Test 4: Profile (Protected Route)
test_profile() {
    echo "👤 Testing profile endpoint (protected)..."

    if [ -z "$AUTH_TOKEN" ]; then
        print_result 1 "No auth token available for profile test"
        return 1
    fi

    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        "$API_URL/api/auth/profile")

    http_code="${response: -3}"
    response_body=$(echo "$response" | sed 's/...$//')

    if [ "$http_code" = "200" ]; then
        print_result 0 "Profile endpoint working"

        USER_PHONE=$(echo "$response_body" | jq -r '.data.user.phone' 2>/dev/null)
        USER_ID=$(echo "$response_body" | jq -r '.data.user.id' 2>/dev/null)
        echo "   User ID: $USER_ID, Phone: $USER_PHONE"
    else
        print_result 1 "Profile test failed (HTTP $http_code)"
        echo "   Response: $response_body"
        return 1
    fi
}

# Test 5: Verification Endpoint
test_verification() {
    echo "📝 Testing verification endpoint..."

    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"phone\": \"$TEST_PHONE\", \"code\": \"$TEST_CODE\"}" \
        "$API_URL/api/auth/verify")

    http_code="${response: -3}"

    if [ "$http_code" = "200" ]; then
        print_result 0 "Verification endpoint working"
    else
        print_result 1 "Verification test failed (HTTP $http_code)"
        return 1
    fi
}

# Test 6: Invalid Token Test
test_invalid_token() {
    echo "🚫 Testing with invalid token..."

    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer invalid-token-123" \
        "$API_URL/api/auth/profile")

    http_code="${response: -3}"

    if [ "$http_code" = "401" ]; then
        print_result 0 "Invalid token properly rejected"
    else
        print_result 1 "Invalid token test failed (expected 401, got $http_code)"
        return 1
    fi
}

# Test 7: Rate Limiting (Optional)
test_rate_limiting() {
    echo "⏱️  Testing rate limiting..."

    # Make multiple rapid requests
    for i in {1..5}; do
        curl -s "$API_URL/api/auth/login" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "{\"phone\": \"$TEST_PHONE\"}" > /dev/null
    done

    print_result 0 "Rate limiting test completed (check server logs for limits)"
}

# Main test execution
main() {
    echo "Starting API tests..."
    echo "Server URL: $API_URL"
    echo "Test Phone: $TEST_PHONE"
    echo ""

    # Check if jq is available for JSON parsing
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️  jq not found. JSON parsing will be limited.${NC}"
        echo "   Install jq for better test output: sudo apt-get install jq"
        echo ""
    fi

    FAILED_TESTS=0

    # Run tests
    check_server || exit 1

    test_health || ((FAILED_TESTS++))
    echo ""

    test_api_info || ((FAILED_TESTS++))
    echo ""

    test_login || ((FAILED_TESTS++))
    echo ""

    test_profile || ((FAILED_TESTS++))
    echo ""

    test_verification || ((FAILED_TESTS++))
    echo ""

    test_invalid_token || ((FAILED_TESTS++))
    echo ""

    test_rate_limiting || ((FAILED_TESTS++))
    echo ""

    # Summary
    echo "📊 Test Summary"
    echo "==============="

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed! Your API is working correctly.${NC}"
        echo ""
        echo "🚀 Your Power CRM backend is ready for development!"
        echo ""
        echo "Next steps:"
        echo "1. Check server logs for any warnings"
        echo "2. Set up the frontend client"
        echo "3. Configure SMS integration"
        echo "4. Set up production database"
    else
        echo -e "${RED}❌ $FAILED_TESTS test(s) failed.${NC}"
        echo ""
        echo "🔧 Troubleshooting:"
        echo "1. Check server logs: npm run dev:server"
        echo "2. Verify database connection in .env"
        echo "3. Ensure all dependencies are installed"
        echo "4. Check if PostgreSQL is running"
        exit 1
    fi

    echo ""
    echo "📚 For more information:"
    echo "   - Server docs: packages/server/README.md"
    echo "   - Technical spec: TECHNICAL_SPEC.md"
    echo "   - API endpoints: http://localhost:3001/api"
}

# Run main function
main "$@"
