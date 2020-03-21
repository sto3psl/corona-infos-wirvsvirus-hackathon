const AssistantV2 = require('ibm-watson/assistant/v2')
const { IamAuthenticator } = require('ibm-watson/auth')

const assistant = new AssistantV2({
  version: '2020-02-05',
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSON_ASSISTANT_APIKEY,
  }),
  url: process.env.WATSON_ASSISTANT_URL
})

async function run () {
  const session = await assistant.createSession({
    assistantId: process.env.WATSON_ASSISTANT_ID
  })

  const message = await assistant.message({
    assistantId: process.env.WATSON_ASSISTANT_ID,
    sessionId: session.result.session_id,
    input: {
      message_type: 'text',
      text: 'Gibt es Corona-Fälle in Bayern?'
    }
  })

  console.log(message.result.output)

  await assistant.deleteSession({
    assistantId: process.env.WATSON_ASSISTANT_ID,
    sessionId: session.result.session_id
  })
}

run()
