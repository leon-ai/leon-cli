#!/bin/bash

brew update
brew install pyenv

pyenv install 3.10.0 --force
pyenv global 3.10.0
pyenv exec pip install --user --force-reinstall pipenv
