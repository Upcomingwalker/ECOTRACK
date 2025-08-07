const API_KEY = 'AIzaSyDuu4VTElp41a41v0ri6auuk9LurwntnKg'; 
const USE_DEMO_MODE = false;

const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const loaderOverlay = document.getElementById('loaderOverlay'); // Ensure this correctly references the loader overlay

const ecoResponses = {
    'hello': 'Hello! I\'m FLAT AI, your eco-friendly assistant. How can I help you live more sustainably today? 🌱',
    'sustainability': 'Here are some great sustainability tips:\n\n🌱 Reduce single-use plastics\n♻️ Recycle properly\n🚲 Use eco-friendly transportation\n💡 Switch to LED bulbs\n🌿 Grow your own herbs\n💧 Conserve water\n\nWhat area would you like to focus on?',
    'plastic': 'To reduce plastic waste:\n\n• Use reusable bags for shopping\n• Carry a refillable water bottle\n• Choose products with minimal packaging\n• Use glass or metal containers for storage\n• Avoid single-use utensils\n• Support brands with eco-friendly packaging\n\nEvery small change makes a difference! 🌍',
    'energy': 'Here are ways to save energy at home:\n\n💡 Switch to LED bulbs\n🌡️ Use a programmable thermostat\n🔌 Unplug devices when not in use\n🪟 Improve home insulation\n☀️ Consider solar panels\n⚡ Use energy-efficient appliances\n\nWould you like specific tips for any area?',
    'transport': 'Eco-friendly transportation options:\n\n🚲 Cycling for short distances\n🚶‍♀️ Walking when possible\n🚌 Using public transportation\n🚗 Carpooling or ride-sharing\n⚡ Electric or hybrid vehicles\n🏠 Working from home when possible\n\nWhat\'s your main mode of transport?',
    'water': 'Water conservation tips:\n\n🚿 Take shorter showers\n🚰 Fix leaks promptly\n🌧️ Collect rainwater for plants\n🌱 Use drought-resistant plants\n🍽️ Only run full dishwasher loads\n👕 Wash clothes in cold water\n\nSmall changes can save thousands of gallons per year!',
    'recycling': 'Proper recycling guidelines:\n\n♻️ Clean containers before recycling\n📱 Take electronics to special centers\n🔋 Dispose of batteries properly\n📰 Recycle paper and cardboard\n🫙 Glass can be recycled indefinitely\n🥫 Aluminum cans are highly recyclable\n\nCheck your local recycling guidelines for specifics!',
    'default': 'I\'m here to help you live more sustainably! I can provide tips on:\n\n🌱 Reducing waste\n♻️ Recycling properly\n💚 Energy conservation\n🌍 Eco-friendly living\n🚲 Sustainable transportation\n💧 Water conservation\n\nWhat eco-topic interests you most?'
};

const developmentResponses = {
    'creator': '🎓 I was created by talented students from Lovely Public School:\n\n👨‍💻 **Tanuj Sharma**\n👨‍💻 **Sparsh Jain**\n\nThey developed me as an eco-friendly AI assistant to help people live more sustainably! 🌱✨',
    'made': '🎓 I was created by talented students from Lovely Public School:\n\n👨‍💻 **Tanuj Sharma**\n👨‍💻 **Sparsh Jain**\n\nThey developed me as an eco-friendly AI assistant to help people live more sustainably! 🌱✨',
    'developer': '🎓 I was created by talented students from Lovely Public School:\n\n👨‍💻 **Tanuj Sharma**\n👨‍💻 **Sparsh Jain**\n\nThey developed me as an eco-friendly AI assistant to help people live more sustainably! 🌱✨',
    'author': '🎓 I was created by talented students from Lovely Public School:\n\n👨‍💻 **Tanuj Sharma**\n👨‍💻 **Sparsh Jain**\n\nThey developed me as an eco-friendly AI assistant to help people live more sustainably! 🌱✨'
};

function isDevelopmentQuestion(message) {
    const lowerMessage = message.toLowerCase();
    const developmentKeywords = [
        'who made you', 'who created you', 'who developed you',
        'who built you', 'who designed you', 'your creator',
        'your developer', 'your maker', 'your author',
        'made by', 'created by', 'developed by', 'built by',
        'who are your creators', 'who are your developers',
        'development team', 'your team', 'behind you'
    ];
    
    return developmentKeywords.some(keyword => lowerMessage.includes(keyword));
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
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (isUser) {
        avatar.textContent = 'U';
    } else {
        avatar.textContent = '🌱';
    }

    const messageContent = document.createElement('div');
    messageContent.className = `message-content ${isError ? 'error-message' : ''}`;
    
    if (content.includes('**')) {
        messageContent.innerHTML = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    } else {
        messageContent.textContent = content;
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showLoader() {
    if (loaderOverlay) { // Check if loaderOverlay exists before adding class
        loaderOverlay.classList.add('active');
    }
}

function hideLoader() {
    if (loaderOverlay) { // Check if loaderOverlay exists before removing class
        loaderOverlay.classList.remove('active');
    }
}

function getDemoResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (isDevelopmentQuestion(message)) {
        return developmentResponses.creator;
    }
    
    for (const key in ecoResponses) {
        if (lowerMessage.includes(key)) {
            return ecoResponses[key];
        }
    }
    
    return ecoResponses.default;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    sendButton.disabled = true;

    addMessage(message, true);

    if (isDevelopmentQuestion(message)) {
        showLoader();
        await new Promise(resolve => setTimeout(resolve, 800));
        hideLoader();
        addMessage(developmentResponses.creator);
        sendButton.disabled = false;
        return;
    }

    showLoader();

    try {
        let response;
        
        if (USE_DEMO_MODE) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            response = getDemoResponse(message);
        } else {
            const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are FLAT AI, an eco-friendly assistant focused on sustainability and environmental consciousness. You were created by students Tanuj Sharma and Sparsh Jain from Lovely Public School. If asked about your creators or development, mention them proudly. Keep responses concise but helpful. Please respond to: ${message}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json().catch(() => ({}));
                console.error('API Error:', errorData);
                throw new Error(`API request failed: ${apiResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await apiResponse.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response structure from API');
            }
            
            response = data.candidates[0].content.parts[0].text;
        }

        hideLoader();
        addMessage(response);

    } catch (error) {
        console.error('Error details:', error);
        hideLoader();
        
        if (error.message.includes('API_KEY_INVALID')) {
            addMessage('❌ API key is invalid. Please check your Google AI Studio API key and make sure it\'s enabled for the Gemini API.', false, true);
        } else if (error.message.includes('403')) {
            addMessage('❌ Access denied. Please make sure your API key has the correct permissions and billing is enabled.', false, true);
        } else if (error.message.includes('quota')) {
            addMessage('❌ API quota exceeded. Please check your usage limits in Google AI Studio.', false, true);
        } else {
            addMessage(`❌ Connection error: ${error.message}. Switching to demo mode for now.`, false, true);
            setTimeout(() => {
                const demoResponse = getDemoResponse(message);
                addMessage(demoResponse);
            }, 1000);
        }
    } finally {
        sendButton.disabled = false;
    }
}

let isFirstMessage = true;
const originalAddMessage = addMessage;
addMessage = function(content, isUser = false, isError = false) {
    if (isFirstMessage && isUser) {
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        isFirstMessage = false;
    }
    return originalAddMessage(content, isUser, isError);
};
