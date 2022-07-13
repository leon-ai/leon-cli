#!/bin/bash

pyenv install 3.9.10 --force
pyenv global 3.9.10
pyenv exec pip install --user --force-reinstall pipenv
