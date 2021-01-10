const path = require('path');
const logger = require('morgan');
const express = require('express');

const { getVersion } = require('./app/wachangelog');

const app = express();
const port = process.env.PORT || 3000;

app.set('port', port);
app.use(logger('dev'));

app.get('/whatsapp/version', async (req, res, next) => {
  const { nocache } = req.query;
  const result = await getVersion(nocache);
  res.status(200).json(result);
});

app.use(['/', '/health'], (req, res) => {
  res.status(200).json({
    scraper_version: '1.0.0',
    scraper_status: 'stable',
  });
});
app.listen(port, () => console.log(`App started on port ${port}.`));
