#!/bin/bash

python -m pip install --user --force-reinstall pipenv

SCRIPTS_DIRECTORY=$(dirname "$0")
pipenv_variables_file="${SCRIPTS_DIRECTORY}/pipenv_variables.sh"

if [ -n "$ZSH_VERSION" ]; then
  cat "${pipenv_variables_file}" >>"${HOME}/.zshrc"
  source "${HOME}/.zshrc"
fi

if [ -n "$BASH_VERSION" ]; then
  cat "${pipenv_variables_file}" >>"${HOME}/.bashrc"
  source "${HOME}/.bashrc"
fi
