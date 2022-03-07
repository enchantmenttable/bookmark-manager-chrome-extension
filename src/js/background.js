// chrome.runtime.onInstalled.addListener(() => {
//     chrome.storage.local.clear(() => { });
// })

chrome.runtime.onInstalled.addListener( function () {
    // chrome.storage.local.set({ folders: ["Books", "Design", "Backlog"] });
    createDatabase();
})

function createDatabase() {
    const request = indexedDB.open("mainDatabase", 1);

    request.onupgradeneeded = function () {
        const db = request.result;

        db.createObjectStore("bookmarks", {keyPath: "url"});
        db.createObjectStore("folders", {keyPath: "folderName"});

        // bookmarkStore.createIndex("title", "title");
        // // if "title" not presented, won't be able to search by title?

        // bookmarkStore.createIndex("thumbnail", "thumbnail");
        // // keypath ["a", "b"] then can search with either .get("a") or .get("b")?

        // bookmarkStore.createIndex("description", "description");
        // bookmarkStore.createIndex("dateAdded", "dateAdded");
        // bookmarkStore.createIndex("folder", "folder");

    };

    request.onsuccess = function () {
        const db = request.result;

        const transaction = db.transaction("folders", "readwrite");

        const folderStore = transaction.objectStore("folders");

        folderStore.put({folderName: "Yeah"});
        folderStore.put({folderName: "Oh"});
        folderStore.put({folderName: "Oh Yeah"});

        transaction.oncomplete = function () {
            db.close();
        }
    }
}


// https://github.com/mdn/to-do-notifications/blob/gh-pages/scripts/todo.js