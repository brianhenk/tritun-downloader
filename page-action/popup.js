function logError(error) {
    console.log(`Error: ${error}`);
}

let doc = {};

browser.tabs.query({active: true}).then((tabs) => {
    let activeTab = tabs[0];

    browser.runtime.sendMessage({ tabId: activeTab.id, subject: "get-document" }).then((docMessage) => {
        doc = docMessage;

        let titleSpan = document.getElementById("title");
        titleSpan.textContent = doc.title;

        let fileCountSpan = document.getElementById("file-count");
        fileCountSpan.textContent = doc.pdfFiles.length;

        let fileListElement = document.getElementById("file-list");
        while (fileListElement.firstChild) {
            fileListElement.removeChild(fileListElement.firstChild);
        }
        for(let i = 0; i < doc.pdfFiles.length; i++) {
            let li = document.createElement("li");
            li.textContent = doc.pdfFiles[i].filename;
            fileListElement.appendChild(li);
        }

        let noFilesDiv = document.getElementById("no-files");
        let hasFilesDiv = document.getElementById("has-files");
        if(doc.pdfFiles.length > 0) {
            noFilesDiv.setAttribute("style", "display: none;");
            hasFilesDiv.setAttribute("style", "display: block;");
        } else {
            noFilesDiv.setAttribute("style", "display: block;");
            hasFilesDiv.setAttribute("style", "display: none;");
        }
    }, logError);
}, logError);

document.getElementById("download-files").addEventListener("click", () => {
    for (let i = 0; i < doc.pdfFiles.length; i++) {
        browser.runtime.sendMessage({
            subject: "add-download",
            item: {
                url: doc.pdfFiles[i].url,
                filename: doc.pdfFiles[i].filename
            }
        });
    }
});