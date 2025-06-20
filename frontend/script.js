const chatBox = document.getElementById('chat-box');
const input = document.getElementById('user-input');

async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    appendMessage('user', message);
    input.value = '';

    try {
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                sessionId: '123456'
            })
        });

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            appendMessage('bot', `Erro: ${data.error || data}`);
        } else {
            appendMessage('bot', data.reply);
        }
    } catch (error) {
        appendMessage('bot', 'Erro ao conectar com o servidor.');
        console.error(error);
    }
}

function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    const textDiv = document.createElement('div');
    textDiv.classList.add('text');
    textDiv.innerText = text;

    messageDiv.appendChild(textDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}