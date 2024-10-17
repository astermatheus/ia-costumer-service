let responses;

fetch('responses.json')
    .then(response => response.json())
    .then(data => {
        responses = data;
    })
    .catch(error => console.error('Error loading responses:', error));

// Carrega o histórico do chat do armazenamento local
const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

function loadChatHistory() {
    const chatMessages = document.getElementById('chatMessages');
    chatHistory.forEach(message => {
        addMessage(message.sender, message.text, false);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');

    if (userInput.value.trim() === '') return;

    addMessage('user', userInput.value);
    saveChatHistory('user', userInput.value);
    
    const botResponse = processInput(userInput.value);

    const typingTime = botResponse.length * 30;
    addTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();
        addMessage('bot', botResponse);
        saveChatHistory('bot', botResponse);
    }, typingTime);

    userInput.value = '';
}

function addMessage(sender, message, animate = true) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    if (animate) {
        messageElement.style.animation = 'none';
        messageElement.offsetHeight; // Trigger reflow
        messageElement.style.animation = null;
    }
    
    const icon = document.createElement('i');
    icon.classList.add('fas', sender === 'user' ? 'fa-user' : 'fa-robot');
    
    const textElement = document.createElement('p');
    textElement.textContent = message;

    messageElement.appendChild(icon);
    messageElement.appendChild(textElement);
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveChatHistory(sender, message) {
    chatHistory.push({ sender, text: message });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typingIndicator';
    typingIndicator.classList.add('message', 'bot-message');
    typingIndicator.innerHTML = '<i class="fas fa-robot"></i><p>Digitando...</p>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function processInput(input) {
    const doc = nlp(input.toLowerCase());
    
    for (const category in responses) {
        for (const keyword of responses[category].keywords) {
            if (doc.has(keyword)) {
                return responses[category].response;
            }
        }
    }

    return "Desculpe, não entendi sua pergunta. Pode reformular ou fornecer mais detalhes?";
}

document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Implementação do tema escuro
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

function toggleTheme() {
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('darkTheme', isDark);
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

themeToggle.addEventListener('click', toggleTheme);

// Verifica o tema salvo
if (localStorage.getItem('darkTheme') === 'true') {
    body.classList.add('dark-theme');
    icon.className = 'fas fa-sun';
}

// Carrega o histórico do chat quando a página é carregada
window.onload = () => {
    loadChatHistory();
    document.getElementById('userInput').focus();
};