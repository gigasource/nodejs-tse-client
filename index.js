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

  async startTransaction({clientId, transactionData, processType}) {
    if (!clientId || !processType) {
      throw new Error('Missing parameters');
    }

    try {
      const {data} = await axios.post(`${this.deviceHost}/start-tse-transaction`, {
        clientId,
        transactionData,
        processType,
      });
      return data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async updateTransaction({clientId, transactionNumber, transactionData, processType}) {
    if (!clientId || (transactionNumber === null || transactionNumber === undefined) || !processType) {
      throw new Error('Missing parameters');
    }

    try {
      const {data} = await axios.put(`${this.deviceHost}/update-tse-transaction`, {
        clientId,
        transactionNumber,
        transactionData,
        processType,
      });
      return data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async finishTransaction({clientId, transactionNumber, processType}) {
    if (!clientId || (transactionNumber === null || transactionNumber === undefined) || !processType) {
      throw new Error('Missing parameters');
    }

    try {
      const {data} = await axios.put(`${this.deviceHost}/finish-tse-transaction`, {
        clientId,
        transactionNumber,
        processType,
      });
      return data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async getTsePublicKey() {
    const {data} = await axios.get(`${this.deviceHost}/tse-public-key`);
    return data;
  }

  async getTseSerialNumber() {
    const {data} = await axios.get(`${this.deviceHost}/tse-serial-number`);
    return data;
  }

  async getTseSignatureAlgorithm() {
    const {data} = await axios.get(`${this.deviceHost}/tse-signature-algorithm`);
    return data;
  }

  async getTseCertificateExpDate() {
    const {data} = await axios.get(`${this.deviceHost}/tse-certificate-exp-date`);
    return new Date(+data * 1000); // data is time in seconds (as String -> convert to Number & multiply by 1000)
  }

  async getLogMessageCertificate() {
    const {data} = await axios.get(`${this.deviceHost}/tse-log-message-certificate`);
    return data;
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

  async startTransaction({clientId, transactionData, processType}) {
    if (!clientId || !processType) {
      throw new Error('Missing parameters');
    }

    const logMessage = uuidv4();

    return {
      logTime: new Date().getTime(),
      serialNumber:"2D49DCE478188FFB84B4F7B0735DF925436DCB23B65D2365FC0A62AB4DBE0217",
      signature:"193632DE8BC883E3FED0D293E1FB2B8976A4B2C2D856219887CA545D4AEBACF5E46798DD93869121B9CB4F7449D5EA3484B73F4D39BD6A437403CA355BA17EF66C4BCCA6E540B527E3519AD4D7B351A92FC0BF705D13E666797524EE12E846B9",
      signatureCounter: Math.round(Math.random() * 100000),
      transactionNumber: this.currentTransactionId++,
      logMessageLength: logMessage.length,
      processDataLength: logMessage.length + Math.round(Math.random() * 100),
      logMessage,
    }
  }

  async updateTransaction({clientId, transactionNumber, transactionData, processType}) {
    if (!clientId || (transactionNumber === null || transactionNumber === undefined) || !processType) {
      throw new Error('Missing parameters');
    }

    const logMessage = uuidv4();

    return {
      logTime: new Date().getTime(),
      serialNumber:"2D49DCE478188FFB84B4F7B0735DF925436DCB23B65D2365FC0A62AB4DBE0217",
      signature:"0E048A3C9653422DCEA626267CEBDBF93DAFE3308609D06566C12A1E1297A98BED8252478A5202B40AE11BD07910DFE66567A7076927F21BEFA1454CDA2C0512598E92EE7DE9FF1B6636EFD2B0FBE1F0DB08ED6E492BE0B5C25EC07A314BE90D",
      signatureCounter: Math.round(Math.random() * 100000),
      transactionNumber,
      logMessageLength: logMessage.length,
      processDataLength: logMessage.length + Math.round(Math.random() * 100),
      logMessage,
    }
  }

  async finishTransaction({clientId, transactionNumber, processType}) {
    if (!clientId || (transactionNumber === null || transactionNumber === undefined) || !processType) {
      throw new Error('Missing parameters');
    }

    const logMessage = uuidv4();

    return {
      logTime: new Date().getTime(),
      serialNumber:"2D49DCE478188FFB84B4F7B0735DF925436DCB23B65D2365FC0A62AB4DBE0217",
      signature:"742E73EEB37BD9D937F319B94D79EAB3C51DBF3D3474F61E626C2B867D40D3C7D18A742FB87BA5D0347FFBDDE935230610AD92E9C4F6638DB57160BFF06218BF3C72D034DBAF8FC5E59A2BFE3C261A7F940CF7EFBD74145A4B288F0EF49822CC",
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

  async getTsePublicKey() {
    return 'BHh1SuQKbT9ka6EU3FI0R3R4cz6Mz42+Zi2wt8tmBmbNjKeDqJZwhKvwnaU6oj5FpIySHaMoV2c8\n' +
      'yY/BjOqDncqt/HWfHDqjwNLZ+IRHJiE50q7yYlD2oazHevsl8OwV1g==\n';
  }

  async getTseSerialNumber() {
    return '2D49DCE478188FFB84B4F7B0735DF925436DCB23B65D2365FC0A62AB4DBE0217';
  }

  async getTseSignatureAlgorithm() {
    return 'ecdsa-plain-SHA384';
  }

  async getTseCertificateExpDate() {
    return new Date(1600559999000);
  }

  async getLogMessageCertificate() {
    return '-----BEGIN CERTIFICATE-----\n' +
      'MIIDZjCCAu2gAwIBAgIQBJi4nUKe3Z0r0lIwn4QxzTAKBggqhkjOPQQDAzBnMRYw\n' +
      'FAYDVQQDEw1UU0UgVGVzdCBDQSAxMSUwIwYDVQQKExxULVN5c3RlbXMgSW50ZXJu\n' +
      'YXRpb25hbCBHbWJIMRkwFwYDVQQLExBUZWxla29tIFNlY3VyaXR5MQswCQYDVQQG\n' +
      'EwJERTAeFw0yMDAzMTkxNjM4MzdaFw0yMDA5MTkyMzU5NTlaMIGIMRgwFgYDVQQu\n' +
      'Ew8tLVRlc3R2ZXJzaW9uLS0xCzAJBgNVBAYTAkRFMRQwEgYDVQQKEwtTd2lzc2Jp\n' +
      'dCBBRzFJMEcGA1UEAxNAM2EyNmNlNzBjYzVkNGUwM2U4ZTYxNGNjODNjMmU3N2Zj\n' +
      'ZjhmOWI1N2JhOGExODcyY2ViYmVkZWQyY2YxY2ZmZTB6MBQGByqGSM49AgEGCSsk\n' +
      'AwMCCAEBCwNiAAR4dUrkCm0/ZGuhFNxSNEd0eHM+jM+NvmYtsLfLZgZmzYyng6iW\n' +
      'cISr8J2lOqI+RaSMkh2jKFdnPMmPwYzqg53Krfx1nxw6o8DS2fiERyYhOdKu8mJQ\n' +
      '9qGsx3r7JfDsFdajggE2MIIBMjAfBgNVHSMEGDAWgBTNtwZSEkBSyrSa+d8j3PHY\n' +
      'GouCejAdBgNVHQ4EFgQUuma9u2SNjCXwvA2xLgwLNLPQwKUwOwYDVR0fBDQwMjAw\n' +
      'oC6gLIYqaHR0cDovL2NybC50c2UudGVsZXNlYy5kZS9jcmwvVFNFX0NBXzEuY3Js\n' +
      'MA4GA1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8EAjAAME0GA1UdIARGMEQwQgYJKwYB\n' +
      'BAG9Rw0pMDUwMwYIKwYBBQUHAgEWJ2h0dHA6Ly9kb2NzLnRzZS50ZWxlc2VjLmRl\n' +
      'L2Nwcy90c2UuaHRtbDBGBggrBgEFBQcBAQQ6MDgwNgYIKwYBBQUHMAKGKmh0dHA6\n' +
      'Ly9jcnQudHNlLnRlbGVzZWMuZGUvY3J0L1RTRV9DQV8xLmNydDAKBggqhkjOPQQD\n' +
      'AwNnADBkAjARnVtkySOJD5JjU/wI1SDoVsf99oQizLCva5wa42pp1Q1QPX+ORzji\n' +
      'qNJMh44myoICMHQO73C580nKc10+XRcM1uWizTA5gokLdDcIknyZxQj5crCy2stb\n' +
      '6GxGHHC/O+B7lA==\n' +
      '-----END CERTIFICATE-----\n' +
      '-----BEGIN CERTIFICATE-----\n' +
      'MIIDYzCCAuqgAwIBAgIQLB2/J2xwIqruPyAte9d7fjAKBggqhkjOPQQDAzBsMRsw\n' +
      'GQYDVQQDExJUU0UgVGVzdCBSb290IENBIDExJTAjBgNVBAoTHFQtU3lzdGVtcyBJ\n' +
      'bnRlcm5hdGlvbmFsIEdtYkgxGTAXBgNVBAsTEFRlbGVrb20gU2VjdXJpdHkxCzAJ\n' +
      'BgNVBAYTAkRFMB4XDTE5MTAwNzEwNTk0N1oXDTM0MTAwNzIzNTk1OVowZzEWMBQG\n' +
      'A1UEAxMNVFNFIFRlc3QgQ0EgMTElMCMGA1UEChMcVC1TeXN0ZW1zIEludGVybmF0\n' +
      'aW9uYWwgR21iSDEZMBcGA1UECxMQVGVsZWtvbSBTZWN1cml0eTELMAkGA1UEBhMC\n' +
      'REUwejAUBgcqhkjOPQIBBgkrJAMDAggBAQsDYgAEWA0KliDRc88NxoVCdeb4WXpK\n' +
      'I/T1Ofctg0RtnfiOAuWP4HvrlpntJ+KQ9xGCpRjgiFV4xQPSCjwUPmi11uEyYCQB\n' +
      'vqxYpUCBOdD/UnQqtfdNMTC4wD2Bqlt5+VNjfSiyo4IBUDCCAUwwHwYDVR0jBBgw\n' +
      'FoAUJshxqsyyzZZOQmrVQb/UqOI5Zv0wRQYDVR0fBD4wPDA6oDigNoY0aHR0cDov\n' +
      'L2NybC50c2UudGVsZXNlYy5kZS9jcmwvVFNFX1Rlc3RfUm9vdF9DQV8xLmNybDAd\n' +
      'BgNVHQ4EFgQUzbcGUhJAUsq0mvnfI9zx2BqLgnowDgYDVR0PAQH/BAQDAgEGMBIG\n' +
      'A1UdEwEB/wQIMAYBAf8CAQAwTQYDVR0gBEYwRDBCBgkrBgEEAb1HDSkwNTAzBggr\n' +
      'BgEFBQcCARYnaHR0cDovL2RvY3MudHNlLnRlbGVzZWMuZGUvY3BzL3RzZS5odG1s\n' +
      'MFAGCCsGAQUFBwEBBEQwQjBABggrBgEFBQcwAoY0aHR0cDovL2NydC50c2UudGVs\n' +
      'ZXNlYy5kZS9jcnQvVFNFX1Rlc3RfUm9vdF9DQV8xLmNlcjAKBggqhkjOPQQDAwNn\n' +
      'ADBkAjAqSp0n+0aIWaimrDdo0DkXbQyN9ANsygEPHVxUdJoo6TSo1Q+6Mz7gmloc\n' +
      'zf2K95UCMCnO72Tf2ggdIrkoIqKp7VoGCBhVXv83SMqKf/SrO1R0aKakqfdmrkdC\n' +
      '6wiVFbyCEg==\n' +
      '-----END CERTIFICATE-----\n' +
      '-----BEGIN CERTIFICATE-----\n' +
      'MIICWzCCAeKgAwIBAgIQLPKSE+lA1Xa9J9LGlFfE2TAKBggqhkjOPQQDAzBsMRsw\n' +
      'GQYDVQQDExJUU0UgVGVzdCBSb290IENBIDExJTAjBgNVBAoTHFQtU3lzdGVtcyBJ\n' +
      'bnRlcm5hdGlvbmFsIEdtYkgxGTAXBgNVBAsTEFRlbGVrb20gU2VjdXJpdHkxCzAJ\n' +
      'BgNVBAYTAkRFMB4XDTE5MTAwNzEwNDQxMFoXDTQ5MTAwNzIzNTk1OVowbDEbMBkG\n' +
      'A1UEAxMSVFNFIFRlc3QgUm9vdCBDQSAxMSUwIwYDVQQKExxULVN5c3RlbXMgSW50\n' +
      'ZXJuYXRpb25hbCBHbWJIMRkwFwYDVQQLExBUZWxla29tIFNlY3VyaXR5MQswCQYD\n' +
      'VQQGEwJERTB6MBQGByqGSM49AgEGCSskAwMCCAEBCwNiAAQUOmJf/IbCAH8M2Lh5\n' +
      'q6UeYjXGUNE2XpYwi22EaQ4bkQoAu96S02bkthQT2oju0lJmJnOiEriIMmgB2VAd\n' +
      'RZny7NtFuKjOMubTcdXQPdxiaIk/AImCVpu4jm5z3I9ZKhWjRTBDMB0GA1UdDgQW\n' +
      'BBQmyHGqzLLNlk5CatVBv9So4jlm/TAOBgNVHQ8BAf8EBAMCAQYwEgYDVR0TAQH/\n' +
      'BAgwBgEB/wIBATAKBggqhkjOPQQDAwNnADBkAjB/cim1CJN6PCxd19PpuNQ31GS+\n' +
      'ctV6pR0+1guoHUQwu/77HXTSaLj3EIuACWzF3lsCMCiAojiuq11vKINgVROqaCVJ\n' +
      'gveMIVVeXZWZEXMWTR5xPLEm/RPgQ6PInGZ44xYN6Q==\n' +
      '-----END CERTIFICATE-----'
  }
}

module.exports = process.env.mockMode === 'true' ? TseClientMock : TseClient;
