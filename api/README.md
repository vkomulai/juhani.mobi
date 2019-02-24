# juhani.mobi serverless API

## Prerequisites

1. AWS account and configured access keys
2. [Serverless framework](https://www.npmjs.com/package/serverless) installed

## Running locally

```sh
npm install -g serverless
npm install

# install and start local dynamodb in port 8000 and gui in 8001
sls dynamodb install
npm run start:local-dynamodb
npm run start:local-dynamodb-gui

# start local functions
npm run start:local-api

# test service
curl -i -d "url=https://www.kotikokki.net/reseptit/nayta/574/Maailman%20paras%20pannukakku/" -X POST http://localhost:4000/recipe
```

## Setting up custom domain and initial deployment

1. Create the SSL certificate using ACM
2. Map custom domain configured in `serverless.yml` as follows

```sh
# api-dev.juhani.mobi
sls create_domain --stage dev
sls deploy --stage dev
```

```sh
# api.juhani.mobi
sls create_domain --stage prod
sls deploy --stage prod
```

## Local DynamoDB CRUD tool

```sh
npm install dynamodb-admin -g
env DYNAMO_ENDPOINT=http://localhost:8000 dynamodb-admin
```
