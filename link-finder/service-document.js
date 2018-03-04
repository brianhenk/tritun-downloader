function getLink(listItem) {
    return listItem.querySelector("a[target='procedure-iframe']");
}

function getName(listItem) {
    return getLink(listItem).textContent.trim();
}

function getProcedures(procedureItem) {
    let procedures = [ getName(procedureItem) ];
    let parent = procedureItem.parentElement;
    do {
        if(parent.matches("li.section")) {
            procedures.unshift(getName(parent));
        }
        parent = parent.parentElement;
    } while(parent !== null);

    return procedures;
}

function getResource(procedureItem) {
    let viewerUrl = new URL(getLink(procedureItem).getAttribute("href"), "https://www.tritun.net");
    let pdfParam = viewerUrl.searchParams.get("pdfUrl");
    if(pdfParam != null) {
        return { "type": "pdf", "url": new URL(pdfParam, "https://www.tritun.net").toString() };
    } else {
        return { "type": "html", "url": viewerUrl.toString() };
    }
}

browser.runtime.onMessage.addListener((message, sender, response) => {
    if(message.subject === "find-files") {
        let procedures = document.querySelectorAll("li.procedure");

        let toDownload = [];
        for (let procedure of procedures) {
            let resource = getResource(procedure);
            toDownload.push({
                type: resource.type,
                url: resource.url,
                procedures: getProcedures(procedure)
            });
        }

        if(procedures.length > 0) {
            response(toDownload);
        }
    }
});