import readline from 'node:readline'

export const positiveAnswers = ['y', 'yes']
export const negativeAnswers = ['n', 'no']
export const acceptedAnswers = [...positiveAnswers, ...negativeAnswers, '']

export class Prompt {
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
            const isAcceptedAnswer = acceptedAnswers.includes(cleanedAnswer)
            if (isAcceptedAnswer) {
              readlineInterface.close()
              const isUserAccepting =
                positiveAnswers.includes(cleanedAnswer) ||
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

export const prompt = new Prompt()
