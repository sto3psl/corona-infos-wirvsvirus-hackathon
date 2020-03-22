const twilio = require('twilio')
const { voiceConfig } = require('./_utils/config')
const { assistant } = require('./_utils/watson')
const messagesDE = require('./_utils/messages_de.json')

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

  twiml.say(voiceConfig, messagesDE.welcome)
  twiml.pause({ length: 1 })
  twiml.say(voiceConfig, messagesDE.welcome_2)

  twiml.gather({
    language: voiceConfig.language,
    action: `/api/respond?session_id=${watsonSession.result.session_id}`,
    input: 'speech',
    timeout: 2
  })

  res.writeHead(200, { 'Content-Type': 'text/xml; charset=UTF-8' })
  res.end(twiml.toString())
}
