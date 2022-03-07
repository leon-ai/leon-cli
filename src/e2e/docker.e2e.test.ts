import { test1CreateBirth } from './tests/1-create-birth.js'
import { test2Update } from './tests/2-update.js'
import { test3Start } from './tests/3-start.js'
import { test4Check } from './tests/4-check.js'

test1CreateBirth({ useDocker: true })
test2Update()
test3Start()
test4Check()
