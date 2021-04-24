import { Command } from 'clipanion'

export class CreateBirthCommand extends Command {
  static paths = [['create', 'birth']]

  async execute (): Promise<number> {
    return 0
  }
}
