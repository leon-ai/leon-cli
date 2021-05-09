import readline from 'readline'

export async function isValidAnswer(answer: string) {
  const cleanedAnswer = answer.toLowerCase().trim()
  const acceptedAnswers = ['yes', 'y', 'no', 'n']
  return acceptedAnswers.includes(cleanedAnswer)
}

export async function prompt (requirement: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return await new Promise(function (resolve) {
    const ask = function (): void {
      rl.question(`Would you like to download ${requirement} ? It is a necessary requirement. (Y/n)`, function (answer: string) {
        if (isValidAnswer(answer)) {
          rl.close()
          const isUserAccepting = answer.includes('y')
          resolve(isUserAccepting)
        } else {
          console.log('The value you provided is unknown. Please reply Yes or No.')
          ask()
        }
      })
    }
    ask()
  })
}
