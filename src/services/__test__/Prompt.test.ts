import test from 'node:test'
import assert from 'node:assert/strict'

import { Prompt } from '../Prompt.js'

await test('services/Prompt', async (t) => {
  await t.test('should accept valid answers', async () => {
    const acceptableAnswers = ['y', 'Y', 'yes', 'Yes', 'n', 'N', 'No', 'no', '']
    for (const answer of acceptableAnswers) {
      assert.strictEqual(
        Prompt.ACCEPTED_ANSWERS.includes(answer.toLowerCase()),
        true,
        `${answer} is accepted`
      )
    }
  })

  await t.test('should disallow invalid answers', async () => {
    const wrongAnswers = ['Nope', 'Yay', 'Agreed', 'Anything you can imagine']
    for (const answer of wrongAnswers) {
      assert.strictEqual(
        Prompt.ACCEPTED_ANSWERS.includes(answer.toLowerCase()),
        false,
        `${answer} is not accepted`
      )
    }
  })
})
