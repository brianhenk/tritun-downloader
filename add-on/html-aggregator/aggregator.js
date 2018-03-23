browser.tabs.getCurrent().then((currentTab) => {
    browser.runtime.sendMessage({
        subject: "get-document",
        tabId: currentTab.openerTabId
    }).then((doc) => {
        let titleElement = document.getElementById("doc-title");
        titleElement.textContent = doc.title;

        let previousProcedures = [];
        for(let i = 0; i < doc.htmlFiles.length; i++) {
            let file = doc.htmlFiles[i];

            setTimeout(() => {
                // Create headers
                let lowestHeader;
                let lowestHeaderLevel;
                for (let procedureLevel = 0; procedureLevel < file.procedures.length; procedureLevel++) {
                    let headerLevel = procedureLevel + 2;
                    lowestHeaderLevel = headerLevel;
                    if (previousProcedures[procedureLevel] !== file.procedures[procedureLevel]) {
                        let header = document.createElement("h" + headerLevel);
                        header.textContent = file.procedures[procedureLevel];
                        document.body.appendChild(header);
                        lowestHeader = header;
                    }
                }
                previousProcedures = file.procedures;

                // Fetch content
                fetch(file.url).then((response) => {
                    return response.text();
                }).then((text) => {
                    let tempDoc = new DOMParser().parseFromString(text, "text/html");

                    // Remove h1
                    let primaryHeader = tempDoc.querySelector("h1");
                    if (primaryHeader != null) {
                        primaryHeader.remove();
                    }

                    // Lower heading level for other headers
                    for (let headerLevel = 6; headerLevel > 1; headerLevel--) {
                        let headers = tempDoc.querySelectorAll("h" + headerLevel);
                        for (let header of headers) {
                            let newHeader = tempDoc.createElement("h" + (lowestHeaderLevel + headerLevel - 1));
                            newHeader.innerHTML = header.innerHTML;
                            header.insertAdjacentElement('afterend', newHeader);
                            header.remove();
                        }
                    }

                    // Remove internal links
                    let links = tempDoc.querySelectorAll("a");
                    for (let link of links) {
                        link.insertAdjacentHTML('afterend', link.innerHTML);
                        link.remove();
                    }

                    // Replace SVG objects with images
                    let svgDivs = tempDoc.querySelectorAll("div.svg-pan-zoom");
                    for (let svgDiv of svgDivs) {
                        let object = svgDiv.querySelector("object");
                        let image = tempDoc.createElement("img");
                        image.setAttribute("src", new URL(object.getAttribute("data"), "https://www.tritun.net").toString());
                        svgDiv.insertAdjacentElement("afterend", image);
                        svgDiv.remove();
                    }

                    // Change images to absolute urls
                    let images = tempDoc.querySelectorAll("img");
                    for (let image of images) {
                        let src = image.getAttribute("src");
                        image.setAttribute("src", new URL(src, "https://www.tritun.net").toString());
                    }

                    lowestHeader.insertAdjacentHTML('afterend', tempDoc.body.innerHTML);
                });
            }, 1500 * i);
        }
    });
});