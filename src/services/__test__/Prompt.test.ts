import { isValidAnswer } from '../Prompt'

describe('services/Prompt - isValidAnswer', () => {
  it('should accept yes, y, no, n as answers', () => {
    const acceptableAnswers = ['y', 'Y', 'yes', 'Yes', 'n', 'N', 'No', 'no']

    for (const answer of acceptableAnswers) {
      expect(isValidAnswer(answer)).toBe(true)
    }

    const wrongAnswers = ['Nope', 'Yay', 'Agreed', 'Anything you can imagine']

    for (const answer of wrongAnswers) {
      expect(isValidAnswer(answer)).toBe(false)
    }
  })
})
