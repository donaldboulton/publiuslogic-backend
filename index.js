const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const webpush = require('web-push')
const app = express()
app.use(cors())
app.use(bodyParser.json())
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const port = process.env.PORT || 8080;

const jwtCheck = jwt({
      secret: jwks.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: 'https://mansbooks.auth0.com/.well-known/jwks.json'
    }),
    audience: 'https://publiuslogic.com/',
    issuer: 'https://mansbooks.auth0.com/',
    algorithms: ['RS256']
});

app.use(jwtCheck);

app.get('/authorized', function (req, res) {
    res.send('Secured Resource');
});

app.get('/', (req, res) => res.send('Hello World!'))
const dummyDb = { subscription: null } //dummy in memory store
const saveToDatabase = async subscription => {
  // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
  // Here you should be writing your db logic to save it.
  dummyDb.subscription = subscription
}
// The new /save-subscription endpoint
app.post('/save-subscription', async (req, res) => {
  const subscription = req.body
  await saveToDatabase(subscription) //Method to save the subscription to Database
  res.json({ message: 'success' })
})
const vapidKeys = {
  publicKey:
    'BGGMV7bJQRiPlAsn5MH6DPMik5MUOR8o7LS6-TjNe-pMdX_HtvniEgE--LEQAXn3V3X1N-jaAfWIjWNTCGiekGE',
  privateKey: 
    'SuuHV2S__C2907ho39MCjTF1BSkdSttnVcENeB14wnE',
}
//setting our previously generated VAPID keys
webpush.setVapidDetails(
  'mailto:donaldboulton@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)
//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend) => {
  webpush.sendNotification(subscription, dataToSend)
}
//route to test send notification
app.get('/send-notification', (req, res) => {
  const subscription = dummyDb.subscription //get subscription from your databse here.
  const message = 'Hello World'
  sendNotification(subscription, message)
  res.json({ message: 'message sent' })
})

app.listen(port);