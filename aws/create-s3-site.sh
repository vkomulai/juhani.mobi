#!/bin/bash
## Create domain to Route53 + request SSL certificate
CERTIFICATE_ARN=''
DOMAIN=juhani.mobi
REGION=us-east-1

aws cloudformation create-stack --region $REGION  \
  --stack-name ${DOMAIN/./-}-route53-certificate  \
  --template-body file://cfn-route53-certificate.yaml  \
  --parameters ParameterKey=DomainName,ParameterValue=$DOMAIN  \
               ParameterKey=AlternativeName,ParameterValue=www.$DOMAIN
read -p  "Approve the certificate request from your email, after that the cert is issued, press ENTER to continue"

while [ "$CERTIFICATE_ARN" == "" ] ; do
  CERTIFICATE_ARN=`aws acm list-certificates --region $REGION --certificate-statuses ISSUED --output text --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn"`
done

aws cloudformation create-stack --region $REGION \
    --stack-name ${DOMAIN/./-}-s3-cloudfront \
    --template-body file://cfn-s3website-cloudfront.yaml \
    --parameters ParameterKey=DomainName,ParameterValue=$DOMAIN \
                ParameterKey=AcmCertificateArn,ParameterValue=$CERTIFICATE_ARN \
                ParameterKey=FullDomainName,ParameterValue=www.$DOMAIN

