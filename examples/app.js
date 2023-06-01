const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
require('dotenv').config();

app.use('/dist', express.static(path.join(__dirname, '../dist')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));

router.get('/env/:key', function (req, res) {
  res.send(process.env[req.params.key]);
});

router.get('/examples/:file', function (req, res) {
  res.sendFile(path.join(__dirname + '/' + req.params.file));
});

app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Listening to port ' + (process.env.port || 3000));
