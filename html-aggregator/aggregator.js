browser.tabs.getCurrent().then((currentTab) => {
    browser.runtime.sendMessage({
        subject: "get-document",
        tabId: currentTab.openerTabId
    }).then((doc) => {
        document.getElementById("doc-title").textContent = doc.title;
    });
});