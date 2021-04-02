import { Command } from 'clipanion'

export class CreateBirthCommand extends Command {
  static paths = [['create', 'birth']]

  async execute (): Promise<number> {
    console.log('Hello leon!')
    return 0
  }
}
