const TseClient = require('./');

const deviceHost = 'http://192.168.10.74:5000';

// To use mock mode, set process.env.mockMode = 'true' (env vars are Strings)
const tseClient = new TseClient(deviceHost);

(async () => {
  const clientId = 'SWISSBIT';

  try {
    // use this function to factory reset the TSE device
    // await tseClient.factoryReset();

    console.log('Initializing...');
    tseClient.fastInit({
      credentialSeed: 'SwissbitSwissbit',
      adminPuk: '123456',
      adminPin: '12345',
      timeAdminPin: '12345',
      clientId,
    });

    console.log('Start transaction 1');
    const transactionNumber1 = await tseClient.startTransaction({
      clientId,
      transactionData: {
        randomNumber: Math.random(),
      },
    });
    console.log(`transactionNumber1: ${transactionNumber1}`);

    console.log('Update transaction 1');
    const updatedTransaction1 = await tseClient.updateTransaction({
      clientId,
      transactionNumber: transactionNumber1,
      transactionData: {
        randomNumber: Math.random(),
      },
    });
    console.log(`updatedTransaction1: ${JSON.stringify(updatedTransaction1)}`);

    console.log('Finish transaction 1');
    const finishedTransaction1 = await tseClient.finishTransaction({
      clientId,
      transactionNumber: transactionNumber1,
    });
    console.log(`finishedTransaction1: ${JSON.stringify(finishedTransaction1)}`);

    console.log('Start transaction 2');
    const transactionNumber2 = await tseClient.startTransaction({
      clientId,
      transactionData: {
        randomNumber: Math.random(),
      },
    });
    console.log(`transactionNumber2: ${transactionNumber2}`);

    console.log('Finish transaction 2');
    const finishedTransaction2 = await tseClient.finishTransaction({
      clientId,
      transactionNumber: transactionNumber2,
    });
    console.log(`finishedTransaction2: ${JSON.stringify(finishedTransaction2)}`);

  } catch (e) {
    console.error(e);
  }
})()
