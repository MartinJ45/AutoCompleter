console.log("Working");

document.addEventListener("click", () => {
  console.log("Click");

  document.querySelector(".docs-texteventtarget-iframe").contentDocument.execCommand("copy");
  const selectedText = document.querySelector(".docs-texteventtarget-iframe").contentDocument.body.innerText

  chrome.runtime.sendMessage({selection: selectedText});
});
