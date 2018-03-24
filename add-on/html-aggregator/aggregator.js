browser.tabs.getCurrent().then((currentTab) => {
    browser.runtime.sendMessage({
        subject: "get-document",
        tabId: currentTab.openerTabId
    }).then((doc) => {
        let contentDiv = document.getElementById("doc-content");

        function setTitle(title) {
            let titleElement = document.getElementById("doc-title");
            titleElement.textContent = title;
            document.title = title;
        }

        function incrementProgress(found, inc) {
            document.getElementById("count-found").textContent = found;

            let countDoneSpan = document.getElementById("count-done");
            let done = parseInt(countDoneSpan.textContent) + inc;
            countDoneSpan.textContent = done.toFixed(0);

            let percentDone = (done / found) * 100;
            document.getElementById("percent-done").textContent = percentDone.toFixed(1);
            document.getElementById("progress").style.width = percentDone.toFixed(0) + "%";

            let minutesRemaining = (found - done) * 1800 / 1000 / 60;
            document.getElementById("mins-remaining").textContent = minutesRemaining.toFixed(1);
        }

        function revealAndDownload() {
            document.getElementById("doc-loading").setAttribute("style", "display:none;");
            document.getElementById("doc-content").setAttribute("style", "");
            browser.tabs.saveAsPDF({
                showBackgroundColors: true,
                headerLeft: "",
                headerRight: "",
                footerLeft: "&T",
                footerRight: "&PT"
            });
        }

        setTitle(doc.title);

        let filesCount = doc.htmlFiles.length;
        incrementProgress(filesCount, 0);

        let previousProcedures = [];
        for(let i = 0; i < filesCount; i++) {
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
                        contentDiv.appendChild(header);
                        lowestHeader = header;
                    }
                }
                previousProcedures = file.procedures;

                // Fetch content
                fetch(file.url, { credentials: "include" }).then((fileResponse) => {
                    return fileResponse.text();
                }).then((fileText) => {
                    let fileDoc = new DOMParser().parseFromString(fileText, "text/html");

                    // Remove h1
                    let primaryHeader = fileDoc.querySelector("h1");
                    if (primaryHeader != null) {
                        primaryHeader.remove();
                    }

                    // Lower heading level for other headers
                    for (let headerLevel = 6; headerLevel > 1; headerLevel--) {
                        let headers = fileDoc.querySelectorAll("h" + headerLevel);
                        for (let header of headers) {
                            let newHeader = fileDoc.createElement("h" + (lowestHeaderLevel + headerLevel - 1));
                            newHeader.innerHTML = header.innerHTML;
                            header.insertAdjacentElement('afterend', newHeader);
                            header.remove();
                        }
                    }

                    // Remove internal links
                    let links = fileDoc.querySelectorAll("a");
                    for (let link of links) {
                        link.insertAdjacentHTML('afterend', link.innerHTML);
                        link.remove();
                    }

                    // Replace SVG objects with images
                    let svgDivs = fileDoc.querySelectorAll("div.svg-pan-zoom");
                    for (let svgDiv of svgDivs) {
                        let object = svgDiv.querySelector("object");
                        let image = fileDoc.createElement("img");
                        image.setAttribute("src", new URL(object.getAttribute("data"), "https://www.tritun.net").toString());
                        svgDiv.insertAdjacentElement("afterend", image);
                        svgDiv.remove();
                    }

                    // Replace IMG objects with images
                    let imgSections = fileDoc.querySelectorAll("section.img-pan-zoom");
                    for (let imgSection of imgSections) {
                        let img = imgSection.querySelector("img");
                        img.setAttribute("src", new URL(img.getAttribute("src"), "https://www.tritun.net").toString());
                        imgSection.insertAdjacentElement("afterend", img);
                        imgSection.remove();
                    }

                    // Change images to absolute urls
                    let images = fileDoc.querySelectorAll("img");
                    for (let image of images) {
                        let src = image.getAttribute("src");
                        image.setAttribute("src", new URL(src, "https://www.tritun.net").toString());
                    }

                    lowestHeader.insertAdjacentHTML('afterend', fileDoc.body.innerHTML);
                    incrementProgress(filesCount, 1);
                });

                if(i >= filesCount - 1) {
                    revealAndDownload();
                }
            }, 1500 * i);
        }
    });
});