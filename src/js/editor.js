async function readAllLocalStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, (data) => {
            if (data === {}) {
                reject("có gì đâu");
            } else {
                resolve(data);
            }
        })
    })
}

function displayListings(rawData) {
    for (const [url, data] of Object.entries(rawData)) {
        if (url.indexOf("://") === -1) {
            listingContainter.insertAdjacentHTML("beforeend", `<li><a href="https://${url}" target="_blank" rel="noreferer noopener"></a></li>`);
        } else {
            listingContainter.insertAdjacentHTML("beforeend", `<li><a href="${url}" target="_blank" rel="noreferer noopener"></a></li>`);
        }

        listingContainter.lastChild.querySelector("a").textContent = data["title"];
        listingContainter.lastChild.insertAdjacentHTML("beforeend", `<span>${data["dateAdded"]}</span>`);
    }
}

const listingContainter = document.getElementById("listing");

async function init() {
    const rawData = await readAllLocalStorage();
    displayListings(rawData);
}

init();