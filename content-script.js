chrome.runtime.sendMessage(
    { action: "fetchData" },
    (response) => console.log(response)
);