const axios = require('axios');
const {v4: uuidv4} = require('uuid');

class TseClient {
  constructor(deviceHost) {
    this.deviceHost = deviceHost;
  }

  async selfTest(clientId) {
    if (!clientId) {
      throw new Error('Missing parameters');
    }

    try {
      const {data: {setupRequired}} = await axios.post(`${this.deviceHost}/tse-self-test`, {clientId});
      return setupRequired;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async init() {
    try {
      await axios.post(`${this.deviceHost}/tse-init`);
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async setup({credentialSeed, adminPuk, adminPin, timeAdminPin, clientId}) {
    if (!credentialSeed || !adminPuk || !adminPin || !timeAdminPin || !clientId) {
      throw new Error('Missing parameters');
    }

    try {
      await axios.post(`${this.deviceHost}/tse-setup`, {credentialSeed, adminPuk, adminPin, timeAdminPin, clientId});
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async loginAdminUser(adminPin) {
    if (!adminPin) {
      throw new Error('Missing parameters');
    }

    try {
      await axios.post(`${this.deviceHost}/tse-admin-user-login`, {adminPin});
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async updateTime() {
    try {
      await axios.post(`${this.deviceHost}/tse-update-time`);
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async factoryReset() {
    try {
      await axios.post(`${this.deviceHost}/tse-factory-reset`);
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async startTransaction({clientId, transactionData}) {
    if (!clientId || !transactionData) {
      throw new Error('Missing parameters');
    }

    if (typeof transactionData !== 'object') throw new Error('transactionData must be an object');

    try {
      const {data: {transactionNumber}} = await axios.post(`${this.deviceHost}/start-tse-transaction`, {
        clientId,
        transactionData,
      });
      return +transactionNumber;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async updateTransaction({clientId, transactionNumber, transactionData}) {
    if (!clientId || (transactionNumber === null || transactionNumber === undefined) || !transactionData) {
      throw new Error('Missing parameters');
    }

    if (typeof transactionData !== 'object') throw new Error('transactionData must be an object');

    try {
      const {data} = await axios.post(`${this.deviceHost}/update-tse-transaction`, {
        clientId,
        transactionNumber,
        transactionData,
      });
      return data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async finishTransaction({clientId, transactionNumber}) {
    if (!clientId || (transactionNumber === null || transactionNumber === undefined)) {
      throw new Error('Missing parameters');
    }

    try {
      const {data} = await axios.post(`${this.deviceHost}/finish-tse-transaction`, {
        clientId,
        transactionNumber,
      });
      return data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }


  async fastInit({
                   clientId,
                   credentialSeed,
                   adminPin,
                   adminPuk,
                   timeAdminPin,
                 }) {
    await this.init();
    const setupRequired = await this.selfTest(clientId);
    if (setupRequired) await this.setup({credentialSeed, adminPuk, adminPin, timeAdminPin, clientId});
    await this.loginAdminUser(adminPin);
    await this.updateTime();
  }
}

class TseClientMock {
  constructor() {
    this.currentTransactionId = 0;
  }


  async selfTest(clientId) {
    if (!clientId) {
      throw new Error('Missing parameters');
    }

    return true;
  }

  async init() {

  }

  async setup({credentialSeed, adminPuk, adminPin, timeAdminPin, clientId}) {
    if (!credentialSeed || !adminPuk || !adminPin || !timeAdminPin || !clientId) {
      throw new Error('Missing parameters');
    }
  }

  async loginAdminUser(adminPin) {
    if (!adminPin) {
      throw new Error('Missing parameters');
    }
  }

  async updateTime() {

  }

  async factoryReset() {

  }

  async startTransaction({clientId, transactionData}) {
    if (!clientId || !transactionData) {
      throw new Error('Missing parameters');
    }

    if (typeof transactionData !== 'object') throw new Error('transactionData must be an object');

    return this.currentTransactionId++;
  }

  async updateTransaction({clientId, transactionNumber, transactionData}) {
    if (!clientId || (transactionNumber === null || transactionNumber === undefined) || !transactionData) {
      throw new Error('Missing parameters');
    }

    if (typeof transactionData !== 'object') throw new Error('transactionData must be an object');
    const logMessage = uuidv4();

    return {
      logTime: new Date().getTime(),
      signatureCounter: Math.round(Math.random() * 100000),
      transactionNumber: +transactionNumber,
      logMessageLength: logMessage.length,
      processDataLength: logMessage.length + Math.round(Math.random() * 100),
      logMessage,
    }
  }

  async finishTransaction({clientId, transactionNumber}) {
    if (!clientId || (transactionNumber === null || transactionNumber === undefined)) {
      throw new Error('Missing parameters');
    }

    const logMessage = uuidv4();

    return {
      logTime: new Date().getTime(),
      signatureCounter: Math.round(Math.random() * 100000),
      transactionNumber: +transactionNumber,
      logMessageLength: logMessage.length,
      processDataLength: logMessage.length + Math.round(Math.random() * 100),
      logMessage,
    }
  }

  async fastInit({
                   clientId,
                   credentialSeed,
                   adminPin,
                   adminPuk,
                   timeAdminPin,
                 }) {
    await this.init();
    const setupRequired = await this.selfTest(clientId);
    if (setupRequired) await this.setup({credentialSeed, adminPuk, adminPin, timeAdminPin, clientId});
    await this.loginAdminUser(adminPin);
    await this.updateTime();
  }
}

module.exports = process.env.mockMode === 'true' ? TseClientMock : TseClient;