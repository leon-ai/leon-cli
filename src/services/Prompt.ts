import readline from 'readline'

export async function prompt (requirement: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return await new Promise(function (resolve) {
    const ask = function (): void {
      rl.question(`Would you like to download ${requirement} ? It is a necessary requirement. (Y/n)`, function (answer: string) {
        const cleanedAnswer = answer.toLowerCase().trim()
        const acceptedAnswers = ['yes', 'y', 'no', 'n']
        if (acceptedAnswers.includes(cleanedAnswer)) {
          rl.close()
          const isUserAccepting = cleanedAnswer.includes('y')
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
