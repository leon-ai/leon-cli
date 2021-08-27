import readline from 'readline'

export const positiveAnswers = ['y', 'yes']
export const negativeAnswers = ['n', 'no']
export const acceptedAnswers = [...positiveAnswers, ...negativeAnswers]

export class Prompt {
  public async shouldInstall(requirement: string): Promise<boolean> {
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    return await new Promise((resolve) => {
      const ask = (): void => {
        readlineInterface.question(
          `Would you like to download ${requirement} ? It is a necessary requirement. (Y/n)`,
          (answer: string) => {
            const cleanedAnswer = answer.toLowerCase().trim()
            const isAcceptedAnswer = acceptedAnswers.includes(cleanedAnswer)
            if (isAcceptedAnswer) {
              readlineInterface.close()
              const isUserAccepting = positiveAnswers.includes(cleanedAnswer)
              resolve(isUserAccepting)
            } else {
              console.log(
                'The value you provided is unknown. Please reply Yes or No.'
              )
              ask()
            }
          }
        )
      }
      ask()
    })
  }
}

export const prompt = new Prompt()
