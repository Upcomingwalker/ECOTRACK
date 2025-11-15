const API_KEY = "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";
const PROXY = "https://corsproxy.io/?";
const ENDPOINT = "https://api.openai.com/v1/chat/completions";

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    messageInput.value = "";
    sendButton.disabled = true;
    showLoader();

    try {
        const res = await fetch(PROXY + ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an eco-friendly assistant."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        if (!res.ok) throw new Error("HTTP " + res.status);

        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content || "No response.";
        hideLoader();
        addMessage(reply);

    } catch (err) {
        hideLoader();
        addMessage("❌ Connection error.", false, true);
    }

    sendButton.disabled = false;
}
