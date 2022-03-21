export function getCardElems(card) {
    return {
        title: card.querySelector(".card-title"),
        description: card.querySelector(".card-description"),
        urlInput: card.querySelector(".card-url-input"),
        thumbnail: card.querySelector(".card-thumbnail"),
        mainLink: card.querySelector(".card-main-link"),
        domainDisplayText: card.querySelector(".card-domain-display-text"),
        folder: card.querySelector(".card-folder-select"),
        folderDisplay: card.querySelector(".card-folder-display"),
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
    cardElems.folder.setAttribute("data-prev-value", cardElems.folder.value);
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

export async function readAllObjectStore(objectStore) {
    return new Promise(
        function (resolve, reject) {
            const request = indexedDB.open("mainDatabase");

            request.onsuccess = function () {
                const db = request.result;

                const store = db.transaction(objectStore, "readonly").objectStore(objectStore);

                const requestAll = store.getAll();

                requestAll.onsuccess = function () {
                    resolve(requestAll.result)
                }
            }
        }
    )

}

export async function readValueByIndex(objectStore, index, indexValue) {
    return new Promise(
        function (resolve, reject) {
            const request = indexedDB.open("mainDatabase");

            request.onsuccess = function () {
                const db = request.result;
                const store = db.transaction(objectStore, "readonly").objectStore(objectStore);
                const storeIndex = store.index(index);
                const query = storeIndex.getAll(indexValue);

                query.onsuccess = function () {
                    resolve(query.result)
                }
            }
        }
    )
}

export function deleteItem(objectStore, key) {
    const request = indexedDB.open("mainDatabase");

    request.onsuccess = function () {
        const db = request.result;
        const store = db.transaction(objectStore, "readwrite").objectStore(objectStore);

        store.delete(key);
    }
}

export function putItem(objectStore, data) {
    const request = indexedDB.open("mainDatabase");

    request.onsuccess = function () {
        const db = request.result;
        const store = db.transaction(objectStore, "readwrite").objectStore(objectStore);
        store.put(data);
    }
}


