#!/bin/bash
set -e
S3_BUCKET=www.juhani.mobi
CLOUDFRONT_DUSTRIBUTION_ID=E2PYOCTIIDESQS

# Create versionInfo file
DATE=`date +"%d.%m.%Y %T %Z"`
COMMIT=`git rev-parse --short HEAD`
[[ ! -z "$TRAVIS_COMMIT" ]] && COMMIT=$TRAVIS_COMMIT
cp src/versionInfo.json src/versionInfo.json.backup
echo '{"commit":"'$COMMIT'", "buildDate":"'$DATE'"}' > src/versionInfo.json

# Build the thing
npm run build
# Copy the template file back
mv src/versionInfo.json.backup src/versionInfo.json
cd build/
# TODO:Force flag to invalidation
echo "--- [S3]         Synchronizing website to AWS S3..."
aws s3 sync . s3://$S3_BUCKET
# Force zero caching on index.html
aws s3 cp s3://$S3_BUCKET/index.html s3://$S3_BUCKET/index.html --metadata-directive REPLACE --cache-control max-age=0
echo "--- [S3]         Website published to AWS S3"
echo "--- [S3]         Setting content type for index.html to text/html; charset=utf-8"
aws s3 cp index.html  s3://www.juhani.mobi/  --content-type "text/html; charset=utf-8"
echo "--- [Cloudfront] Invalidating Cloudfront $CLOUDFRONT_DUSTRIBUTION_ID cache for changed files.."
INVALIDATION_ID=`aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DUSTRIBUTION_ID --output text --query 'Invalidation.Id' --paths "/*"`
echo "--- [Cloudfront] Waiting for Cloudfront invalidation $INVALIDATION_ID to complete..."
aws cloudfront wait invalidation-completed --distribution-id $CLOUDFRONT_DUSTRIBUTION_ID --id $INVALIDATION_ID
aws s3 cp --content-type text/html s3://$S3_BUCKET/index.html s3://$S3_BUCKET/index.html --recursive
echo "--- [SUCCESS]    Site is published and Cloudfront cache for has been invalidated!"
cd ..