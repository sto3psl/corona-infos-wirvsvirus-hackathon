const twilio = require('twilio')
const { voiceConfig } = require('./_utils/config')
const answersDE = require('./_utils/answers_de.json')
const messagesDE = require('./_utils/messages_de.json')
const stateCases = require('./_utils/state-cases.json')
const { assistant } = require('./_utils/watson')

const { VoiceResponse } = twilio.twiml

/**
 * @param {string} input
 * @param {string} sessionId
 * @returns {Promise<import('ibm-watson/assistant/v2').MessageOutput>}
 */
async function getIntentFromInput(input, sessionId) {
  const message = await assistant.message({
    assistantId: process.env.WATSON_ASSISTANT_ID,
    sessionId,
    input: {
      message_type: 'text',
      text: input
    }
  })

  if (message.result.output.intents.length) {
    return message.result.output
  }
}

/**
 * Tries to find a response for a caller's question.
 * @param {string} intent Caller Intent
 * @returns {Promise<string | undefined>}
 */
async function findResponse(intent) {
  if (!intent || !answersDE[intent]) return
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
  const watsonOutput = await getIntentFromInput(input, sessionId)
  const intent = watsonOutput ? watsonOutput.intents[0].intent : null
  let responseText = null
  let askForFollowUp = false

  switch (intent) {
    case 'General_Ending': {
      await assistant.deleteSession({
        sessionId: req.query.session_id,
        assistantId: process.env.WATSON_ASSISTANT_ID
      })
      twiml.say(voiceConfig, messagesDE[intent])
      twiml.hangup()
      res.writeHead(200, { 'Content-Type': 'text/xml; charset=UTF-8' })
      res.end(twiml.toString())
      return
    }

    case 'General_Greetings':
      responseText = messagesDE[intent]
      break

    case 'General_Human_or_Bot':
      responseText = messagesDE[intent]
      break

    case 'General_Positive_Feedback':
      responseText = messagesDE[intent]
      break

    case 'AktuelleZahlenBundeslandGetestet': {
      const state = watsonOutput.entities.find(
        entity => entity.entity === 'bundesland'
      )
      if (state) {
        const stateData = stateCases[state.value]
        const response = await findResponse(intent, sessionId)
        responseText = response
          .replace('{{ZahlBundesland}}', stateData.cases)
          .replace('{{Bundesland}}', state.value)
        askForFollowUp = true
      }
      break
    }

    default: {
      responseText = await findResponse(intent, sessionId)
      askForFollowUp = true
    }
  }

  if (responseText) {
    twiml.say(voiceConfig, responseText)
    if (askForFollowUp) {
      twiml.pause({ length: 2 })
      twiml.say(voiceConfig, messagesDE.follow_up)
    }
  } else {
    twiml.say(voiceConfig, messagesDE.not_found)
  }

  twiml.gather({
    language: voiceConfig.language,
    action: `/api/respond?session_id=${sessionId}`,
    input: 'speech',
    timeout: 2
  })

  res.writeHead(200, { 'Content-Type': 'text/xml; charset=UTF-8' })
  res.end(twiml.toString())
}
