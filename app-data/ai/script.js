// ===============================
// FLAT AI - MULTI-METHOD GEMINI INTEGRATION
// All CORS fixes combined with automatic fallback
// ===============================

const API_KEY = "AIzaSyBUrK-Be7y6wUwctZVf6Tul2amgvqJo20Q"; // REPLACE WITH YOUR KEY

// Multiple CORS proxy options for maximum reliability
const CORS_PROXIES = [
    "https://corsproxy.io/?",
    "https://api.allorigins.win/raw?url=",
    "https://cors-anywhere.herokuapp.com/"
];

const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const loaderOverlay = document.getElementById("loaderOverlay");

let currentProxyIndex = 0;
let geminiSDK = null;
let chatSession = null;

// ------------------------------
// Offline fallback messages
// ------------------------------
const fallback = {
    default: "I'm here to help with sustainability, recycling, saving energy, and eco-friendly living! 🌱",
    hello: "Hello! I'm FLAT AI, your eco-friendly assistant 🌱",
    energy: "Switch to LEDs, unplug devices, use solar, and choose efficient appliances.",
    plastic: "Use steel bottles, cloth bags, avoid disposables, recycle.",
    water: "Take shorter showers, fix leaks, use water-efficient taps.",
    recycle: "Sort waste properly: paper, plastic, glass, metal. Check local guidelines.",
    transport: "Use public transport, bike, walk, or carpool. Consider electric vehicles.",
    food: "Buy local, reduce meat consumption, compost food waste, avoid single-use packaging.",
    plant: "🌱 How to Plant a Seed (Step-by-Step):\n\n1. Choose Your Container: Use seedling trays or small pots with drainage holes at the bottom.\n\n2. Fill with Soil: Use quality germination mix or potting soil. Fill containers almost to the top (leave 1/2 inch space).\n\n3. Make Holes: Use a pencil to create small holes. Plant seeds 3-4 times deeper than the seed's diameter (tiny seeds need just a light covering, larger seeds go deeper).\n\n4. Place Seeds: Drop 1-2 seeds per hole. For small seeds like lettuce, sprinkle lightly on top.\n\n5. Cover with Soil: Gently cover seeds with a thin layer of soil. Don't compact it!\n\n6. Water Gently: Mist spray until soil is thoroughly moist but not waterlogged. Water should drain from bottom holes.\n\n7. Location: Place in a spot with plenty of natural light but avoid harsh direct sunlight initially.\n\n8. Keep Moist: Mist daily or when soil surface dries. Cover tray with plastic dome if available to maintain humidity.\n\n9. Wait for Germination: Most seeds sprout in 5-14 days. Be patient!\n\n10. Transplant: When seedlings have 2-3 true leaves, move to bigger pots or garden bed.\n\nPro Tips:\n• Soak large seeds (beans, peas) overnight before planting\n• Label your plants with name and date\n• Morning watering is best\n• Add compost for nutrient-rich soil\n• Give each plant space to grow - don't overcrowd!\n\nHappy planting! 🌿"
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

function showLoader() { 
    loaderOverlay?.classList.add("active"); 
}

function hideLoader() { 
    loaderOverlay?.classList.remove("active"); 
}

// ------------------------------
// METHOD 1: Try Gemini SDK (Best Option)
// ------------------------------
async function initGeminiSDK() {
    try {
        // Check if SDK is available
        if (typeof window.GoogleGenerativeAI !== 'undefined') {
            geminiSDK = new GoogleGenerativeAI(API_KEY);
            const model = geminiSDK.getGenerativeModel({ model: "gemini-pro" });
            
            chatSession = model.startChat({
                history: [],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            });
            
            console.log("✅ Gemini SDK initialized successfully");
            return true;
        }
        return false;
    } catch (err) {
        console.warn("SDK initialization failed:", err);
        return false;
    }
}

async function sendWithSDK(message) {
    if (!chatSession) {
        throw new Error("SDK not initialized");
    }
    
    const systemPrompt = "You are FLAT AI, an eco-friendly assistant created by Tanuj Sharma and Sparsh Jain. Speak simply and helpfully. Always be sustainability-focused.\n\n";
    const result = await chatSession.sendMessage(systemPrompt + message);
    const response = await result.response;
    return response.text();
}

// ------------------------------
// METHOD 2: Direct API with CORS Proxy Fallback
// ------------------------------
async function sendWithProxy(message, proxyIndex = 0) {
    if (proxyIndex >= CORS_PROXIES.length) {
        throw new Error("All proxies failed");
    }
    
    const proxy = CORS_PROXIES[proxyIndex];
    const fullUrl = `${GEMINI_API_ENDPOINT}?key=${API_KEY}`;
    const proxiedUrl = proxy + encodeURIComponent(fullUrl);
    
    const systemContext = "You are FLAT AI, an eco-friendly assistant created by Tanuj Sharma and Sparsh Jain. Speak simply and helpfully. Always be sustainability-focused.\n\n";
    
    const requestBody = {
        contents: [{
            role: "user",
            parts: [{ text: systemContext + message }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
        }
    };
    
    try {
        const res = await fetch(proxiedUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!reply) {
            throw new Error("Invalid response format");
        }
        
        currentProxyIndex = proxyIndex; // Remember working proxy
        return reply;
        
    } catch (err) {
        console.warn(`Proxy ${proxyIndex} failed:`, err.message);
        // Try next proxy
        return sendWithProxy(message, proxyIndex + 1);
    }
}

// ------------------------------
// METHOD 3: Fallback to Smart Offline Responses
// ------------------------------
function getSmartFallback(message) {
    const lowerMsg = message.toLowerCase();
    
    // Check for planting-related keywords
    if (lowerMsg.match(/plant|seed|grow|garden|sow|germinate|seedling/i)) {
        return fallback.plant;
    }
    
    // Find best matching keyword
    const matchedKey = Object.keys(fallback).find(key => 
        lowerMsg.includes(key)
    );
    
    if (matchedKey) {
        return fallback[matchedKey];
    }
    
    // Advanced keyword matching
    if (lowerMsg.match(/save|conserve|reduce/i)) {
        return "Great thinking! Small changes make a big difference. Try reducing single-use items, conserving water and energy, and choosing sustainable products. 🌍";
    }
    
    if (lowerMsg.match(/climate|warming|carbon/i)) {
        return "Climate action starts at home! Reduce your carbon footprint by using renewable energy, minimizing waste, choosing sustainable transport, and supporting eco-friendly businesses. 🌡️";
    }
    
    if (lowerMsg.match(/compost|organic|waste/i)) {
        return "Composting is amazing for the environment! Start with fruit/vegetable scraps, coffee grounds, eggshells, and yard waste. Avoid meat, dairy, and oils. Layer green (nitrogen) and brown (carbon) materials, keep moist, and turn regularly. 🌾";
    }
    
    if (lowerMsg.match(/how|what|why|when|where/i)) {
        return "I'm here to help! Ask me about recycling, energy saving, sustainable living, eco-friendly products, gardening, planting, or any green lifestyle tips. 🌿";
    }
    
    return fallback.default;
}

// ------------------------------
// MAIN SEND FUNCTION (Tries All Methods)
// ------------------------------
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    messageInput.value = "";
    sendButton.disabled = true;
    showLoader();
    
    let reply = null;
    let method = "unknown";
    
    try {
        // TRY METHOD 1: Gemini SDK
        try {
            if (!chatSession) {
                await initGeminiSDK();
            }
            
            if (chatSession) {
                reply = await sendWithSDK(message);
                method = "SDK";
            }
        } catch (sdkError) {
            console.warn("SDK method failed:", sdkError.message);
        }
        
        // TRY METHOD 2: CORS Proxy (if SDK failed)
        if (!reply) {
            try {
                reply = await sendWithProxy(message, currentProxyIndex);
                method = `Proxy ${currentProxyIndex}`;
            } catch (proxyError) {
                console.warn("All proxy methods failed:", proxyError.message);
            }
        }
        
        // METHOD 3: Smart Fallback (if all else fails)
        if (!reply) {
            reply = getSmartFallback(message);
            method = "Smart Fallback";
            console.log("Using smart offline mode");
        }
        
        hideLoader();
        addMessage(reply);
        console.log(`✅ Response generated using: ${method}`);
        
    } catch (err) {
        console.error("Critical error:", err);
        hideLoader();
        
        // Ultimate fallback
        const fallbackReply = getSmartFallback(message);
        addMessage(fallbackReply);
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

// ------------------------------
// Auto-initialize on load
// ------------------------------
window.addEventListener("load", async () => {
    console.log("🌱 FLAT AI initialized");
    
    // Try to initialize SDK in background
    const sdkReady = await initGeminiSDK();
    
    if (sdkReady) {
        console.log("✅ Using Gemini SDK (best performance)");
    } else {
        console.log("⚠️ SDK unavailable, will use proxy method");
    }
    
    // Show welcome message
    addMessage("Hello! I'm FLAT AI, your eco-friendly assistant. Ask me anything about sustainability, recycling, energy saving, planting, or green living! 🌱");
});

// ------------------------------
// Expose for debugging
// ------------------------------
window.FLAT_DEBUG = {
    getCurrentMethod: () => {
        if (chatSession) return "SDK";
        return `Proxy ${currentProxyIndex}`;
    },
    testSDK: () => initGeminiSDK(),
    testProxy: (index = 0) => sendWithProxy("test", index),
    switchProxy: (index) => { currentProxyIndex = index; },
    showPlantGuide: () => addMessage(fallback.plant)
};
