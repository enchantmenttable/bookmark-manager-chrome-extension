const listAllDiv = document.querySelector(".list-all");

async function readLocalStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (data) => {
            if (data[key] === undefined) {
                reject(undefined);
            } else {
                resolve(data[key])
            }
        })
    })
}

/** logic
 * read local storage
 * display
 */

async function init() {

}