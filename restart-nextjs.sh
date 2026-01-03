#!/bin/bash

echo "🔄 Restarting Next.js with clean cache..."
echo ""

cd somnium-frontend

echo "1. Removing .next cache..."
rm -rf .next

echo "2. Please stop the Next.js dev server (Ctrl+C in the terminal where it's running)"
echo ""
echo "3. After stopping it, run this command to start it again:"
echo "   npm run dev"
echo ""
echo "Then run the test script again: ./test-proxy-v2.sh"
