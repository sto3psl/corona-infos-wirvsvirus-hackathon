const twilio = require('twilio')
const { voiceConfig } = require('./_utils/config')
const { assistant } = require('./_utils/watson')

const { VoiceResponse } = twilio.twiml

/**
 * @param {import('@now/node').NowRequest} req
 * @param {import('@now/node').NowResponse} res
 */
module.exports = async (req, res) => {
  const twiml = new VoiceResponse()

  const watsonSession = await assistant.createSession({
    assistantId: process.env.WATSON_ASSISTANT_ID
  })

  twiml.say(voiceConfig, 'Danke für Ihren Anruf. Ich beantworte Ihre Fragen zum Corona-Virus.')
  twiml.pause({ length: 1 })
  twiml.say(voiceConfig, 'Bitte stellen Sie mir eine Frage!')

  twiml.gather({
    language: voiceConfig.language,
    action: `/api/respond?session_id=${watsonSession.result.session_id}`,
    input: 'speech',
    timeout: 2
  })

  res.writeHead(200, { 'Content-Type': 'text/xml; charset=UTF-8' })
  res.end(twiml.toString())
}
