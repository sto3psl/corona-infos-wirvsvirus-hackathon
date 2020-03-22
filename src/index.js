import './style'
import XMLReader from 'xml-reader'
import XMLQuery from 'xml-query'
import cx from 'classnames'
import { h } from 'preact'
import { useReducer, useEffect, useLayoutEffect } from 'preact/hooks'

function reducer (state, action) {
  switch (action.type) {
    case 'input':
      return {
        ...state,
        input: action.payload[1],
        conversation: state.conversation.concat([action.payload])
      }
    case 'action':
      return {
        ...state,
        action: action.payload
      }
    case 'conversation':
      return {
        ...state,
        conversation: state.conversation.concat([action.payload])
      }
  }
}

export default function App () {
  const [state, dispatch] = useReducer(reducer, {
    action: 'start-call',
    conversation: []
  })

  useEffect(async () => {
    const response = await (
      await fetch(
        `${
          location.hostname === 'localhost' ? 'http://localhost:3000' : ''
        }/api/${state.action}`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            SpeechResult: state.input
          })
        }
      )
    ).text()
    const ast = XMLReader.parseSync(response)
    const $ = XMLQuery(ast)
    const text = $.find('Say')
      .map(el => XMLQuery(el).text())
      .join('\n')
    const action = $.find('Gather').attr('action')

    dispatch({ type: 'conversation', payload: ['BOT', text] })

    if (action) {
      dispatch({ type: 'action', payload: action.split('/').pop() })
    }
  }, [state.input])

  useLayoutEffect(() => {
    if (state.conversation.length > 4) {
      window.scrollTo({
        top: document.body.getBoundingClientRect().height,
        behavior: 'smooth'
      })
    }
  }, [state.conversation.length])

  function handleSubmit (e) {
    e.preventDefault()
    const question = new FormData(e.target).get('question')
    dispatch({ type: 'input', payload: ['CALLER', question] })
    e.target.reset()
  }

  return (
    <div class='container'>
      <aside>
        <h1>Corona-Infos mit Twilio</h1>
        <h2>#WirVsVirus - Hackathon der Bundesregierung</h2>
        <p>
          <ul>
            <li>
              <a native href='https://devpost.com/software/176_virtueller_telefonassistent_coronainfosmittwilio'>
                DevPost
              </a>
            </li>
            <li>
              <a native href='https://github.com/sto3psl/corona-infos-wirvsvirus-hackathon'>
                Github Repository
              </a>
            </li>
          </ul>
        </p>
        <p>
          Telefonnummer: <a native href='tel:+12062220586'>+1 (206) 222 0586</a>
        </p>
        <p>
          <i>
            Dies ist eine temporäre US-Amerikanische Telefonnummer. Bei einem
            Anruf kommen eventuell hohe Kosten auf Sie zu. Ein Anruf über den
            Service <b>Skype</b> ist kostenlos.
          </i>
        </p>
        <p>
          Ziel unseres Projektes ist es, das Informationsbedürfnis rund um den
          Coronavirus der Bürger*innen schnell mit verlässlichen und aktuellen
          Antworten zufrieden zustellen. Dabei steht die Entlastung der
          öffentlichen Hotlines im Vordergrund und es wurde ein Telefonbot
          entwickelt: Anrufer*innen bekommen mit Hilfe eines Telefonbots
          verlässliche und aktuelle Informationen rund um die Fragen zu
          Corona-Virus, Sars-CoV-2 und Covid-19. Die anrufende Person stellt
          eine Frage. Aus der Frage wird die Intention identifiziert. Auf diese
          Intention wird eine passende Antwort gefunden und dem*r Nutzer*in von
          dem Telefonbot vorgesprochen. Weitere Fragen sind möglich.
        </p>
        <p>
          Durch die Nutzung eines Telefonbots können die Hotlines des
          Gesundheitsministeriums sowie der Gesundheitsämter entlastet werden.
          Zudem bietet es insbesondere Menschen ohne Internetanschluss einen
          Zugang zu Informationen.
        </p>
      </aside>
      <main class='conversation'>
        {state.conversation.map(([actor, entry], i) => {
          return (
            <p key={i} class={cx('bubble', actor)}>
              {entry}
            </p>
          )
        })}
        <form onSubmit={handleSubmit}>
          <input name='question' type='text' placeholder='...' />
          <button type='submit'>⬆</button>
        </form>
      </main>
    </div>
  )
}
