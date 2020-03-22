const twilio = require("twilio")
const { voiceConfig } = require("./_utils/config")
const { assistant } = require("./_utils/watson")

const { VoiceResponse } = twilio.twiml

/**
 * @param {import('@now/node').NowRequest} req
 * @param {import('@now/node').NowResponse} res
 */
module.exports = (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  if (!req.query.session_id) {
    res.status(400).json({ message: "missing session_id " })
    return
  }

  const twiml = new VoiceResponse()
  const input = req.body.SpeechResult

  if (input.toLowerCase().includes("ja")) {
    twiml.say(voiceConfig, "Bitte stellen Sie mir eine weitere Frage!")
    twiml.gather({
      language: voiceConfig.language,
      action: `https://corona-infos.now.sh/api/respond?session_id=${req.query.session_id}`,
      input: "speech"
    })
  } else if (input.toLowerCase().includes("nein")) {
    twiml.say(
      voiceConfig,
      "Vielen Dank. Ich hoffe, dass ich Ihnen helfen konnte. Bleiben Sie gesund und auf Wiedersehen."
    )
    twiml.pause({ length: 1 })
    twiml.hangup()
    assistant.deleteSession({ sessionId: req.query.session_id })
  }

  res.writeHead(200, { "Content-Type": "text/xml; charset=UTF-8" })
  res.end(twiml.toString())
}
