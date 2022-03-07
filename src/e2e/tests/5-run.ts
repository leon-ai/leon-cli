import execa from 'execa'

export const test5Run = (): void => {
  test('leon run', async () => {
    const result = await execa('leon', ['run', 'train'])
    expect(result.exitCode).toEqual(0)
  })
}
