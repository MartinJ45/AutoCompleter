console.log("Backend loaded");

/*
Params: selection - the users selected text
Returns: null if no api key is found or an error occurs; ChatGPT response data if
         sucessful
Description: Fetches the apiKey from storage and sends a request to the OpenAI API 
             to get an autocompletion of the selected text
*/
async function getResponse(selection) {
    // Get the API key from storage
    const data = await new Promise((resolve) => {
        chrome.storage.sync.get("apiKey", resolve);
    });

    if (!data.apiKey) {
        console.log("No API key found");
        return null;
    }

    const apiKey = data.apiKey;

    console.log("Got API Key");
    console.log("Selected text:", selection);

    // Send a request to the OpenAI API
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
                    {"role": "system", "content": 
                        "You are a helpful assistant that autocompletes sentences in Google Docs. \
            You will receive an incomplete sentence and must provide a continuation while preserving \
            the original text. The response must always start with the given sentence and extend it \
            naturally. Your response must be in the format of: <original sentence> ..."},
                    {"role": "user", "content": `${selection}`}
                ]
            })
        })

        console.log("version 2");
        
        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Error fetching OpenAI response:", error);
        return null;
    }
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

    return { startIndex, endIndex };
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

// Function to get document content using Google Docs API
async function getDocumentContent(documentId, token, message) {
    const url = `https://docs.googleapis.com/v1/documents/${documentId}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });

        const data = await response.json();
        console.log("Document content:", data);

        const documentContent = extractTextFromDoc(data);

        const {startIndex, endIndex} = findTextIndicesInDoc(documentContent, message);

        console.log(startIndex, endIndex);

        return {start: startIndex+1, end: endIndex+1};
    } catch (error) {
        console.error("Error getting the document content:", error);
        return null;
    }
}

async function deleteTextFromDoc(documentId, startIndex, endIndex, token) {
    console.log("Deleting from " + startIndex + " to " + endIndex);

    const requests = [{
        deleteContentRange: {
            range: {
                startIndex: startIndex,
                endIndex: endIndex
            }
        }
    }];

    const batchUpdateRequest = { requests: requests };

    try {
        const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(batchUpdateRequest),
        });

        const data = await response.json();
        console.log('Text deleted:', data);
        return data; // Return the response in case it's needed
    } catch (error) {
        console.error('Error deleting text:', error);
        return null;
    }
}

/*
Params: documentId - the id of the Google Doc
        index - the index to insert the text at
        text - the text to insert
        token - the access token for authentication
Returns: none
Description: Inserts the text into the doc at the specified index.
*/
async function insertTextIntoDoc(documentId, index, text, token) {
    const requests = [{
        insertText: {
            location: { index: index },
            text: text,
        },
    }];

    const batchUpdateRequest = { requests: requests };

    try {
        const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(batchUpdateRequest),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error inserting text:", error);
        return null;
    }
}

// Initialize the OAuth2 flow and get the access token
function authenticate() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            if (chrome.runtime.lastError || !token) {
                console.log("Unsuccessful authentication:", chrome.runtime.lastError);
                reject('Authentication failed');
            } else {
                resolve(token);
            }
        });
    });
}

/*
Params: response - the text being inserted into the doc
        selection - the text being replaced by the response
Returns: none
Description: Inserts the response into the doc and deletes the selected text from the
             doc.
*/
async function insertAutoCompletion(response, selection) {
    try {
        const token = await authenticate();
        // Document ID of the Google Doc - will eventually be dynamic
        const documentId = "1-TCq-ZNtM67KRGP7f0FQrUa2-s87FmYrvC1wNXYi_qo";

        // Deletes the selected text
        const {start, end} = await getDocumentContent(documentId, token, selection);
        console.log("Start:", start, "End:", end);
        await deleteTextFromDoc(documentId, start, end, token);

        // Inserts the response into the doc
        await insertTextIntoDoc(documentId, start, response, token);
    } catch (error) {
        console.error('Error authenticating:', error);
        return false;
    }
    return true;
}

/*
Params: message - the message sent from the content script, contains the selected text
Returns: false if there is an error; true if successful
Description: Listens for a message from the content script, gets the selected text, and
             sends a request to the OpenAI API. The response is then inserted into the
             doc.
*/
chrome.runtime.onMessage.addListener((message) => {
    if (message.selection !== undefined) {
        const wordCount = message.selection.trim().split(/\s+/).length;

        // Only sends a request if the word count is greater than 4
        if (wordCount > 4) {
            // Sends the request
            getResponse(message.selection).then(response => {
                if (response == null) {
                    console.log("There was an error getting the response");
                    return false;
                }

                const openaiResponse = response.choices[0].message.content;
                console.log("Response:", openaiResponse);

                // Inserts the response into the doc
                insertAutoCompletion(openaiResponse, message.selection);
                return true;
            }).catch(error => {
                console.error("Error:", error);
                return false;
            });
        } else {
            console.log("Word count is less than 4");
            return false;
        }

        return true;
    }
});
