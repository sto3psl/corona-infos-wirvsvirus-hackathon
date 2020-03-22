import './style';
import XMLReader from 'xml-reader'
import XMLQuery from 'xml-query'
import cx from 'classnames'
import { h } from 'preact';
import { useReducer, useEffect } from 'preact/hooks'

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
	const [state, dispatch] = useReducer(reducer, { action: 'start-call', conversation: [] })

	useEffect(async () => {
		const response = await (await fetch(`/api/${state.action}`, {
			method: 'POST',
			mode: 'cors',
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify({
				SpeechResult: state.input
			})
		})).text()
		const ast = XMLReader.parseSync(response)
		const $ = XMLQuery(ast)
		const text = $.find('Say').map(el => XMLQuery(el).text()).join('\n')
		const action = $.find('Gather').attr('action')

		dispatch({ type: 'conversation', payload: ['BOT', text] })

		if (action) {
			dispatch({ type: 'action', payload: action.split('/').pop() })
		}
	}, [state.input])

	function handleSubmit (e) {
		e.preventDefault()
		const question = new FormData(e.target).get('question')
		dispatch({ type: 'input', payload: ['CALLER', question] })
		e.target.reset()
	}

	return (
		<div class='conversation'>
			{state.conversation.map(([actor, entry], i) => {
				return (
					<p key={i} class={cx('bubble', actor)}>{entry}</p>
				)
			})}
			<form onSubmit={handleSubmit}>
				<input name="question" type="text" placeholder="..." />
				<button type="submit">⬆</button>
			</form>
		</div>
	);
}
