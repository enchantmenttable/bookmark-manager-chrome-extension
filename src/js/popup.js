import {readIndexedDB} from "./utilities.js";

const popupThumbnail = document.getElementById("site-thumbnail");
const popupTitle = document.getElementById("site-title");
const popupUrl = document.getElementById("site-url");
const popupDescription = document.getElementById("site-description");
const popupFolderDropdown = document.getElementById("folder-dropdown");

const openEditorButton = document.getElementById("open-editor");
const saveButton = document.getElementById("save");
const cancelButton = document.getElementById("cancel");
const textareas = document.getElementsByTagName("textarea");
const folderDropdown = document.getElementById("folder-dropdown");

// text area

function expandOnInput() {
    this.style.height = "auto";
    this.style.height = `${this.scrollHeight}px`;
}

function expandOnClick() {
    this.style.height = `${this.scrollHeight}px`;
}

function preventNewline(e) {
    if (e.keyCode === 13) {
        e.preventDefault();
    }
}

for (const elem of textareas) {
    elem.addEventListener("input", expandOnInput);
    elem.addEventListener("keydown", preventNewline);
}

for (const elem of [popupDescription, popupUrl]) {
    elem.addEventListener("click", expandOnClick, { once: true });
}


// folder dropdown
async function populateFolderOptions() {
    const folders = await readIndexedDB("folders", true);
    folderDropdown.textContent = folders;
}


// my bookmarks
openEditorButton.addEventListener("click", () => {
    chrome.tabs.create({ url: "src/html/editor.html" });
})


// save 

function saveSuccessDisplay() {
    saveButton.textContent = "Saved";
    saveButton.disabled = true;
}

function saveSiteInfo(url, title, thumbnail, description, folder, dateAdded) {
    const request = indexedDB.open("mainDatabase", 1);

    request.onsuccess = function () {
        const db = request.result;

        const transaction = db.transaction("bookmarks", "readwrite");

        const objectStore = transaction.objectStore("bookmarks");

        objectStore.put()
    }

    chrome.storage.local.set({
        [url]: {
            title: title,
            thumbnail: thumbnail,
            description: description,
            dateAdded: dateAdded,
            folder: folder
        }
    }, () => {
        saveSuccessDisplay();
    })
}

saveButton.addEventListener("click", () => {
    const dateAdded = Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date());

    saveSiteInfo(popupUrl.value, popupTitle.value, popupThumbnail.src, popupDescription.value, popupFolderDropdown.value, dateAdded);
});


// Cancel
cancelButton.addEventListener("click", () => {
    window.close();
})


// display info
function displaySiteInfo(url, title, thumbnail, description) {
    if (thumbnail === undefined) {
        popupThumbnail.setAttribute("src", "/src/images/bookmark-icon.png");
    } else {
        popupThumbnail.setAttribute("src", thumbnail);
    }
    popupTitle.textContent = title;
    popupUrl.textContent = url;
    popupDescription.textContent = description;
}



(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await populateFolderOptions();

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["src/vendor/page-metadata-parser.bundle.js"]
    }, (result) => {
        const metadata = result[0].result;
        displaySiteInfo(metadata.url, metadata.title, metadata.image, metadata.description);
        popupTitle.style.height = `${popupTitle.scrollHeight}px`
    });

})();