#!/bin/bash

# Usage: ./install_pyenv.sh
# Install Pyenv to install Python

curl https://pyenv.run | bash
export PYENV_ROOT="${HOME}/.pyenv"
export PATH="${PYENV_ROOT}/bin:${PATH}"
eval "$(pyenv init --path)"
pyenv install 3.10.0
pyenv global 3.10.0
pyenv exec pip install --user pipenv
