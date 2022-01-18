<h1 align="center">Leon Command Line Interface (CLI)</h1>

<p align="center">
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/licence-MIT-blue.svg" alt="Licence MIT"/></a>
  <a href="./CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg" alt="Contributor Covenant" /></a>
  <br />
  <a href="https://github.com/leon-ai/leon-cli/actions/workflows/build.yml"><img src="https://github.com/leon-ai/leon-cli/actions/workflows/build.yml/badge.svg?branch=develop" /></a>
  <a href="https://github.com/leon-ai/leon-cli/actions/workflows/test.yml"><img src="https://github.com/leon-ai/leon-cli/actions/workflows/test.yml/badge.svg?branch=develop" /></a>
  <a href="https://github.com/leon-ai/leon-cli/actions/workflows/lint.yml"><img src="https://github.com/leon-ai/leon-cli/actions/workflows/lint.yml/badge.svg?branch=develop" /></a>
  <br />
  <a href="https://www.npmjs.com/package/ts-standard"><img alt="TypeScript Standard Style" src="https://camo.githubusercontent.com/f87caadb70f384c0361ec72ccf07714ef69a5c0a/68747470733a2f2f62616467656e2e6e65742f62616467652f636f64652532307374796c652f74732d7374616e646172642f626c75653f69636f6e3d74797065736372697074"/></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits" /></a>
  <a href="https://github.com/semantic-release/semantic-release"><img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" alt="semantic-release" /></a>
</p>

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 16.0.0
- [npm](https://npmjs.com/) >= 8.0.0

### Installation

```sh
# Install Leon CLI
npm install --global https://github.com/leon-ai/leon-cli/releases/latest/download/leon-cli.tar.gz

# Discover all the commands availables
leon
```

### Usage

CLI stands for *Command-Line Interface*. You can see it as a tool to help you with your Leon journey.

For the moment, the CLI helps you for the setup of Leon. In the future more commands will be released to improve your comfort and make the use of Leon even smoother.

The table below lists all the available commands:

| Command                                 | Description             | Option |
| ----------------------------------------|--------------------|---|
| `leon`          | List all commands available in the CLI.       | |
| `leon check`            | Check how the setup went.       | <ul><li>`--name`: name of the Leon instance.</li></ul> |
| `leon create birth`            | Brings Leon to life by checking all the requirements and install them with your approval. | <ul><li>`--develop`: install Leon from the `develop` Git branch.</li><li>`--docker`: install Leon with Docker.</li><li>`--path {path}`: location of your Leon instance.</li><li>`--version {version}`: install a [specific version](https://github.com/leon-ai/leon/releases) of Leon.</li><li>`--name {name}`: give a name to your Leon instance.</li><li>`--yes`: skip all questions with a "yes" answer.</li></ul> |
| `leon start`          | Start a Leon instance.       | <ul><li>`--port {port}`: run a Leon instance with a specific port.</li><li>`--name {name}`: run a Leon instance with a specific name.</li></ul> |

## 💡 Contributing

Anyone can help to improve the project, submit a Feature Request, a bug report or even correct a simple spelling mistake.

The steps to contribute can be found in the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

## 📄 License

[MIT](./LICENSE)
