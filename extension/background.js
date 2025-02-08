chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed!");
});

// Function to interact with your Python Flask API (test.py server)
async function fetchAIResponse(inputText) {
    try {
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: inputText
            })
        });

        const data = await response.json();
        return data.reply;  // The response from OpenAI will be here
    } catch (error) {
        console.error("Error calling AI API:", error);
        return "Error occurred while contacting the AI.";
    }
}

// Listen for extension icon clicks or messages from content script
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: enhanceText
    });
});

async function enhanceText() {
    const selection = window.getSelection().toString().trim();
    if (!selection) {
        alert("Please select some text in Google Docs.");
        return;
    }

    const aiReply = await fetchAIResponse(selection);

    // Replace selected text with AI response
    document.execCommand('insertText', false, aiReply);
}
