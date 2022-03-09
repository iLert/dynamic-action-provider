# iLert dynamic actions provider

This is a sample webservice illustrating the 2 endpoints needed to dynamically hook into iLert alert actions.

## How to use?

- you will need Node.js and npm installed
- download or git pull this repository
- `cd dynamic-action-provider`
- run `npm install`
- run `npm start`
- you may use a service like ngrok to expose your local webservice to the internet during testing
e.g. `ngrok http 8087`
- configure your dynamic actions connector in iLert with your urls
e.g. `https://xxxx-xxx-xxx-xxx-xxx.ngrok.io/api/action-requests` and `https://xxxx-xxx-xxx-xxx-xxx.ngrok.io/api/action-responses`
- configure a connection with the connector^^ on your desired alert source

## More info

Can be found in the [documentation](https://docs.ilert.com/rest-api/application-hooks/dynamic-alert-actions).
