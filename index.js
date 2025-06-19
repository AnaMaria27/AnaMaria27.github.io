const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

async function runSample(projectId = 'SEU_PROJECT_ID') {
  const sessionId = uuid.v4();
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: './sua-chave.json',
  });

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: 'Olá',
        languageCode: 'pt-BR',
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  console.log('Resposta do bot:', responses[0].queryResult.fulfillmentText);
}

runSample();
