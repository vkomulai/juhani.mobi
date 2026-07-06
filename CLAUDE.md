# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Juhani.mobi is a Finnish-language, voice-driven grocery shopping list PWA. It uses the browser's `webkitSpeechRecognition` API to detect Finnish speech and build shopping lists. Only works on Android Chrome. The app is deployed as a static site to AWS S3 + CloudFront.

## Build & Development Commands

### Frontend (root directory)
- **Dev server:** `npm start` (opens localhost:3000)
- **Build:** `npm run build`
- **Deploy:** `npm run deploy` (builds + pushes to S3 + invalidates CloudFront)
- **Tests (watch):** `npm test`
- **Tests (CI, with coverage):** `npm run test-ci`
- **Run single test:** `npm test -- --testPathPattern=<pattern>`
- **ESLint:** `npm run eslint` / `npm run eslint-fix`
- **CSS lint:** `npm run csslint` / `npm run csslint-fix`

### Backend API (`api/` directory)
Separate project — run `npm install` inside `api/`. TypeScript + Serverless Framework + Express + DynamoDB.
- **Run API locally:** `npm run start:local-api` (port 4000, proxied from frontend dev server)
- **Local DynamoDB:** `sls dynamodb install` then `npm run start:local-dynamodb`
- **Deploy:** `npm run deploy:dev` or `npm run deploy:prod`
- **Tests:** `npm test` (jest + ts-jest)

## Code Style

- No semicolons, single quotes, no trailing commas (enforced by ESLint)
- Stylelint with `stylelint-config-standard`
- Pre-commit hooks run: eslint, csslint, test-ci

## Architecture

### Frontend (React 16 + Redux)
- **State management:** Redux with `redux-thunk` for async actions, persisted to localStorage via `redux-storage-engine-localstorage`
- **Module resolution:** `NODE_PATH=src/` — imports use bare paths relative to `src/` (e.g., `import { App } from 'App'`, `import shoppingApp from 'reducers'`)
- **Routing:** React Router v5 with two routes: `/` (main) and `/l/:id` (shared list)
- **i18n:** `react-i18next` with translations in `src/translations.json` (Finnish)
- **Redux state shape:** `shoppingItems` (array), `listening` (bool), `isSpeechRecognitionSupported` (bool), `onBoardingCompleted` (bool), `isOnline` (bool), `sortAutomatically` (bool)
- **Container/component pattern:** `src/containers/` has Redux-connected components, `src/components/` has presentational components
- **Speech API:** `src/api/SpeechRecognitionAPI.js` wraps `webkitSpeechRecognition` for Finnish language detection
- **Market categories:** `src/api/MarketCategories.js` + `CategoryData.json` handle automatic sorting of items by store aisle order
- **Service worker:** Custom SW appended via `cra-append-sw` during build

### Backend API (`api/`)
- **Framework:** Express app wrapped with `serverless-http` for AWS Lambda
- **Database:** DynamoDB (tables: Recipes, Categories, Lists — stage-suffixed)
- **Auth:** Basic auth via `express-basic-auth`, credentials from AWS SSM
- **Recipe scraping:** `src/scraper.ts` scrapes recipe ingredients from URLs (shared via Web Share Target API)
- **Infrastructure:** Serverless Framework with custom domain (`api.juhani.mobi` / `api-dev.juhani.mobi`)

### Deployment
- Frontend: S3 static website + CloudFront CDN (`deploy-to-s3.sh`)
- Backend: Serverless Framework to AWS Lambda + API Gateway
- CI: Travis CI — runs eslint, csslint, tests, then deploys on master
- AWS infrastructure templates in `aws/` (CloudFormation for Route53, S3, CloudFront)
