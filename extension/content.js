function getSelectedText() {
    const selection = document.getSelection();
    return selection.toString();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchText") {
        sendResponse({ text: getSelectedText() });
    }
});
