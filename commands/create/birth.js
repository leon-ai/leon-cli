const { Command } = require('clipanion')

class CreateBirthCommand extends Command {
  async execute () {
    console.log('Hello leon!')
    return 0
  }
}

CreateBirthCommand.paths = [['create', 'birth']]

module.exports = CreateBirthCommand
