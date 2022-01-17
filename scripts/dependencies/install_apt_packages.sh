#!/bin/sh

add-apt-repository --yes main
add-apt-repository --yes universe
add-apt-repository --yes restricted
add-apt-repository --yes multiverse

apt-get update --yes

apt-get install --yes make build-essential git bash libssl-dev zlib1g-dev \
  libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
  libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

apt-get autoremove --yes
