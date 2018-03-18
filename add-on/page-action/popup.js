function logError(error) {
    console.log(`Error: ${error}`);
}

let doc = {};
let activeTab;

browser.tabs.query({active: true}).then((tabs) => {
    activeTab = tabs[0];

    browser.runtime.sendMessage({ tabId: activeTab.id, subject: "get-document" }).then((docMessage) => {
        doc = docMessage;

        let titleSpan = document.getElementById("title");
        titleSpan.textContent = doc.title;

        let fileListElement = document.getElementById("pdf-file-list");
        while (fileListElement.firstChild) {
            fileListElement.removeChild(fileListElement.firstChild);
        }
        for(let i = 0; i < doc.pdfFiles.length; i++) {
            let li = document.createElement("li");
            li.textContent = doc.pdfFiles[i].filename;
            fileListElement.appendChild(li);
        }

        let hasPDFFilesDiv = document.getElementById("has-pdf-files");
        if(doc.pdfFiles.length > 0) {
            hasPDFFilesDiv.setAttribute("style", "display: block;");
        } else {
            hasPDFFilesDiv.setAttribute("style", "display: none;");
        }

        // WIP
        // let hasHTMLFilesDiv = document.getElementById("has-html-files");
        // if(doc.htmlFiles.length > 0) {
        //     hasHTMLFilesDiv.setAttribute("style", "display: block;");
        // } else {
        //     hasHTMLFilesDiv.setAttribute("style", "display: none;");
        // }
    }, logError);
}, logError);

document.getElementById("download-pdf-files").addEventListener("click", () => {
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

document.getElementById("download-html").addEventListener("click", () => {
   browser.tabs.create({
       active: false,
       openerTabId: activeTab.id,
       url: "/html-aggregator/document.html"
   });
});