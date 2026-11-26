#!/bin/sh
set -eu

# Render injects HOSTNAME=<pod name>; force Next.js to listen on all interfaces
export HOSTNAME=0.0.0.0
export PORT="${PORT:-10000}"

echo "Starting application..."
echo "HOSTNAME=$HOSTNAME"
echo "PORT=$PORT"

./node_modules/.bin/prisma db push --skip-generate

echo "Starting Next.js server..."

exec node server.js