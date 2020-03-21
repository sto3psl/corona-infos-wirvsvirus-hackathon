const twilio = require('twilio')
const { voiceConfig } = require('./_utils/config')

const { VoiceResponse } = twilio.twiml

/**
 * @param {import('@now/node').NowRequest} req
 * @param {import('@now/node').NowResponse} res
 */
module.exports = (req, res) => {
  const twiml = new VoiceResponse();
  const input = req.body.SpeechResult

  if (input.toLowerCase().includes('ja')) {
    twiml.say(voiceConfig, 'Bitte stellen Sie mir eine weitere Frage!')
    twiml.gather({
      language: voiceConfig.language,
      action: 'https://30890a23.ngrok.io/api/respond',
      input: 'speech'
    })
  } else if (input.toLowerCase().includes('nein')) {
    twiml.say(voiceConfig, 'Vielen Dank. Ich hoffe, dass ich Ihnen helfen konnte. Bleiben Sie Gesund und auf wiedersehen.')
    twiml.pause({ length: 1 })
    twiml.hangup()
  }

  res.writeHead(200, { 'Content-Type': 'text/xml; charset=UTF-8' });
  res.end(twiml.toString());
}
