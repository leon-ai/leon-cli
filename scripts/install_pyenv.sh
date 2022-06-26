#!/bin/bash

curl https://pyenv.run | bash
export PYENV_ROOT="${HOME}/.pyenv"
export PATH="${PYENV_ROOT}/bin:${PATH}"
eval "$(pyenv init --path)"

pyenv install 3.9.10 --force
pyenv global 3.9.10
pyenv exec pip install --user --force-reinstall pipenv

SCRIPTS_DIRECTORY=$(dirname "$0")
pyenv_variables_file="${SCRIPTS_DIRECTORY}/pyenv_variables.sh"
pipenv_variables_file="${SCRIPTS_DIRECTORY}/pipenv_variables.sh"

if [ -n "$ZSH_VERSION" ]; then
  cat "${pyenv_variables_file}" >>"${HOME}/.zshrc"
  cat "${pipenv_variables_file}" >>"${HOME}/.zshrc"
fi

if [ -n "$BASH_VERSION" ]; then
  cat "${pyenv_variables_file}" >>"${HOME}/.bashrc"
  cat "${pipenv_variables_file}" >>"${HOME}/.bashrc"
fi
