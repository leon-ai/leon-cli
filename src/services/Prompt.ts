import readline from 'node:readline'

/**
 * Prompt Singleton Class.
 */
export class Prompt {
  static readonly POSITIVE_ANSWERS = ['y', 'yes']
  static readonly NEGATIVE_ANSWERS = ['n', 'no']
  static readonly ACCEPTED_ANSWERS = [
    ...Prompt.POSITIVE_ANSWERS,
    ...Prompt.NEGATIVE_ANSWERS,
    ''
  ]

  private static instance: Prompt

  private constructor() {}

  public static getInstance(): Prompt {
    if (Prompt.instance == null) {
      Prompt.instance = new Prompt()
    }
    return Prompt.instance
  }

  public async shouldExecute(
    message: string,
    defaultValue: 'yes' | 'no'
  ): Promise<boolean> {
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    return await new Promise((resolve) => {
      const ask = (): void => {
        readlineInterface.question(
          `${message} ${defaultValue === 'yes' ? '(Y/n)' : '(y/N)'} `,
          (answer: string) => {
            const cleanedAnswer = answer.toLowerCase().trim()
            const isAcceptedAnswer =
              Prompt.ACCEPTED_ANSWERS.includes(cleanedAnswer)
            if (isAcceptedAnswer) {
              readlineInterface.close()
              const isUserAccepting =
                Prompt.POSITIVE_ANSWERS.includes(cleanedAnswer) ||
                (defaultValue === 'yes' && cleanedAnswer === '')
              resolve(isUserAccepting)
            } else {
              console.log(
                'The value you provided is unknown. Please reply "Yes" or "No".'
              )
              ask()
            }
          }
        )
      }
      ask()
    })
  }

  public async shouldInstall(requirement: string): Promise<boolean> {
    return await this.shouldExecute(
      `Would you like to install ${requirement}? If you don't, Leon may not work properly.`,
      'yes'
    )
  }
}
