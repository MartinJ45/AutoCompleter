console.log("Working");

document.addEventListener("click", () => {
  console.log("Clack");

  /* Gets the users selected text */
  document.querySelector(".docs-texteventtarget-iframe").contentDocument.execCommand("copy");
  const selectedText = document.querySelector(".docs-texteventtarget-iframe").contentDocument.body.innerText

  if (chrome.runtime?.id) {
    chrome.runtime.sendMessage({selection: selectedText});
  } else {
    console.error("Extension not loaded properly.");
  }
});
