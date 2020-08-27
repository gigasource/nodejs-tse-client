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

  async startTransaction({clientId, transactionData = '', processType = ''}) {
    if (!clientId) {
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

  async updateTransaction({clientId, transactionNumber, transactionData = '', processType = ''}) {
    if (!clientId || (transactionNumber === null || transactionNumber === undefined)) {
      throw new Error('Missing parameters');
    }

    try {
      const {data} = await axios.post(`${this.deviceHost}/update-tse-transaction`, {
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

  async finishTransaction({clientId, transactionNumber, transactionData = '', processType = ''}) {
    if (!clientId || (transactionNumber === null || transactionNumber === undefined)) {
      throw new Error('Missing parameters');
    }

    try {
      const {data} = await axios.post(`${this.deviceHost}/finish-tse-transaction`, {
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

  async startAndFinishTransaction({clientId, transactionData, processType = ''}) {
    if (!clientId) {
      throw new Error('Missing parameters');
    }

    try {
      const {data} = await axios.post(`${this.deviceHost}/start-and-finish-tse-transaction`, {
        clientId,
        transactionData,
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
      serialNumber: "2D49DCE478188FFB84B4F7B0735DF925436DCB23B65D2365FC0A62AB4DBE0217",
      signature: "193632DE8BC883E3FED0D293E1FB2B8976A4B2C2D856219887CA545D4AEBACF5E46798DD93869121B9CB4F7449D5EA3484B73F4D39BD6A437403CA355BA17EF66C4BCCA6E540B527E3519AD4D7B351A92FC0BF705D13E666797524EE12E846B9",
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
      serialNumber: "2D49DCE478188FFB84B4F7B0735DF925436DCB23B65D2365FC0A62AB4DBE0217",
      signature: "0E048A3C9653422DCEA626267CEBDBF93DAFE3308609D06566C12A1E1297A98BED8252478A5202B40AE11BD07910DFE66567A7076927F21BEFA1454CDA2C0512598E92EE7DE9FF1B6636EFD2B0FBE1F0DB08ED6E492BE0B5C25EC07A314BE90D",
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
      serialNumber: "2D49DCE478188FFB84B4F7B0735DF925436DCB23B65D2365FC0A62AB4DBE0217",
      signature: "742E73EEB37BD9D937F319B94D79EAB3C51DBF3D3474F61E626C2B867D40D3C7D18A742FB87BA5D0347FFBDDE935230610AD92E9C4F6638DB57160BFF06218BF3C72D034DBAF8FC5E59A2BFE3C261A7F940CF7EFBD74145A4B288F0EF49822CC",
      signatureCounter: Math.round(Math.random() * 100000),
      transactionNumber: +transactionNumber,
      logMessageLength: logMessage.length,
      processDataLength: logMessage.length + Math.round(Math.random() * 100),
      logMessage,
    }
  }

  async startAndFinishTransaction({clientId, transactionData, processType = ''}) {
    if (!clientId) {
      throw new Error('Missing parameters');
    }

    return {
      transactionStartInfo: {
        logTime: 1598511197,
        serialNumber: "2D49DCE478188FFB84B4F7B0735DF925436DCB23B65D2365FC0A62AB4DBE0217",
        signatureCounter: 917,
        signature: "3FD09E21E56E7902EA364E17612A0A8BDF89D6DC0F8D40CE3D4BCF99134E9879965DD8CC2BBFAF8F75919CF9F7526CBA5C729CFD88A09E4FC131880B22CE8109A415E3F4219D1D0F0C2D6D787D46AD3122049BDFA64FEAAA015B44371B5D9C12",
        transactionNumber: 26,
        logMessageLength: 208,
        processDataLength: 0,
        logMessage: "3081CD020102060904007F000703070101801053746172745472616E73616374696F6E810853574953534249548200830085011A04202D49DCE478188FFB84B4F7B0735DF925436DCB23B65D2365FC0A62AB4DBE0217300C060A04007F000701010401040202039502045F47585D04603FD09E21E56E7902EA364E17612A0A8BDF89D6DC0F8D40CE3D4BCF99134E9879965DD8CC2BBFAF8F75919CF9F7526CBA5C729CFD88A09E4FC131880B22CE8109A415E3F4219D1D0F0C2D6D787D46AD3122049BDFA64FEAAA015B44371B5D9C12"
      },
      transactionFinishInfo: {
        logTime: 1598511197,
        serialNumber: "2D49DCE478188FFB84B4F7B0735DF925436DCB23B65D2365FC0A62AB4DBE0217",
        signatureCounter: 918,
        signature: "22305BFB7B9D252AD83E95562B534FD00685815499527149721D4968E5A52A3DC7477F057F8796E5E4C357EE217295B5486E5DC62F8D9C345702E3FA216DE171D4F40B247457A270C2DB07A51F99436890AB867361E78EA2DF0283B57A5C0E87",
        transactionNumber: 26,
        logMessageLength: 2072,
        processDataLength: 1846,
        logMessage: "30820814020102060904007F000703070101801146696E6973685472616E73616374696F6E81085357495353424954828207367B2272616E646F6D537472696E67223A22302E38343235323136363236393738313039302E36313834383935333232343733383931302E33323437333534313535363739363738302E3032373837393830393138393132363336302E36383337343638313234313535303838302E38323030303332303835393239343132302E36353732393839303332383135373036302E37333330373732353838313334363733302E3135333935303833343839323533383032302E3031303334313234313231303538373636302E363134363934363831323831313536302E37333437303136353031383132343931302E33313431323130363036303433333132302E38373732323536343334353835373638302E303234383239333533343937393139383135302E3139373434393432353336333736393533302E37303833383237383630343733343933302E35393432313038373739313830333935302E39343334353131343937333936353835302E35353531343534393036393236373136302E3139343531313936333434363034383135302E3332353032393636333833313837393033302E3533303737373638303237393431302E393638343634333930393434313537302E39343138333138383732373639363637302E393637383030323532373036303639302E343934373437333337313832383831302E39313439393130363734323136303634302E31363036363536303034333336343032302E37373234373336393630393030333239302E34383131373639323338373235313132302E34323230313737393137323939383433302E35353638303039313338343733323731302E3436393934303439363035313432363835302E3230383030333439333031373332323436302E38333536383938353431363438303633302E33333531313838353439333230303231302E39343530383432363732313733383731302E3330323138393333393630353832303834302E35353532353732323437323537303038302E3039383435303838313536393738363433302E3137363138313634313432373638333333302E3239393239343736363335393933363335302E35313732343332353339363637373234302E37373537333130393334323937303836302E39333133313530323535383930353539302E33383933383134343337363539333834302E36323137343636363830393438363531302E36333934303931303935373937303532302E32313534353639363830333237383839302E37333035323235333535353838333833302E35373232323339313538373632303939302E3430333538383830383232373639383136302E35363333353636383530323338313136302E37393439303237313032383637363132302E39333935373633343832303030363633302E35323535313031363039323433383036302E3230303032373733363437363739343632302E37373238333437313039373133363439302E3032363731313039383935383036353637302E33313936303037363937323537333539302E36393935313635323138303430333237302E35373139383735363232303036353538302E3133383139323431363232343639353235302E38343638323733313738353236303536302E35363130373439303639383137323931302E3133353830343934363338373030363335302E33373631373730343838353632343238302E393237323631353533363631323932302E37323434313738333030353930323439302E3235313739323434303337383531373435302E38393332333936333131363638393839302E3438383639373339313832373735353733302E3131363230363233303632343630303334302E303439373037333433383535323437353534302E34333430373031363930343030363638302E3238313039303633343039343833353135302E36353431373637373838393232303537302E33303833303437343836373430303639302E38353435323335363334353037333333302E38363230353732343237373632373035302E3031333832313936323233383732323334302E31333438323433393430383430393833302E3133343039383035343534373136323834302E37323430383136353732313336323133302E3231303637333730343039363736313435302E383434353739333738333836323437302E303239323835353430313738323735383933302E303338333032353231343637333936363535302E36333838303031303536343934363932302E323033383133383635303434343135302E3338323235383736383432333935343435302E32323034343135313136343336393133302E3230393733353638323234323334373935302E34323833383836343034393733363039302E3036333434333231373439353839313636302E35303536353634373933343434333336302E3432333135383430353836333737343037302E38373036363138373838353137393739302E36383537363237373636333237363233227D830E6578616D706C6550726F6365737385011A04202D49DCE478188FFB84B4F7B0735DF925436DCB23B65D2365FC0A62AB4DBE0217300C060A04007F000701010401040202039602045F47585D046022305BFB7B9D252AD83E95562B534FD00685815499527149721D4968E5A52A3DC7477F057F8796E5E4C357EE217295B5486E5DC62F8D9C345702E3FA216DE171D4F40B247457A270C2DB07A51F99436890AB867361E78EA2DF0283B57A5C0E87"
      }
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
