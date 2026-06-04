#!/bin/sh
set -e

mkdir -p public/audio public/video public/images

echo "Applying database migrations…"
npx prisma migrate deploy

echo "Starting Next.js…"
exec npm start
