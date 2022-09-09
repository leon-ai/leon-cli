import tap from 'tap'

import { Prompt } from '../Prompt.js'

await tap.test('services/Prompt', async (t) => {
  await t.test('should accept valid answers', async (t) => {
    const acceptableAnswers = ['y', 'Y', 'yes', 'Yes', 'n', 'N', 'No', 'no', '']
    for (const answer of acceptableAnswers) {
      t.equal(
        Prompt.ACCEPTED_ANSWERS.includes(answer.toLowerCase()),
        true,
        `${answer} is accepted`
      )
    }
  })

  await t.test('should disallow invalid answers', async (t) => {
    const wrongAnswers = ['Nope', 'Yay', 'Agreed', 'Anything you can imagine']
    for (const answer of wrongAnswers) {
      t.equal(
        Prompt.ACCEPTED_ANSWERS.includes(answer.toLowerCase()),
        false,
        `${answer} is not accepted`
      )
    }
  })
})
