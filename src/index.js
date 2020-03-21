import './style';
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks'

export default function App () {
	const [conversation, setConversation] = useState([])

	useEffect(async () => {
		const response = await (await fetch('/api/start-call')).text()
		console.log(response)
	}, [])

	console.log(conversation)
	return (
		<div>
			<h2></h2>
		</div>
	);
}
