const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

if (process.env.NODE_ENV !== 'production') require('dotenv').config(); // si no es prod añade .env a process.env
// para produccion se hara directamente en heroku, ver deployment seccion

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build'))); // para el deployment de la app cliente (servimos nuestra app)

  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html')); // la 1ra vez que se ejecuta el server envia el index
    // despues de eso solo se ejecutara el API, cuando lo requiera el cliente, ya que la ejecucion la toma react
  });
}

app.listen(port, (error) => {
  if (error) throw error;
  console.log('Server running on port ' + port);
});

app.post('/payment', (req, res) => {
  const body = {
    source: req.body.token.id,
    amount: req.body.amount,
    currency: 'usd',
  };

  stripe.charges.create(body, (stripeErr, stripeRes) => {
    if (stripeErr) {
      res.status(500).send({ error: stripeErr });
      console.log(stripeErr);
    } else {
      res.status(200).send({ success: stripeRes });
      console.log('OK...');
    }
  });
});
