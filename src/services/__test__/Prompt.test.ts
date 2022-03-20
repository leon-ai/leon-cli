import tap from 'tap'

import { acceptedAnswers } from '../Prompt.js'

await tap.test('services/Prompt', async (t) => {
  await t.test('should accept yes, y, no, n as answers', async (t) => {
    const acceptableAnswers = ['y', 'Y', 'yes', 'Yes', 'n', 'N', 'No', 'no', '']
    const wrongAnswers = ['Nope', 'Yay', 'Agreed', 'Anything you can imagine']
    for (const answer of acceptedAnswers) {
      t.equal(
        acceptableAnswers.includes(answer.toLowerCase()),
        true,
        `${answer} is accepted`
      )
      t.equal(
        wrongAnswers.includes(answer.toLowerCase()),
        false,
        `${answer} is not accepted`
      )
    }
  })
})
