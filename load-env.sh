#!/bin/bash
# Helper script to load environment variables from .env.local
# Usage: source load-env.sh

if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local..."
  set -a
  source .env.local
  set +a
  echo "✅ Environment variables loaded:"
  echo "   LD_SDK_KEY: ${LD_SDK_KEY:0:20}... (${#LD_SDK_KEY} chars)"
  echo "   LD_CLIENT_ID: ${LD_CLIENT_ID:0:20}... (${#LD_CLIENT_ID} chars)"
  echo "   LD_PROJECT_KEY: ${LD_PROJECT_KEY}"
else
  echo "❌ Error: .env.local file not found!"
  echo "   Please create it from env.example:"
  echo "   cp env.example .env.local"
fi

