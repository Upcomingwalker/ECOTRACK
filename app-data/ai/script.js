// ===============================
// FLAT AI (Google Gemini API)
// ===============================

const API_KEY = "AIzaSyBUrK-Be7y6wUwctZVf6Tul2amgvqJo20Q"; // Replace with your actual API key
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const loaderOverlay = document.getElementById("loaderOverlay");

// Chat history for multi-turn conversation
let chatHistory = [];

// ------------------------------
// Offline fallback messages
// ------------------------------
const fallback = {
    default: "I'm here to help with sustainability, recycling, saving energy, and eco-friendly living! 🌱",
    hello: "Hello! I'm FLAT AI, your eco-friendly assistant 🌱",
    energy: "Switch to LEDs, unplug devices, use solar, and choose efficient appliances.",
    plastic: "Use steel bottles, cloth bags, avoid disposables, recycle.",
    water: "Take shorter showers, fix leaks, use water-efficient taps."
};

// ------------------------------
// UI Message Renderer
// ------------------------------
function addMessage(content, isUser = false, isError = false) {
    const msg = document.createElement("div");
    msg.className = `message ${isUser ? "user" : "assistant"}`;
    
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = isUser ? "U" : "🌱";
    
    const box = document.createElement("div");
    box.className = `message-content ${isError ? "error-message" : ""}`;
    box.innerHTML = content.replace(/\n/g, "<br>");
    
    msg.append(avatar, box);
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showLoader() { loaderOverlay?.classList.add("active"); }
function hideLoader() { loaderOverlay?.classList.remove("active"); }

// ------------------------------
// Main Send Function
// ------------------------------
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    messageInput.value = "";
    sendButton.disabled = true;
    showLoader();
    
    try {
        // Build contents array with system instruction and conversation history
        const contents = [
            {
                role: "user",
                parts: [{ 
                    text: "You are FLAT AI, an eco-friendly assistant created by Tanuj Sharma and Sparsh Jain. Speak simply and helpfully. Always be sustainability-focused.\n\nUser: " + message 
                }]
            }
        ];
        
        // GOOGLE GEMINI API REQUEST
        const res = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`HTTP ${res.status}: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || fallback.default;
        
        hideLoader();
        addMessage(reply);
        
        // Update chat history
        chatHistory.push(
            { role: "user", parts: [{ text: message }] },
            { role: "model", parts: [{ text: reply }] }
        );
        
    } catch (err) {
        console.error("Error:", err);
        hideLoader();
        addMessage("❌ Connection error. Using offline mode.", false, true);
        
        // KEYWORD FALLBACK
        const key = Object.keys(fallback).find(k => 
            message.toLowerCase().includes(k)
        );
        addMessage(fallback[key] || fallback.default);
    }
    
    sendButton.disabled = false;
}

// ------------------------------
// Input Handlers
// ------------------------------
sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

messageInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 150) + "px";
});
