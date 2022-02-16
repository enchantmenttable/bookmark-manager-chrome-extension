// async function readLocalStorage(key) {
//     return new Promise((resolve, reject) => {
//         chrome.storage.local.get(key, (data) => {
//             if (data[key] === undefined) {
//                 reject(undefined);
//             } else {
//                 resolve(data[key])
//             }
//         })
//     })
// }

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

function createListing(rawListing, listingContainter) {
    for (const [url, title] of Object.entries(rawListing)) {
        listingContainter.insertAdjacentHTML("beforeend", `<li>${title}: ${url}</li>`)
    }
}

async function init() {
    const rawListing = await readAllLocalStorage();
    const listingContainter = document.getElementById("listing");
    createListing(rawListing, listingContainter);
}

init();