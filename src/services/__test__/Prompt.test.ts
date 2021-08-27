import { acceptedAnswers } from '../Prompt'

describe('services/Prompt', () => {
  it('should accept yes, y, no, n as answers', () => {
    const acceptableAnswers = ['y', 'Y', 'yes', 'Yes', 'n', 'N', 'No', 'no']
    const wrongAnswers = ['Nope', 'Yay', 'Agreed', 'Anything you can imagine']
    for (const answer of acceptedAnswers) {
      expect(acceptableAnswers.includes(answer.toLowerCase())).toBe(true)
      expect(wrongAnswers.includes(answer.toLowerCase())).toBe(false)
    }
  })
})
