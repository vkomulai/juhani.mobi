#!/bin/bash
S3_BUCKET=www.juhani.mobi
CLOUDFRONT_DUSTRIBUTION_ID=E1ELZ7PM43LC4Z
npm run build
cd build/
# TODO:Force flag to invalidation
echo "--- [S3]         Synchronizing website to AWS S3..."
aws s3 sync . s3://$S3_BUCKET
echo "--- [S3]         Website published to AWS S3"


echo "--- [Cloudfront] Invalidating Cloudfront $CLOUDFRONT_DUSTRIBUTION_ID cache for changed files.."
#INVALIDATION_ID=`aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DUSTRIBUTION_ID --output text --query 'Invalidation.Id' --paths "/*"`
echo "--- [Cloudfront] Waiting for Cloudfront invalidation $INVALIDATION_ID to complete..."
#aws cloudfront wait invalidation-completed --distribution-id $CLOUDFRONT_DUSTRIBUTION_ID --id $INVALIDATION_ID
echo "--- [SUCCESS]    Site is published and Cloudfront cache for has been invalidated!"
cd ..