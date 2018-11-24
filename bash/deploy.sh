#!/usr/bin/env bash
npm run git $1 || true
git secret reveal
gcloud app deploy