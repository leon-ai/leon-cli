const { Command, Option } = require('clipanion')

class CreateBirthCommand extends Command {
  static paths = [[`create`, `birth`]]

  async execute() {
    this.context.stdout.write('Hello leon!\n')
  }
}

module.exports = CreateBirthCommand
