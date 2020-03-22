const path = require('path')
const fs = require('fs').promises
const got = require('got')
const { csvParse } = require('d3-dsv')

const GOOGLE_SHEET = 'https://docs.google.com/spreadsheets/d/1ssWtf3cW8t1I961NwiHNADJpmwxEyZePC95qwx4G3kk/export\?format\=csv\&id\=1ssWtf3cW8t1I961NwiHNADJpmwxEyZePC95qwx4G3kk'

async function download () {
  const file = path.join(__dirname, '../api', '_utils/answers_de.json')
  const response = await got(GOOGLE_SHEET).text()

  const rows = csvParse(response)

  const answers = {}
  for (const { intent, ...row } of rows.filter(row => row.answer)) {
    answers[intent] = row
  }

  await fs.writeFile(
    file,
    JSON.stringify(answers, null, 2)
  )
  console.log('[DONE]', `Updated "${file}"`)
}

download()
