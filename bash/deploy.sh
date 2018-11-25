#!/usr/bin/env bash
if [[ $# -eq 1 ]]
    then
        npm run git $1 || true
fi
git secret reveal -f
gcloud app deploy