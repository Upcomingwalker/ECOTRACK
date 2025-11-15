// ===============================
// FLAT AI (Puter API Version)
// ===============================

const API_URL = "https://js.puter.com/api/ai/chat";

const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const loaderOverlay = document.getElementById("loaderOverlay");

// ------------------------------
// Offline fallback responses
// ------------------------------
const ecoResponses = {
    "hello": "Hello! I’m FLAT AI, your eco-friendly assistant 🌱 How can I help you today?",
    "plastic": "To reduce plastic waste:\n• Carry a metal bottle\n• Use cloth bags\n• Avoid single-use disposables\n• Recycle properly",
    "energy": "Energy saving tips:\n• Switch to LEDs\n• Unplug devices\n• Use solar if possible\n• Buy energy-efficient appliances",
    "water": "Save water by taking shorter showers, fixing leaks, and using efficient taps.",
    "default": "I'm here to help with sustainability, recycling, saving energy, reducing waste and more! 🌍"
};

// ------------------------------
// Message Rendering
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

// ------------------------------
// Loader
// ------------------------------
function showLoader() { loaderOverlay?.classList.add("active"); }
function hideLoader() { loaderOverlay?.classList.remove("active"); }

// ------------------------------
// Send Message
// ------------------------------
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    messageInput.value = "";
    sendButton.disabled = true;
    showLoader();

    try {
        // Check offline keywords
        const key = Object.keys(ecoResponses)
            .find(k => message.toLowerCase().includes(k));

        if (key) {
            hideLoader();
            addMessage(ecoResponses[key]);
            sendButton.disabled = false;
            return;
        }

        // ------------------------------
        // REAL AI REQUEST USING PUTER
        // ------------------------------
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content:
                            "You are FLAT AI, an eco-friendly assistant created by students Tanuj Sharma and Sparsh Jain from Lovely Public School. " +
                            "Always give helpful, sustainable and friendly replies."
                    },
                    { role: "user", content: message }
                ]
            })
        });

        if (!res.ok) throw new Error("API returned " + res.status);

        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content || "No response.";

        hideLoader();
        addMessage(reply);

    } catch (err) {
        hideLoader();
        addMessage("❌ Connection error. Using offline mode.", false, true);

        setTimeout(() => {
            addMessage(ecoResponses.default);
        }, 600);
    }

    sendButton.disabled = false;
}

// ------------------------------
// Events
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
