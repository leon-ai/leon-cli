# 💡 Contributing

Thanks a lot for your interest in contributing to **leon-cli**! 🎉

## Code of Conduct

**Leon** has adopted the [Contributor Covenant](https://www.contributor-covenant.org/) as its Code of Conduct, and we expect project participants to adhere to it. Please read [the full text](./CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

## Open Development

All work on **Leon** happens directly on [GitHub](https://github.com/leon-ai). Both core team members and external contributors send pull requests which go through the same review process.

## Types of contributions

- Reporting a bug.
- Suggest a new feature idea.
- Correct spelling errors, improvements or additions to documentation files (README, CONTRIBUTING...).
- Improve structure/format/performance/refactor/tests of the code.

## Development Setup

```sh
# Download the source code
git clone https://github.com/leon-ai/leon-cli.git

# Install npm dependencies
npm install

# Add your awesome changes...

# Build
npm run build

# Install the local folder as a global npm package
npm install --global

# Run
leon
```

## Pull Requests

- **Please first discuss** the change you wish to make via [issue](https://github.com/leon-ai/leon-cli/issues) before making a change. It might avoid a waste of your time.

- Ensure your code respect `eslint` and `prettier`.

- Make sure your **code passes the tests**.

If you're adding new features to **leon-cli**, please include tests.

## Commits

The commit message guidelines respect [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) and [Semantic Versioning](https://semver.org/) for releases.

### Types

Types define which kind of changes you made to the project.

| Types    | Description                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| feat     | A new feature.                                                                                               |
| fix      | A bug fix.                                                                                                   |
| docs     | Documentation only changes.                                                                                  |
| style    | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).      |
| refactor | A code change that neither fixes a bug nor adds a feature.                                                   |
| perf     | A code change that improves performance.                                                                     |
| test     | Adding missing tests or correcting existing tests.                                                           |
| build    | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm).         |
| ci       | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs). |
| chore    | Other changes that don't modify src or test files.                                                           |
| revert   | Reverts a previous commit.                                                                                   |

### Scopes

Scopes define what part of the code changed.
