#!/bin/bash
set -e
S3_BUCKET=www.juhani.mobi
CLOUDFRONT_DUSTRIBUTION_ID=E2PYOCTIIDESQS
npm run build
cd build/
# TODO:Force flag to invalidation
echo "--- [S3]         Synchronizing website to AWS S3..."
aws s3 sync . s3://$S3_BUCKET
# Force zero caching on index.html
aws s3 cp s3://$S3_BUCKET/index.html s3://$S3_BUCKET/index.html --metadata-directive REPLACE --cache-control max-age=0
echo "--- [S3]         Website published to AWS S3"
echo "--- [Cloudfront] Invalidating Cloudfront $CLOUDFRONT_DUSTRIBUTION_ID cache for changed files.."
INVALIDATION_ID=`aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DUSTRIBUTION_ID --output text --query 'Invalidation.Id' --paths "/*"`
echo "--- [Cloudfront] Waiting for Cloudfront invalidation $INVALIDATION_ID to complete..."
aws cloudfront wait invalidation-completed --distribution-id $CLOUDFRONT_DUSTRIBUTION_ID --id $INVALIDATION_ID
echo "--- [SUCCESS]    Site is published and Cloudfront cache for has been invalidated!"
cd ..