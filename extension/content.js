// async function fetchAIResponse(inputText) {
//   const response = await fetch("http://localhost:5000/chat", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ message: inputText })
//   });

//   const data = await response.json();
//   return data.reply;
// }

// async function enhanceText() {
//   const selection = document.getSelection().toString().trim();
//   if (!selection) {
//     alert("Please select some text in Google Docs!");
//     return;
//   }

//   const aiReply = await fetchAIResponse(selection);

//   // Replace selected text with AI-generated text
//   document.execCommand("insertText", false, aiReply);
// }

console.log("Working");

// Send selected text to background script
// function insertIntoDoc(message) {
//   if (message) {
//       chrome.runtime.sendMessage({
//           action: 'insertText',
//           documentId: '1-TCq-ZNtM67KRGP7f0FQrUa2-s87FmYrvC1wNXYi_qo', 
//           index: 1, 
//           text: message, 
//       });
//   }
// }

document.addEventListener("click", () => {
  console.log("Click");

  document.querySelector(".docs-texteventtarget-iframe").contentDocument.execCommand("copy");
  const selectedText = document.querySelector(".docs-texteventtarget-iframe").contentDocument.body.innerText

  chrome.runtime.sendMessage({selection: selectedText});
});

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("Content message:", message);
//   if (message.response) {
//     const openaiResponse = message.response;
//     console.log("AI response received");

//     insertIntoDoc(openaiResponse);
//   }
//   if (message.selection) {
//     console.log("Received selected text in content:", message.selection);
//     // You can send a response back if needed
//     sendResponse({ status: "Received" });
//   }
// });

// chrome.runtime.sendMessage({
//   action: "insertText",
//   documentId: "1-TCq-ZNtM67KRGP7f0FQrUa2-s87FmYrvC1wNXYi_qo",
//   index: 1,
//   text: "Inserted Text!"
// })


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "enhance") {
//     enhanceText();
//   }
// });
