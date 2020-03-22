const got = require('got')
const { csvParse, csvFormatBody } = require('d3-dsv')

const GOOGLE_SHEET =
  'https://docs.google.com/spreadsheets/d/1ssWtf3cW8t1I961NwiHNADJpmwxEyZePC95qwx4G3kk/export?format=csv&id=1ssWtf3cW8t1I961NwiHNADJpmwxEyZePC95qwx4G3kk'

module.exports = async (req, res) => {
  const response = await got(GOOGLE_SHEET).text()

  const rows = csvParse(response)

  const watson = rows
    .filter(row => row.user_utterances && row.intent && row.type === 'statisch')
    // eslint-disable-next-line
    .map(({ user_utterances, intent }) => ({ user_utterances, intent }))

  res.writeHead(200, {
    'Content-Type': 'text/csv; charset=UTF-8',
    'Content-Disposition': 'attachment; filename="watson-intents.csv"'
  })
  res.end(csvFormatBody(watson))
}
