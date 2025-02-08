// chrome.runtime.onInstalled.addListener(() => {
//     console.log("Extension installed!");
// });

// // Function to interact with your Python Flask API (test.py server)
// async function fetchAIResponse(inputText) {
//     try {
//         const response = await fetch('http://localhost:5000/chat', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 message: inputText
//             })
//         });

//         const data = await response.json();
//         return data.reply;  // The response from OpenAI will be here
//     } catch (error) {
//         console.error("Error calling AI API:", error);
//         return "Error occurred while contacting the AI.";
//     }
// }

// // Listen for extension icon clicks or messages from content script
// chrome.action.onClicked.addListener((tab) => {
//     chrome.scripting.executeScript({
//         target: {tabId: tab.id},
//         func: enhanceText
//     });
// });

// async function enhanceText() {
//     const selection = window.getSelection().toString().trim();
//     if (!selection) {
//         alert("Please select some text in Google Docs.");
//         return;
//     }

//     const aiReply = await fetchAIResponse(selection);

//     // Replace selected text with AI response
//     document.execCommand('insertText', false, aiReply);
// }

// import OpenAI from "https://cdn.jsdelivr.net/npm/openai@4.14.0";

// const openai  = new OpenAI({
//     apiKey: "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"
// });

const apiKey = "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"

console.log("Backend loaded");

async function getResponse(selection) {
    console.log("Selected text:", selection);

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Echo " + selection}
                ]
            })
        })
    
        let data = await response.json();
    
        return data;
    } catch (error) {
        console.error("Error fetching OpenAI response:", error);
        return null;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Recieved message: ", message);
    if (message.selection !== undefined) {
        let response = getResponse(message.selection);
        console.log(response);
    }
});


