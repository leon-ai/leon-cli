import execa from 'execa'
import ora from 'ora'
import { log } from './Log'

export async function installPipenv() {
  const pipenvLoader = ora('Installing pipenv').start()
  try {
    await execa('pip install --user pipenv')
    pipenvLoader.succeed()
  } catch (error) {
    pipenvLoader.fail()
    await log.error({
      stderr: 'Could not install pipenv',
      commandPath: 'create birth',
      value: error.toString()
    })
  }
}