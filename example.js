const TseClient = require('./');

const deviceHost = 'http://192.168.10.74:5000';

// To use mock mode, set process.env.mockMode = 'true' (env vars are Strings)
const tseClient = new TseClient(deviceHost);

function generateLongString() {
  let s = '';

  for (let i = 0; i < 100; i++) {
    s += Math.random().toString();
  }

  return s;
}

(async () => {
  const clientId = 'SWISSBIT';
  const processType = 'exampleProcess';
  const credentialSeed = 'SwissbitSwissbit';
  const adminPuk = '123456';
  const adminPin = '12345';
  const timeAdminPin = '12345';

  try {
    // need to call init first
    await tseClient.init();

    // use this function to factory reset the TSE device
    // await tseClient.factoryReset();

    console.log('Initializing...');
    const setupRequired = await tseClient.selfTest(clientId);
    if (setupRequired) await tseClient.setup({credentialSeed, adminPuk, adminPin, timeAdminPin, clientId});
    await tseClient.loginAdminUser(adminPin);
    await tseClient.updateTime();

    const publicKey = await tseClient.getTsePublicKey();
    const serialNumber = await tseClient.getTseSerialNumber();
    const signatureAlgorithm = await tseClient.getTseSignatureAlgorithm();
    const certificateExpDate = await tseClient.getTseCertificateExpDate();
    const logMessageCertificate = await tseClient.getLogMessageCertificate();
    console.log(`public key = ${publicKey}`);
    console.log(`serial number = ${serialNumber}`);
    console.log(`signature algorithm = ${signatureAlgorithm}`);
    console.log(`certificate exp date = ${certificateExpDate}`);
    console.log(`log message certificate = ${logMessageCertificate}`);

    console.log('\nStart transaction 1');
    const transactionData1 = await tseClient.startTransaction({
      clientId,
      transactionData: {
        randomString: generateLongString(),
      },
      processType,
    });
    const transactionNumber1 = transactionData1.transactionNumber;
    console.log(`start: ${JSON.stringify(transactionData1)}`);

    console.log('Update transaction 1');
    const updatedTransaction1 = await tseClient.updateTransaction({
      clientId,
      transactionNumber: transactionNumber1,
      transactionData: {
        randomString: generateLongString(),
      },
      processType,
    });
    console.log(`update: ${JSON.stringify(updatedTransaction1)}`);

    console.log('Finish transaction 1');
    const finishedTransaction1 = await tseClient.finishTransaction({
      clientId,
      transactionNumber: transactionNumber1,
      processType,
    });
    console.log(`finish: ${JSON.stringify(finishedTransaction1)}`);

    console.log('\nStart transaction 2');
    const transactionData2 = await tseClient.startTransaction({
      clientId,
      transactionData: {
        randomString: generateLongString(),
      },
      processType,
    });
    const transactionNumber2 = transactionData2.transactionNumber;
    console.log(`start: ${JSON.stringify(transactionData2)}`);

    console.log('Finish transaction 2');
    const finishedTransaction2 = await tseClient.finishTransaction({
      clientId,
      transactionNumber: transactionNumber2,
      processType,
    });
    console.log(`finish: ${JSON.stringify(finishedTransaction2)}`);

    console.log('\nStart and finish transaction 3');
    const finishedTransaction3 = await tseClient.startAndFinishTransaction({
      clientId,
      transactionData: {
        randomString: generateLongString(),
      },
      processType,
    });
    console.log(`finish: ${JSON.stringify(finishedTransaction3)}`);

  } catch (e) {
    console.error(e);
  }
})()
