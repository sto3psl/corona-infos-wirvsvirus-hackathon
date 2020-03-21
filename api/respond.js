import twilio from 'twilio'

const { VoiceResponse } = twilio.twiml

export default (req, res) => {
  const twiml = new VoiceResponse();

  console.log(req.body)

  twiml.say({
    language: 'de-DE',
    voice: 'Polly.Hans' // "Polly.Marlene"
  }, `${req.body.SpeechResult}. Auf Wiedersehen!`);


  res.writeHead(200, { 'Content-Type': 'text/xml; charset=UTF-8' });
  res.end(twiml.toString());
}
