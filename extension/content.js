async function fetchAIResponse(inputText) {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: inputText })
    });
  
    const data = await response.json();
    return data.reply;
  }
  
  async function enhanceText() {
    const selection = document.getSelection().toString().trim();
    if (!selection) {
      alert("Please select some text in Google Docs!");
      return;
    }
  
    const aiReply = await fetchAIResponse(selection);
  
    // Replace selected text with AI-generated text
    document.execCommand("insertText", false, aiReply);
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "enhance") {
      enhanceText();
    }
  });
  