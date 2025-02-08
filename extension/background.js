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

// Function to get document content using Google Docs API
function getDocumentContent(documentId, token, message) {
    const url = `https://docs.googleapis.com/v1/documents/${documentId}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Document content:', data);

        // Extract text content from the document
        const documentContent = extractTextFromDoc(data);
        console.log('Extracted text:', documentContent);

        const {startIndex, endIndex} = findTextIndicesInDoc(documentContent, message);

        console.log("start index:", startIndex, " End index:", endIndex);

        return {startIndex, endIndex};
    })
    .catch(error => {
        console.error('Error getting document content:', error);
        return null;
    });
}

// Function to extract plain text from Google Docs document structure
function extractTextFromDoc(document) {
    let text = '';
    document.body.content.forEach(element => {
        if (element.paragraph) {
            element.paragraph.elements.forEach(paraElement => {
                if (paraElement.textRun) {
                    text += paraElement.textRun.content;
                }
            });
        }
    });
    return text;
}

function findTextIndicesInDoc(documentContent, searchString) {
    // Log both strings to check what we're searching for
    console.log("Document Content:", documentContent);
    console.log("Search String:", searchString);

    if (typeof documentContent !== 'string' || typeof searchString !== 'string') {
        console.error("Both documentContent and searchString must be strings.");
        return null;  // Or handle error as necessary
    }

    // Remove leading/trailing spaces and make both the document content and search string lowercase to handle case-insensitive search
    const normalizedDocumentContent = documentContent.trim().toLowerCase();
    const normalizedSearchString = searchString.trim().toLowerCase();

    // Find the start index of the search string within the normalized document content
    const startIndex = normalizedDocumentContent.indexOf(normalizedSearchString);

    // If the string is not found, return null or handle the case as needed
    if (startIndex === -1) {
        console.log("Text not found.");
        return null;  // or handle the case where text is not found
    }

    // Calculate the end index based on the start index and the length of the search string
    const endIndex = startIndex + normalizedSearchString.length;

    console.log("start:", startIndex);
    console.log("end:", endIndex);

    return { startIndex, endIndex };
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

function deleteTextFromDoc(documentId, startIndex, endIndex, token) {
    const requests = [{
        deleteContentRange: {
            range: {
                startIndex: startIndex,
                endIndex: endIndex
            }
        }
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
    .then(data => console.log('Text deleted:', data))
    .catch(error => console.error('Error deleting text:', error));

    console.log("deleted");
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

                insertIntoDoc(openaiResponse, message.selection);

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

function insertIntoDoc(message, original) {
    authenticate().then(token => {
        const documentId = "1-TCq-ZNtM67KRGP7f0FQrUa2-s87FmYrvC1wNXYi_qo";
        insertTextIntoDoc(documentId, 1, message, token);
        // deleteTextFromDoc(documentId, 1, 10, token);

        const {start, end} = getDocumentContent(documentId, token, original);
        deleteTextFromDoc(documentId, start, end, token);
    }).catch(error => {
        console.error('Error authenticating:', error);
    });
}
