const express = require('express');
const mockServer = express();
const bodyParser = require('body-parser');
let currentTransactionId = 0;
const {v4: uuidv4} = require('uuid');
const mockServerPort = 8889;

mockServer.use(bodyParser.json());

mockServer.post('/tse-self-test', (req, res) => {
  if (!bodyHasProperties(req, res, ['clientId'])) return;

  res.status(200).json({
    setupRequired: true,
  })
});

mockServer.post('/tse-init', (req, res) => {
  res.status(204).send();
});

mockServer.post('/tse-setup', (req, res) => {
  if (!bodyHasProperties(req, res, ['credentialSeed', 'adminPuk', 'adminPin', 'timeAdminPin', 'clientId'])) return;

  res.status(204).send();
});

mockServer.post('/tse-admin-user-login', (req, res) => {
  if (!bodyHasProperties(req, res, ['adminPin'])) return;

  res.status(204).send();
});

mockServer.post('/tse-update-time', (req, res) => {
  res.status(204).send();
});

mockServer.post('/tse-factory-reset', (req, res) => {
  res.status(204).send();
});

mockServer.post('/start-tse-transaction', (req, res) => {
  if (!bodyHasProperties(req, res, ['clientId', 'transactionData'])) return;

  res.status(200).json({
    transactionNumber: currentTransactionId++,
  });
});

mockServer.post('/update-tse-transaction', (req, res) => {
  if (!bodyHasProperties(req, res, ['clientId', 'transactionNumber', 'transactionData'])) return;
  const {transactionNumber} = req.body;
  const logMessage = uuidv4();

  res.status(200).json({
    logTime: new Date().getTime(),
    signatureCounter: Math.round(Math.random() * 100000),
    transactionNumber: +transactionNumber,
    logMessageLength: logMessage.length,
    processDataLength: logMessage.length + Math.round(Math.random() * 100),
    logMessage,
  });
});

mockServer.post('/finish-tse-transaction', (req, res) => {
  if (!bodyHasProperties(req, res, ['clientId', 'transactionNumber'])) return;
  const {transactionNumber} = req.body;
  const logMessage = uuidv4();

  res.status(200).json({
    logTime: new Date().getTime(),
    signatureCounter: Math.round(Math.random() * 100000),
    transactionNumber: +transactionNumber,
    logMessageLength: logMessage.length,
    processDataLength: logMessage.length + Math.round(Math.random() * 100),
    logMessage,
  });
});

function bodyHasProperties(httpReq, httpRes, propNameArray) {
  const bodyProps = Object.keys(httpReq.body);

  for (const propName of propNameArray) {
    if (!bodyProps.includes(propName)) {
      httpRes.status(400).send('Missing property in request');
      return false;
    }
  }

  return true;
}

mockServer.listen(mockServerPort);
mockServer.port = mockServerPort;

module.exports = mockServer;
