const TseClient = require('./');

const deviceHost = 'http://192.168.10.74:5000';

// To use mock mode, set process.env.mockMode = 'true' (env vars are Strings)
const tseClient = new TseClient(deviceHost);

(async () => {
  const clientId = 'SWISSBIT';
  const processType = 'exampleProcess';

  try {
    // use this function to factory reset the TSE device
    // await tseClient.factoryReset();

    console.log('Initializing...');
    await tseClient.fastInit({
      credentialSeed: 'SwissbitSwissbit',
      adminPuk: '123456',
      adminPin: '12345',
      timeAdminPin: '12345',
      clientId,
    });

    console.log('\nStart transaction 1');
    const transactionData1 = await tseClient.startTransaction({
      clientId,
      transactionData: {
        randomNumber: Math.random(),
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
        randomNumber: Math.random(),
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
        randomNumber: Math.random(),
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

  } catch (e) {
    console.error(e);
  }
})()
