const twilio = require('twilio')
const { voiceConfig } = require('./_utils/config')
const answersDE = require('./_utils/answers_de.json')
const { assistant } = require('./_utils/watson')

const { VoiceResponse } = twilio.twiml

async function getIntentFromInput (input, sessionId) {
  const message = await assistant.message({
    assistantId: process.env.WATSON_ASSISTANT_ID,
    sessionId,
    input: {
      message_type: 'text',
      text: input
    }
  })

  console.log(message.result)

  if (message.result.output.intents.length) {
    return message.result.output.intents[0].intent
  }
}

/**
 * Tries to find a response for a caller's question.
 * @param {string} input Caller Input
 * @param {string} sessionId Watson Session Id
 * @returns {Promise<string>}
 */
async function findResponse (input, sessionId) {
  const intent = await getIntentFromInput(input, sessionId)
  return answersDE[intent].answer
}

/**
 * @param {import('@now/node').NowRequest} req
 * @param {import('@now/node').NowResponse} res
 */
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (!req.query.session_id) {
    res.status(400).json({ message: 'missing session_id ' })
    return
  }

  const sessionId = req.query.session_id
  const twiml = new VoiceResponse()
  const input = req.body.SpeechResult
  const response = await findResponse(input, sessionId)

  if (!input || !response) {
    twiml.say(
      voiceConfig,
      'Leider konnte ich zu Ihrer Frage keine passende Antwort finden. Wollen Sie es noch einmal probieren?'
    )
  } else {
    twiml.say(voiceConfig, response)
    twiml.pause({ length: 2 })
    twiml.say(voiceConfig, 'Haben Sie noch weitere Fragen?')
  }

  twiml.gather({
    language: voiceConfig.language,
    action: `/api/follow-up?session_id=${sessionId}`,
    input: 'speech',
    hints: 'ja, nein'
  })

  res.writeHead(200, { 'Content-Type': 'text/xml; charset=UTF-8' })
  res.end(twiml.toString())
}
