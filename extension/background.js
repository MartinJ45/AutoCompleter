chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "callAI") {
        fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: message.text }]
            })
        })
        .then(response => response.json())
        .then(data => sendResponse({ reply: data.choices[0].message.content }))
        .catch(error => sendResponse({ error }));
        return true;
    }
});
