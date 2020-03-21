import twilio from 'twilio'

const { VoiceResponse } = twilio.twiml

export default (req, res) => {
  const twiml = new VoiceResponse();

  twiml.say({
    language: 'de-DE',
    voice: 'Polly.Hans' // "Polly.Marlene"
  }, 'Danke für Ihren Anruf. Ich beantworte Ihre Fragen zum Corona-Virus.');

  twiml.gather({
    language: 'de-DE',
    action: 'https://30890a23.ngrok.io/api/respond',
    input: 'speech',
  })

  res.writeHead(200, { 'Content-Type': 'text/xml; charset=UTF-8' });
  res.end(twiml.toString());
}
