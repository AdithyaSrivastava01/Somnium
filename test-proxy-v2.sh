#!/bin/bash

echo "Testing Next.js API route proxies..."
echo ""

echo "1. Testing /api/csrf (should return JSON with csrf_token):"
curl -s http://localhost:3000/api/csrf | jq '.'
echo ""

echo "2. Testing /api/backend-proxy/auth/login (should return validation errors, not 404):"
curl -s -X POST http://localhost:3000/api/backend-proxy/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: test" \
  -d '{}' | jq '.'
echo ""

echo "✅ If both endpoints return JSON (not 404), the API routes are working!"
