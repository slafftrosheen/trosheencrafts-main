#!/bin/bash

BASE_URL="http://localhost:5000"
COOKIE_JAR="/tmp/cookies.txt"

echo "1. Fetching CSRF Token with HTTPS simulation..."
TOKEN_RES=$(curl -s -c $COOKIE_JAR -b $COOKIE_JAR "$BASE_URL/api/csrf-token" -H "X-Forwarded-Proto: https")
TOKEN=$(echo $TOKEN_RES | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "Failed to get CSRF token"
  exit 1
fi

echo "2. Testing Protected Route WITH Token..."
# Simulate HTTPS so secure cookie is accepted/processed (though curl might still drop it if it enforces secure flag strictly on http url)
# Actually curl won't save a 'Secure' cookie from an HTTP response unless we tell it to? 
# No, curl respects the flag. 

RESPONSE=$(curl -s -c $COOKIE_JAR -b $COOKIE_JAR -X POST "$BASE_URL/api/newsletter/subscribe" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -H "X-Forwarded-Proto: https" \
  -d '{"email":"test_external_2@example.com"}')

echo $RESPONSE
