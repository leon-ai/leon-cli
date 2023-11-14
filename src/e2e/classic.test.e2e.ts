import { test1CreateBirth } from '#src/e2e/tests/1-create-birth.js'
import { test2Update } from '#src/e2e/tests/2-update.js'
import { test3Start } from '#src/e2e/tests/3-start.js'
import { test4Check } from '#src/e2e/tests/4-check.js'
import { test5Run } from '#src/e2e/tests/5-run.js'

await test1CreateBirth()
await test2Update()
await test3Start()
await test4Check()
await test5Run()
