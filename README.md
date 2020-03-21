# Corona-Information Hotline

Hier entsteht im Zuge des "WirVsVirus" Hackathons ein Telefonbot den Bürger*innen anrufen können, um nach Informationen zu COVID-19 zu fragen.

## Setup

Ihr benötigt [Node.js](https://nodejs.org) und `npm` (ist in Node.js enthalten). Außerdem sollte [`ngrok`](https://ngrok.com) installiert sein.

```sh
# Installiere ngrok mit brew
> brew cask install ngrok

# Repository klonen
> git clone https://github.com/sto3psl/corona-infos-wirvsvirus-hackathon corona-infos

# In Ordner wechseln
> cd corona-infos

# Dependencies installieren
> npm install
```

Mit diesen Befehlen solltest du ein korrektes Setup haben.

## Development

Den Development Server kann man mit folgendem Befehl starten.

```sh
> npm start
```

Damit läuft der Server und man kann es über einen `curl` Befehl testen.

```sh
> curl http://localhost:3000/api/start-call
# Antwort
<?xml version="1.0" encoding="UTF-8"?><Response><Say language="de-DE" voice="Polly.Hans">Danke für Ihren Anruf. Ich beantworte Ihre Fragen zum Corona-Virus.</Say><Gather language="de-DE" action="https://30890a23.ngrok.io/api/respond" input="speech"/></Response>
```

Ich empfehle [HTTPie](https://httpie.org) zu installieren um API Requests zu testen da es etwas nutzerfreundlicher als `curl` ist.

Um dem Service eine Frage zu stellen, nutzt man den `/respond` Endpoint:

```sh
> http http://localhost:3000/api/respond SpeechResult="Wie geht es?"
# Antwort

<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="de-DE" voice="Polly.Hans">Wie geht es?. Auf Wiedersehen!
  </Say>
</Response>
```

Aktuell wird nur die Frage wieder zurückgegeben in Kombination mit einem `Auf Wiedersehen`. So funktioniert auch Twilio indem es zu bestimmten Zeiten im Call diese API Endpoints aufruft.

Den Code findet ihr im `/api` Ordner.

## Nützliche Links

* [Twilio Docs](https://www.twilio.com/docs/api)
* [Zeit Now (hosting)](https://zeit.co/home)
