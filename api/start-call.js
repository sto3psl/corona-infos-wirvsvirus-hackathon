import twilio from 'twilio'
import { voiceConfig } from "./_utils/config";

const { VoiceResponse } = twilio.twiml

/**
 * @param {import('@now/node').NowRequest} req
 * @param {import('@now/node').NowResponse} res
 */
export default (req, res) => {
  const twiml = new VoiceResponse();

  twiml.say(voiceConfig, 'Danke für Ihren Anruf. Ich beantworte Ihre Fragen zum Corona-Virus.');
  twiml.pause({ length: 1 });
  twiml.say(voiceConfig, 'Bitte stellen Sie mir eine Frage!');

  twiml.gather({
    language: voiceConfig.language,
    action: 'https://30890a23.ngrok.io/api/respond',
    input: 'speech',
  })

  res.writeHead(200, { 'Content-Type': 'text/xml; charset=UTF-8' });
  res.end(twiml.toString());
}
