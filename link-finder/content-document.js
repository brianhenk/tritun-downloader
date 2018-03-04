browser.runtime.onMessage.addListener((message, sender, response) => {
    if(message.subject === "find-title") {
        let documentName = document.querySelector("h2").textContent.trim();
        response(documentName);
    }
});

browser.runtime.onMessage.addListener((message, sender, response) => {
    if(message.subject === "find-files") {
        let documentFrame = document.getElementById("documentViewContent");
        if(documentFrame != null) {
            let viewerUrl = new URL(documentFrame.getAttribute("src"), "https://www.tritun.net");

            if (viewerUrl.toString().includes("/tritun/content/document/pdf/web/viewer")) {
                let pdfUrl = new URL(viewerUrl.searchParams.get("pdfUrl"), "https://www.tritun.net");
                response([{
                    type: "pdf",
                    url: pdfUrl.toString(),
                    procedures: []
                }]);
            }
        }
    }
});