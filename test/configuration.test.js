/* eslint-dev mocha */
const fs = require('fs-extra')

const watcher = require('../lib')
const {Fixture} = require('./helper')

describe('configuration', function () {
  let fixture

  beforeEach(async function () {
    fixture = new Fixture()
    await fixture.before()
  })

  afterEach(async function () {
    await fixture.after(this.currentTest)
  })

  it('validates its arguments', async function () {
    await assert.isRejected(watcher.configure(), /requires an option object/)
  })

  it('configures the main thread logger', async function () {
    await watcher.configure({mainLog: fixture.mainLogFile})

    const contents = await fs.readFile(fixture.mainLogFile)
    assert.match(contents, /FileLogger opened/)
  })

  it('configures the worker thread logger', async function () {
    await watcher.configure({workerLog: fixture.workerLogFile})

    const contents = await fs.readFile(fixture.workerLogFile)
    assert.match(contents, /FileLogger opened/)
  })

  describe('for the polling thread', function () {
    describe("while it's stopped", function () {
      it('configures the logger', async function () {
        await watcher.configure({pollingLog: fixture.pollingLogFile})

        assert.isFalse(await fs.pathExists(fixture.pollingLogFile))

        await fixture.watch([], {poll: true}, () => {})

        const contents = await fs.readFile(fixture.pollingLogFile)
        assert.match(contents, /FileLogger opened/)
      })
    })

    describe("after it's started", function () {
      it('configures the logger', async function () {
        await fixture.watch([], {poll: true}, () => {})

        await watcher.configure({pollingLog: fixture.pollingLogFile})

        const contents = await fs.readFile(fixture.pollingLogFile)
        assert.match(contents, /FileLogger opened/)
      })
    })
  })
})
