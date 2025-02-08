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

// Initialize the OAuth2 flow and get the access token
function authenticate() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            if (chrome.runtime.lastError || !token) {
                console.log("Unsuccessful authentication:", chrome.runtime.lastError);
                reject('Authentication failed');
            } else {
                resolve(token);  // token is your access token for Google APIs
            }
        });
    });
}

// Insert text into Google Docs using Google Docs API
function insertTextIntoDoc(documentId, index, text, token) {
    const requests = [{
        insertText: {
            location: { index: index },
            text: text,
        },
    }];

    const batchUpdateRequest = { requests: requests };

    fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchUpdateRequest),
    })
    .then(response => response.json())
    .then(data => console.log('Text inserted:', data))
    .catch(error => console.error('Error inserting text:', error));
}


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
                    {"role": "system", "content": "You are a helpful assistant who suggests autocompleted sentences"},
                    {"role": "user", "content": "Finish the sentence: " + selection}
                ]
            })
        })
        
        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Error fetching OpenAI response:", error);
        return null;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Recieved message: ", message);

    if (message.selection !== undefined) {
        const wordCount = message.selection.trim().split(/\s+/).length;
        console.log("Word count:", wordCount);

        if (wordCount > 4) {
            getResponse(message.selection).then(response => {
                const openaiResponse = response.choices[0].message.content;
                console.log("Response:", openaiResponse);

                insertIntoDoc(openaiResponse);

                // chrome.tabs.sendMessage({response: openaiResponse});
            }).catch(error => {
                console.error("Error:", error);
                sendResponse({error: "Error"});
            });
        } else {
            console.log("Word count is less than 4");
        }

        return true;
    }
});

function insertIntoDoc(message) {
    authenticate().then(token => {
        const documentId = "1-TCq-ZNtM67KRGP7f0FQrUa2-s87FmYrvC1wNXYi_qo";
        insertTextIntoDoc(documentId, 1, message, token);
    }).catch(error => {
        console.error('Error authenticating:', error);
    });
}



