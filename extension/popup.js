// document.addEventListener("DOMContentLoaded", () => {
//     const analyzeButton = document.getElementById("analyze");

//     if (analyzeButton) {
//         analyzeButton.addEventListener("click", () => {
//             chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//                 chrome.tabs.sendMessage(tabs[0].id, { action: "fetchText" }, (response) => {
//                     if (response?.text) {
//                         chrome.runtime.sendMessage({ action: "callAI", text: response.text }, (reply) => {
//                             document.getElementById("output").textContent = reply?.reply || "Error";
//                         });
//                     }
//                 });
//             });
//         });
//     } else {
//         console.error("Button #analyze not found in the DOM.");
//     }
// });

chrome.runtime.onMessage.addListener((message) => {
    if (message.curosrIndex !== undefined) {
        document.getElementById("cursorpos").innerText = message.cursorIndex;
    }
})
