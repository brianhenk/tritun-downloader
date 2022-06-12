function logError(error) {
    console.log(`Error: ${error}`);
}

function filterSpecialChars(str) {
    return str.replace('/', '')
              .replace('>','_')
              .replace('<','_')
              .replace('\\','');
}

function getPDFFilename(vehicle, title, procedures, order, count) {
    let filename = filterSpecialChars(vehicle);
    filename = filename + "/" + filterSpecialChars(title);
    if(count > 1) {
        filename = filename + "/" + (order + 1).toString().padStart(3, "0");
        for (let procedure of procedures) {
            filename = filename + " - " + filterSpecialChars(procedure);
        }
    }
    filename = filename + ".pdf";
    return filename;
}

let tabIdToDoc = {};

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.status === "complete" && tab.url.includes("/tritun/content/document/view")) {
        browser.tabs.sendMessage(tabId, { subject: "find-title" }).then((titleMessage) => {
            let doc = {
                title: titleMessage.title,
                vehicle: titleMessage.vehicle,
                pdfFiles: [],
                htmlFiles: []
            };

            browser.tabs.sendMessage(tabId, { subject: "find-files" }).then((filesMessage) => {
                let filesCount = filesMessage.length;
                for (let i = 0; i < filesCount; i++) {
                    let fileMessage = filesMessage[i];

                    if (fileMessage.type === "pdf") {
                        doc.pdfFiles.push({
                            url: fileMessage.url,
                            filename: getPDFFilename(doc.vehicle, doc.title, fileMessage.procedures, i, filesCount)
                        });
                    } else if (fileMessage.type === "html") {
                        doc.htmlFiles.push({
                            url: fileMessage.url,
                            procedures: fileMessage.procedures
                        });
                    }
                }
            }, logError);

            tabIdToDoc[tabId] = doc;
            browser.pageAction.show(tabId);

        }, logError);
    } else {
        browser.pageAction.hide(tabId);
    }
});

browser.runtime.onMessage.addListener((message, sender, response) => {
    if (message.subject === "get-document") {
        response(tabIdToDoc[message.tabId]);
    }
});
