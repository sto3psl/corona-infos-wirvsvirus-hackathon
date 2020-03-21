const got = require('got')
const cheerio = require('cheerio')
const prompts = require('prompts')

const webhook = got.extend({
  prefixUrl: 'http://localhost:3000/api'
})

function getHook (url) {
  return `/${url.split('/').pop()}`
}

function say(actor, message) {
  return `[${actor}] ${message}
`
}

async function call () {
  let response = await webhook('/start-call').text()
  let $ = cheerio.load(response)

  while ($('Gather').attr('action')) {
    let nextAction = getHook($('Gather').attr('action'))

    const { question } = await prompts({
      type: 'text',
      name: 'question',
      message: say('BOT', $('Say').text())
    });

    response = await webhook.post(nextAction, {
      json: {
        SpeechResult: question
      }
    }).text()

    $ = cheerio.load(response)
  }
}

call()
