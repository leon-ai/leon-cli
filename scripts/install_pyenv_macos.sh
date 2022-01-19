#!/bin/bash

brew update
brew install pyenv
export PYENV_ROOT="${HOME}/.pyenv"
export PATH="${PYENV_ROOT}/bin:${PATH}"
eval "$(pyenv init --path)"

pyenv install 3.10.0 --force
pyenv global 3.10.0
pyenv exec pip install --user --force-reinstall pipenv

if [ -n "$ZSH_VERSION" ]; then
  echo 'eval "$(pyenv init --path)"' >>"${HOME}/.zprofile"

  echo 'eval "$(pyenv init -)"' >>"${HOME}/.zshrc"
fi

if [ -n "$BASH_VERSION" ]; then
  echo 'export PYENV_ROOT="$HOME/.pyenv"' >>"${HOME}/.profile"
  echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >>"${HOME}/.profile"
  echo 'eval "$(pyenv init --path)"' >>"${HOME}/.profile"
  echo 'if [ -n "$PS1" -a -n "$BASH_VERSION" ]; then source ~/.bashrc; fi' >>"${HOME}/.profile"

  echo 'eval "$(pyenv init -)"' >>"${HOME}/.bashrc"
fi
