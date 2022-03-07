export function getCardElems(card) {
    return {
        title: card.querySelector(".card-title"),
        description: card.querySelector(".card-description"),
        urlInput: card.querySelector(".card-url-input"),
        thumbnail: card.querySelector(".card-thumbnail"),
        mainLink: card.querySelector(".card-main-link"),
        domainDisplayText: card.querySelector(".card-domain-display-text"),
        folderDropdown: card.querySelector(".card-folder-dropdown"),
        folderDisplayText: card.querySelector(".card-folder-display-text"),
        dateAdded: card.querySelector(".card-date-added"),
        editButton: card.querySelector(".card-edit-button"),
        deleteButton: card.querySelector(".card-delete-button"),
        cancelButton: card.querySelector(".card-cancel-button"),
        saveButton: card.querySelector(".card-save-button")
    }
}

export function saveDataPrevValueAttr(cardElems) {
    cardElems.title.setAttribute("data-prev-value", cardElems.title.value);
    cardElems.description.setAttribute("data-prev-value", cardElems.description.value);
    cardElems.urlInput.setAttribute("data-prev-value", cardElems.urlInput.value);
}

export function getDomain(url) {
    const { hostname } = new URL(url);

    let displayDomain;
    if (hostname.includes("www.")) {
        displayDomain = hostname.substring(4);
    } else {
        displayDomain = hostname;
    }

    return displayDomain
}

export async function getTemplate(path) {
    const response = await fetch(path, { method: "GET" });
    const responseText = await response.text();

    return responseText
}

export function navigateTo(page) {

}

// async function readLocalStorage(key) {
//     return new Promise((resolve, reject) => {
//         chrome.storage.local.get(key, (data) => {
//             if (data[key] === undefined) {
//                 reject("có gì đâu");
//             } else {
//                 resolve(data[key]);
//             }
//         })
//     })
// }

export async function readIndexedDB(objectStore, allKeys, key = undefined) {
    return new Promise(function (resolve, reject) {
        const request = indexedDB.open("mainDatabase");
        let result;

        if (allKeys === true) {
            request.onsuccess = function () {
                const db = request.result;
                const transaction = db.transaction(objectStore, "readonly");
                const store = transaction.objectStore(objectStore);
                result = store.getAllKeys();
            }
        } else if (allKeys === false) {
            request.onsuccess = function () {
                const db = request.result;
                const transaction = db.transaction(objectStore, "readonly");

                const store = transaction.objectStore(objectStore);

                result = store.get(key);

                transaction.oncomplete = function () {
                    db.close();
                };

            }

            resolve(result)
        }
    })
}

async function writeIndexedDB(objectStore, value) {

}