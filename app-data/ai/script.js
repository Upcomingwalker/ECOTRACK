const API_KEY = 'AIzaSyBUrK-Be7y6wUwctZVf6Tul2amgvqJo20Q'; 
const USE_DEMO_MODE = false;

const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const loaderOverlay = document.getElementById('loaderOverlay');

const ecoResponses = {
    'hello': 'Hello! I\'m FLAT AI, your eco-friendly assistant. How can I help you live more sustainably today? 🌱',
    'sustainability': 'Here are some great sustainability tips:\n\n🌱 Reduce single-use plastics\n♻️ Recycle properly\n🚲 Use eco-friendly transport\n💡 Use LED bulbs\n🌿 Grow your own herbs\n💧 Save water\n\nWhat topic do you want help with?',
    'plastic': 'To reduce plastic waste:\n\n• Use reusable bags\n• Carry a metal bottle\n• Avoid single-use items\n• Pick products with less packaging\n• Recycle correctly\n\nSmall steps, big impact! 🌍',
    'energy': 'Ways to save energy:\n\n💡 Use LED bulbs\n🔌 Unplug idle devices\n🪟 Improve insulation\n☀️ Go solar\n⚡ Buy efficient appliances\n\nWant tips for your home?',
    'transport': 'Eco-friendly transport:\n\n🚲 Cycle\n🚶‍♀️ Walk\n🚌 Public transport\n🚗 Carpool\n⚡ Use EVs\n\nWhat’s your goal?',
    'water': 'Save water by:\n\n🚿 Shorter showers\n🔧 Fixing leaks\n🌧️ Collecting rainwater\n👕 Wash clothes in cold water\n🍽️ Run full dishwasher loads',
    'recycling': 'Recycling guide:\n\n♻️ Clean containers\n🔋 Dispose batteries safely\n📱 Recycle electronics at centers\n📰 Paper and cardboard recycle well\n🥫 Aluminum is highly recyclable',
    'default': 'I can help with sustainability, recycling, energy saving, transportation, water conservation and more! 🌍'
};

const developmentResponses = {
    'creator': '🎓 I was created by talented students from Lovely Public School:\n\n👨‍💻 **Tanuj Sharma**\n👨‍💻 **Sparsh Jain**\n\nI help people live sustainably! 🌱✨'
};

function isDevelopmentQuestion(message) {
    const text = message.toLowerCase();
    return [
        'who made you', 'creator', 'developer', 'your team',
        'who created you', 'who built you', 'made by', 'developed by'
    ].some(k => text.includes(k));
}

messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendButton.addEventListener('click', sendMessage);

function addMessage(content, isUser = false, isError = false) {
    const msg = document.createElement('div');
    msg.className = `message ${isUser ? 'user' : 'assistant'}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? 'U' : '🌱';

    const box = document.createElement('div');
    box.className = `message-content ${isError ? 'error-message' : ''}`;
    box.innerHTML = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    msg.append(avatar, box);
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showLoader() { loaderOverlay?.classList.add('active'); }
function hideLoader() { loaderOverlay?.classList.remove('active'); }

function getDemoResponse(message) {
    if (isDevelopmentQuestion(message)) return developmentResponses.creator;
    const key = Object.keys(ecoResponses).find(k => message.toLowerCase().includes(k));
    return ecoResponses[key] || ecoResponses.default;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    messageInput.value = '';
    sendButton.disabled = true;
    showLoader();

    try {
        let response;

        if (USE_DEMO_MODE) {
            await new Promise(r => setTimeout(r, 1000));
            response = getDemoResponse(message);
        } else {

            // THE FIX IS HERE ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
            const apiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are FLAT AI, an eco-friendly sustainability assistant. Respond to: ${message}`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 500
                        }
                    })
                }
            );
            // ↑↑↑ FIXED URL — no "-latest"

            if (!apiResponse.ok) throw new Error(`API request failed: ${apiResponse.status}`);

            const data = await apiResponse.json();
            response = data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply.";
        }

        hideLoader();
        addMessage(response);

    } catch (err) {
        hideLoader();
        addMessage(`❌ Connection error: ${err.message}. Switching to demo mode.`, false, true);

        setTimeout(() => addMessage(getDemoResponse(message)), 800);
    }

    sendButton.disabled = false;
}
