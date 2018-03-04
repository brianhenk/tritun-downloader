function logError(error) {
    console.log(`Error: ${error}`);
}

function filterSlashes(str) {
    return str.replace('/', '');
}

function getFilename(type, procedures, title, order) {
    let filename = filterSlashes(title);
    filename = filename + "/" + (order + 1).toString().padStart(3, "0");
    for(let procedure of procedures) {
        filename = filename + " - " + filterSlashes(procedure);
    }
    filename = filename + "." + type;
    return filename;
}

let title = "Unknown";
let files = [];

browser.tabs.query({active: true}).then((tabs) => {
    let activeTab = tabs[0];

    browser.tabs.sendMessage(activeTab.id, { subject: "find-title" }).then((titleMessage) => {
        title = titleMessage;

        let titleSpan = document.getElementById("title");
        titleSpan.textContent = title;

        browser.tabs.sendMessage(activeTab.id, { subject: "find-files" }).then((filesMessage) => {
            files = filesMessage;

            let fileCountSpan = document.getElementById("file-count");
            fileCountSpan.textContent = files.length;

            let fileListElement = document.getElementById("file-list");
            while (fileListElement.firstChild) {
                fileListElement.removeChild(fileListElement.firstChild);
            }
            for(let i = 0; i < files.length; i++) {
                let li = document.createElement("li");
                li.textContent = getFilename(files[i].type, files[i].procedures, titleMessage, i);
                fileListElement.appendChild(li);
            }

            let noFilesDiv = document.getElementById("no-files");
            let hasFilesDiv = document.getElementById("has-files");
            if(files.length > 0) {
                noFilesDiv.setAttribute("style", "display: none;");
                hasFilesDiv.setAttribute("style", "display: block;");
            } else {
                noFilesDiv.setAttribute("style", "display: block;");
                hasFilesDiv.setAttribute("style", "display: none;");
            }
        }, logError);
    }, logError);
}, logError);

document.getElementById("download-files").addEventListener("click", () => {
    for (let i = 0; i < files.length; i++) {
        browser.runtime.sendMessage({
            subject: "add-download",
            item: {
                url: files[i].url,
                filename: getFilename(files[i].type, files[i].procedures, title, i)
            }
        });
    }
});