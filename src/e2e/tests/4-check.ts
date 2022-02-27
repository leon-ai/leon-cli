import execa from 'execa'

export const test4 = (): void => {
  it('leon check', async () => {
    const result = await execa('leon', ['check'])
    expect(result.exitCode).toEqual(0)
    expect(result.stdout).toContain('.: CHECKING :.')
  })
}
