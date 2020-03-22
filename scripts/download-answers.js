const path = require('path')
const fs = require('fs').promises
const got = require('got')
const { csvParse } = require('d3-dsv')

const GOOGLE_SHEET = 'https://docs.google.com/spreadsheets/d/1ssWtf3cW8t1I961NwiHNADJpmwxEyZePC95qwx4G3kk/export\?format\=csv\&id\=1ssWtf3cW8t1I961NwiHNADJpmwxEyZePC95qwx4G3kk'

async function download () {
  const response = await got(GOOGLE_SHEET).text()

  const rows = csvParse(response)

  const answers = {}
  for (const {intent, ...row} of rows.filter(row => row.answer)) {
    answers[intent] = row
  }

  const watson = rows
    .filter(row => row.user_utterances && row.intent && row.type === 'statisch')
    .map(({user_utterances, intent}) => `"${user_utterances}","${intent}"`).join('\n')

  await fs.writeFile(
    path.join(__dirname, '../api', '_utils/answers_de.json'),
    JSON.stringify(answers, null, 2)
  )

  await fs.writeFile(
    path.join(__dirname, '../build', 'watson_training.csv'),
    watson
  )
}

download()
