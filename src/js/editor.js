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

// function displayListings(rawData) {
//     for (const [url, data] of Object.entries(rawData)) {
//         if (url.indexOf("://") === -1) {
//             listingContainter.insertAdjacentHTML("beforeend", `<li><a href="https://${url}" target="_blank" rel="noreferer noopener"></a></li>`);
//         } else {
//             listingContainter.insertAdjacentHTML("beforeend", `<li><a href="${url}" target="_blank" rel="noreferer noopener"></a></li>`);
//         }

//         listingContainter.lastChild.querySelector("a").textContent = data["title"];
//         listingContainter.lastChild.insertAdjacentHTML("beforeend", `<span>${data["dateAdded"]}</span>`);
//     }
// }

function displayListings(rawData) {
    for (const [url, data] of Object.entries(rawData)) {
        if (url.indexOf("://") === -1) {
            let href = `https://${url}`;
        } else {
            let href = url;
        }
        listingContainter.insertAdjacentHTML("beforeend",
            `<div class="card">
        <div class="row no-gutters">
            <div class="col-auto">
                <img src="${data.thumbnail}" alt="" class="img-fluid" style="width: 64px;">
            </div>
            <div class="col">
                <div class="card-block px-2">
                    <h6 class="card-title">${data.title}</h6>
                    <p class="card-text">Description</p>
                </div>
            </div>
        </div>
        <div class="card-footer w-100">
            ${data.dateAdded}
        </div>
    </div>
        `)
    }
}

const listingContainter = document.getElementById("card-listing");

async function init() {
    const rawData = await readAllLocalStorage();
    displayListings(rawData);
}

init();