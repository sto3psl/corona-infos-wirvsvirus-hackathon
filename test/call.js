const got = require('got')
const cheerio = require('cheerio')
const prompts = require('prompts')

const webhook = got.extend({
  prefixUrl: 'http://localhost:3000/api'
})

function getHook (url) {
  return `/${url.split('/').pop()}`
}

function say (actor, message) {
  return `[${actor}]
${message}
`
}

async function call () {
  let response = await webhook('/start-call').text()
  let $ = cheerio.load(response)

  while ($('Gather').attr('action')) {
    const nextAction = getHook($('Gather').attr('action'))

    const texts = []
    $('Say').each((i, elem) => {
      texts.push($(elem).text())
    })
    const { question } = await prompts({
      type: 'text',
      name: 'question',
      message: say('BOT', texts.join('\n'))
    })

    response = await webhook
      .post(nextAction, {
        json: {
          SpeechResult: question
        }
      })
      .text()

    $ = cheerio.load(response)
  }
}

call().catch(error => {
  console.error(error)
  process.exit(1)
})
