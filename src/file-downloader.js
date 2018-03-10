let maxSimultaneous = 1;
let interval = 15 / 600; // 15 minutes to download 600 files
browser.alarms.create({ periodInMinutes: interval });

let itemsToDownload = [];

function download(item) {
    browser.downloads.download({
        url: item.url,
        filename: "TriTun/" + item.filename,
        conflictAction: "overwrite",
        saveAs: false
    }).catch(function (error) {
        console.log("Error starting download: " + error);
    });
}

function ensureQuotaRunning() {
    let searching = browser.downloads.search({ state: "in_progress" });
    searching.then((downloadsInProgress) => {
        if(downloadsInProgress.length < maxSimultaneous && itemsToDownload.length > 0) {
            download(itemsToDownload.pop());
        }
    });
}

browser.runtime.onMessage.addListener((message, sender, response) => {
    if (message.subject === "add-download") {
        itemsToDownload.push(message.item);
    }
});

browser.alarms.onAlarm.addListener(() => {
    ensureQuotaRunning();
});
