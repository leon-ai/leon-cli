#!/bin/sh

apk update --yes

apk add --no-cache --yes git bash curl build-base libffi-dev openssl-dev bzip2-dev zlib-dev readline-dev sqlite-dev
