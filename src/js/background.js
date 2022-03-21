chrome.runtime.onInstalled.addListener(function () {
    createDatabase();
})

function createDatabase() {    
    const initFolderData = [
        {name: "Stuff"}
    ];

    const metadata = {
        name: "lastSelectedFolder",
        value: "Stuff"
    };

    const request = indexedDB.open("mainDatabase", 1);

    request.onupgradeneeded = function () {
        const db = request.result;

        const bookmarkStore = db.createObjectStore("bookmarks", {keyPath: "url"});
        const metadataStore = db.createObjectStore("metadata", {keyPath: "name"});
        const folderStore = db.createObjectStore("folders", {keyPath: "name"});

        bookmarkStore.createIndex("title", "title");
        bookmarkStore.createIndex("description", "description");
        bookmarkStore.createIndex("displayDomain", "displayDomain");
        bookmarkStore.createIndex("folder", "folder");

        metadataStore.createIndex("name", "name");

        folderStore.createIndex("folder", "folder");

    };

    request.onsuccess = function () {
        const db = request.result;
        
        const foldersStore = db.transaction("folders", "readwrite").objectStore("folders");

        const metadataStore = db.transaction("metadata", "readwrite").objectStore("metadata");
        
        for (const entry of initFolderData) {
            foldersStore.put(entry)
        };

        metadataStore.put(metadata)
    }
}