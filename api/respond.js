const twilio = require('twilio')
const { voiceConfig } = require('./_utils/config')
const answersDE = require('./_utils/answers_de.json')

const { VoiceResponse } = twilio.twiml

async function getIntentFromInput (input) {
  return 'ErkrankungenLänder'
}

/**
 * Tries to find a response for a caller's question.
 * @param {string} input Caller Input
 * @returns {Promise<string>}
 */
async function findResponse (input) {
  const intent = await getIntentFromInput(input)
  return answersDE[intent]
}

/**
 * @param {import('@now/node').NowRequest} req
 * @param {import('@now/node').NowResponse} res
 */
module.exports = async (req, res) => {
  const twiml = new VoiceResponse();
  const input = req.body.SpeechResult
  const response = await findResponse(input)

  if (!input || !response) {
    twiml.say(voiceConfig, 'Leider konnte ich zu Ihrer Frage keine passende Antwort finden. Wollen Sie es noch einmal probieren?')
  } else {
    twiml.say(voiceConfig, response)
    twiml.pause({ length: 2 })
    twiml.say(voiceConfig, 'Haben Sie noch weitere Fragen?')
  }

  twiml.gather({
    language: voiceConfig.language,
    action: 'https://30890a23.ngrok.io/api/follow-up',
    input: 'speech',
    hints: 'ja, nein'
  })

  res.writeHead(200, { 'Content-Type': 'text/xml; charset=UTF-8' });
  res.end(twiml.toString());
}
