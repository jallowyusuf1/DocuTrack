#!/bin/bash
set -e

cd document-tracker
npm ci
npm run build

