// Chatbot Logic

document.addEventListener("DOMContentLoaded", () => {
    // Inject Chat UI if not present (optional, but good for portability)
    // For now, we assume elements exist as per plan, or we can check and create them.
    // Let's assume they are added to index.html as part of the plan.

    const chatToggleBtn = document.getElementById("chat-toggle-btn");
    const chatContainer = document.getElementById("chat-container");
    const chatCloseBtn = document.getElementById("chat-close-btn");
    const chatInput = document.getElementById("chat-input");
    const chatSendBtn = document.getElementById("chat-send-btn");
    const chatMessages = document.getElementById("chat-messages");

    if (!chatToggleBtn || !chatContainer) return;

    // State
    let isOpen = false;
    let isLoading = false;

    // Toggle Chat
    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) {
            chatContainer.classList.remove("hidden", "translate-y-10", "opacity-0");
            chatContainer.classList.add("translate-y-0", "opacity-100");
            chatInput.focus();
        } else {
            chatContainer.classList.add("translate-y-10", "opacity-0");
            setTimeout(() => chatContainer.classList.add("hidden"), 300); // Wait for transition
        }
    }

    chatToggleBtn.addEventListener("click", toggleChat);
    if (chatCloseBtn) chatCloseBtn.addEventListener("click", toggleChat);

    // Send Message
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || isLoading) return;

        // User Message UI
        appendMessage("user", message);
        chatInput.value = "";

        // Loading State
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: message,
                    // context: [] // Future: can pass chat history here
                })
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            const aiText = data.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't understand that.";

            // AI Message UI
            appendMessage("ai", aiText);

        } catch (error) {
            console.error("Chat error:", error);
            appendMessage("ai", "Sorry, I'm having trouble connecting to the server. Please try again later.", true);
        } finally {
            setIsLoading(false);
        }
    }

    chatSendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Helper: Append Message
    function appendMessage(sender, text, isError = false) {
        const div = document.createElement("div");
        div.className = `flex ${sender === "user" ? "justify-end" : "justify-start"} mb-4 animate-in fade-in slide-in-from-bottom-2`;

        const bubble = document.createElement("div");
        bubble.className = `max-w-[80%] rounded-2xl px-4 py-2 text-sm ${sender === "user"
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-muted text-foreground rounded-bl-none"
            } ${isError ? "bg-destructive text-destructive-foreground" : ""}`;

        // Simple Markdown parsing for AI response (bold, italics, newlines)
        if (sender === "ai") {
            bubble.innerHTML = parseSimpleMarkdown(text);
        } else {
            bubble.textContent = text;
        }

        div.appendChild(bubble);
        chatMessages.appendChild(div);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Helper: Loading State
    function setIsLoading(loading) {
        isLoading = loading;
        chatSendBtn.disabled = loading;

        if (loading) {
            const id = "loading-indicator";
            const div = document.createElement("div");
            div.id = id;
            div.className = "flex justify-start mb-4";
            div.innerHTML = `
                <div class="bg-muted rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                    <div class="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
            `;
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            const indicator = document.getElementById("loading-indicator");
            if (indicator) indicator.remove();
        }
    }

    // Helper: Simple Markdown Parser
    function parseSimpleMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
});
