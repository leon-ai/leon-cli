import { isValidAnswer } from "../Prompt"

describe('services/Prompt - isValidAnswer', () => {
  it('should accept yes, y, no, n as answers', async () => {
    const acceptableAnswers = ['y', 'Y', 'yes', 'Yes', 'n', 'N', 'No', 'no']

    for(const answer of acceptableAnswers) {
      expect(await isValidAnswer(answer)).toBe(true)
    }

    const wrongAnswers = ['Nope', 'Yay', 'Agreed', 'Anything you can imagine']

    for (const answer of wrongAnswers) {
      expect(await isValidAnswer(answer)).toBe(false)
    }
  })
})