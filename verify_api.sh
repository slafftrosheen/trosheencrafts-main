#!/bin/bash

BASE_URL="http://localhost:5000"
COOKIE_JAR="/tmp/cookies.txt"

echo "1. Checking Health..."
curl -s -c $COOKIE_JAR -b $COOKIE_JAR "$BASE_URL/api/health" -I | head -n 1

echo "2. Fetching CSRF Token..."
TOKEN_RES=$(curl -s -c $COOKIE_JAR -b $COOKIE_JAR "$BASE_URL/api/csrf-token")
TOKEN=$(echo $TOKEN_RES | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "Failed to get CSRF token"
  exit 1
fi

echo "3. Testing Protected Route WITHOUT Token (Should fail)..."
STATUS=$(curl -s -o /dev/null -w "% {http_code}" -c $COOKIE_JAR -b $COOKIE_JAR -X POST "$BASE_URL/api/newsletter/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}')

if [ "$STATUS" == "403" ]; then
  echo "Success: Blocked with 403"
else
  echo "Failure: Got $STATUS instead of 403"
fi

echo "4. Testing Protected Route WITH Token..."
# Note: This might fail validation (email exists etc) but should not be 403
RESPONSE=$(curl -s -c $COOKIE_JAR -b $COOKIE_JAR -X POST "$BASE_URL/api/newsletter/subscribe" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -d '{"email":"test_external@example.com"}')

echo "Response: $Response"
echo $RESPONSE
