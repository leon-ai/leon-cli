import { Command } from 'clipanion'

export class CreateBirthCommand extends Command {
  static paths = [['create', 'birth']]

  async execute() {
    console.log('Hello leon!')
    return 0
  }
}
