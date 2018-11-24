#!/usr/bin/env bash
git rm -r --cached . || true
git secret hide
git add .
git commit -m $1
git push origin master