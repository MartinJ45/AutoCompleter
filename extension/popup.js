console.log("Popup");

document.getElementById("api-form").addEventListener("submit", getKey);
function getKey() {
    let apiKey = document.getElementById("api-key").value;
    chrome.storage.sync.set({apiKey: apiKey});
    console.log("API key set to", apiKey);
}
