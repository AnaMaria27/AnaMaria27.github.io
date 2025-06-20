const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const CREDENTIALS = require('./chatbotsaude-losy-4713c1439f10.json');
const PROJECT_ID = CREDENTIALS.project_id;

const knowledgeBaseId = 'MTc2NTU2MjY0OTA5NDkxNDA0ODE';


const sessionClient = new dialogflow.SessionsClient({
    credentials: {
        private_key: CREDENTIALS.private_key,
        client_email: CREDENTIALS.client_email
    }
});

const knowledgeClient = new dialogflow.KnowledgeBasesClient({
    credentials: {
        private_key: CREDENTIALS.private_key,
        client_email: CREDENTIALS.client_email
    }
});


async function verificarConexaoKnowledge() {
    try {
        const parent = `projects/${PROJECT_ID}`;
        const [knowledgeBases] = await knowledgeClient.listKnowledgeBases({parent});

        const kbEncontrada = knowledgeBases.find(kb => kb.name.includes(knowledgeBaseId));

        if (kbEncontrada) {
            console.log(`✅ Conectado com sucesso à Knowledge Base: ${kbEncontrada.displayName}`);
        } else {
            console.warn(`⚠️ Atenção: Knowledge Base com ID ${knowledgeBaseId} não encontrada!`);
        }
    } catch (error) {
        console.error('❌ Erro ao verificar conexão com a Knowledge Base:', error);
    }
}


app.post('/chat', async (req, res) => {
    const { message, sessionId } = req.body;

    console.log(`🟦 Mensagem recebida: "${message}" - SessionID: ${sessionId || 'Gerando novo'}`);

    const session = sessionClient.projectAgentSessionPath(
        PROJECT_ID,
        sessionId || uuid.v4()
    );

    const request = {
        session: session,
        queryInput: {
            text: {
                text: message,
                languageCode: 'en'
            }
        },
        queryParams: {
            knowledgeBaseNames: [
                `projects/${PROJECT_ID}/knowledgeBases/${knowledgeBaseId}`
            ]
        }
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        console.log('🟩 Resposta recebida do Dialogflow');

        let responseText = result.fulfillmentText;

        if (result.knowledgeAnswers && result.knowledgeAnswers.answers.length > 0) {
            const bestAnswer = result.knowledgeAnswers.answers
                .sort((a, b) => b.matchConfidence - a.matchConfidence)[0];

            console.log(`🧠 🔍 Resposta da Knowledge Base (Confiança ${bestAnswer.matchConfidence}): ${bestAnswer.answer}`);

            responseText = bestAnswer.answer;
        } else {
            console.log('⚠️ Nenhuma resposta da Knowledge Base. Usando resposta da Intent.');
        }

        res.json({ reply: responseText });

    } catch (error) {
        console.error('❌ Erro ao consultar o Dialogflow:', error);
        res.status(500).send({
            message: 'Erro ao processar sua mensagem',
            error: error.message
        });
    }
});


app.listen(5000, async () => {
    console.log('🚀 Servidor rodando em http://localhost:5000');
    await verificarConexaoKnowledge();
});
