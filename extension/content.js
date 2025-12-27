console.log("Working");


document.addEventListener("click", () => {
  // Gets the status of the extension provided by popup.js
  chrome.storage.local.get(["extension_enabled"], (result) => {
    const is_enabled = result.extension_enabled !== false;

    if (is_enabled) {
      console.log("Clack");

      // Gets the users selected text
      document.querySelector(".docs-texteventtarget-iframe").contentDocument.execCommand("copy");
      const selectedText = document.querySelector(".docs-texteventtarget-iframe").contentDocument.body.innerText

      if (chrome.runtime?.id) {
        chrome.runtime.sendMessage({selection: selectedText});
      } else {
        console.error("Extension not loaded properly.");
      } 
    }
  });
});
