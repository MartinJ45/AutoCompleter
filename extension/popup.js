console.log("Popup");

/*
Params: apiKey - the key entered by the user
Returns: true if apiKey is a valid key; false otherwise
Description: attemps to use the entered key to see if it is valid
*/
async function verifyKey(apiKey) {
    console.log("verifying key");
    try {
        const response = await fetch("https://api.openai.com/v1/models", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error verifying API key:", error);
        return false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("apiKey", (data) => {
        if (data.apiKey) {    
            document.getElementById("current-apikey").innerText = `Current key: ${data.apiKey.slice(0, 3)}...${data.apiKey.slice(-4)}`;
        } else {
            document.getElementById("current-apikey").innerText = `No key set`;
        }
    });
});

document.getElementById("api-form").addEventListener("submit", getKey);
/*
Description: grabs the entered key and saves it if valid`
*/
async function getKey() {
    event.preventDefault();
    let apiKey = document.getElementById("api-key").value;

    let verify = await verifyKey(apiKey)

    if (verify) {
        document.getElementById("error-message").style.display = "none";

        chrome.storage.sync.set({apiKey: apiKey}, () => {
            console.log("API key set to", apiKey);
            document.getElementById("current-apikey").innerText = `Current key: ${apiKey.slice(0, 3)}...${apiKey.slice(-4)}`;
        });
    } else {
        document.getElementById("error-message").style.display = "block";
    }
}

// Password visibility logic
const toggle = document.getElementById("toggle-visibility");
toggle.addEventListener("click", () => {
    const input = document.getElementById("api-key");
    const btn = document.getElementById("toggle_eye");
    if (input.type === "password") {
        input.type = "text"
        btn.classList.remove("fa-eye")
        btn.classList.add("fa-eye-slash")
    } else {
        input.type = "password"
        btn.classList.remove("fa-eye-slash")
        btn.classList.add("fa-eye")
    }
});

const enable_switch = document.getElementById("enable-switch");

// Gets the status of the extension on reload
chrome.storage.local.get(["extension_enabled"], (result) => {
    const is_enabled = result.extension_enabled !== false;

    enable_switch.checked = is_enabled;
    toggle_state(enable_switch.checked);
})
// Updates extension_enabled which is used by content.js and popup.js
enable_switch.addEventListener("change", (e) => {
    chrome.storage.local.set({
        extension_enabled: e.target.checked
    });

    toggle_state(enable_switch.checked);
});

/*
Params: is_enabled - whether or not the extension is currently enabled
Description: disables/enables different UI states of the popup
*/
function toggle_state(is_enabled) {
    document.getElementById("submit-button").disabled = !is_enabled;
    document.getElementById("api-key").disabled = !is_enabled;
    document.getElementById("toggle-visibility").disabled = !is_enabled
    document.getElementById("current-apikey").style.display = is_enabled ? "block" : "none";
    document.getElementById("enable-switch-label").textContent = is_enabled ? "Disable Autocomplete" : "Enable Autocomplete";
    document.getElementById("error-message").style.display = "none";
}
