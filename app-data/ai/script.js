// ===============================
// FLAT AI (Google Gemini API)
// ===============================
const API_KEY = "AIzaSyBUrK-Be7y6wUwctZVf8Tul2amgvqJo20Q";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const loaderOverlay = document.getElementById("loaderOverlay");

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
        // GOOGLE GEMINI REQUEST
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `You are FLAT AI, an eco-friendly assistant created by Tanuj Sharma and Sparsh Jain. Speak simply and helpfully. Always be sustainability-focused.\n\nUser: ${message}`
                            }
                        ]
                    }
                ]
            })
        });
        
        if (!res.ok) throw new Error("HTTP " + res.status);
        
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || fallback.default;
        
        hideLoader();
        addMessage(reply);
        
    } catch (err) {
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

messageInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 150) + "px";
});
