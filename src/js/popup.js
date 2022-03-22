import { readValueByIndex } from "./utilities.js";
import { readAllObjectStore } from "./utilities.js";
import { putItem } from "./utilities.js";

const mainPanel = document.getElementById("main-panel");

const popupThumbnail = document.getElementById("site-thumbnail");
const popupTitle = document.getElementById("site-title");
const popupUrl = document.getElementById("site-url");
const popupDescription = document.getElementById("site-description");

const folderSelectButton = document.getElementById("folder-select");
const openEditorButton = document.getElementById("open-editor");
const saveButton = document.getElementById("save");
const cancelButton = document.getElementById("cancel");

const textareas = document.getElementsByTagName("textarea");

const folderPanel = document.getElementById("folder-panel");
const folderListing = document.getElementById("folder-listing");
const backToMainButton = document.getElementById("back-to-main");
const addFolderButton = document.getElementById("add-folder");
const folderNameInput = document.getElementById("folder-name-input");
const folderDuplicateAlert = document.getElementById("folder-duplicate-alert");


// text area
function expandOnInput() {
    this.style.height = "auto";
    this.style.height = `${this.scrollHeight}px`;
}

function expandOnClick() {
    this.style.height = `${this.scrollHeight}px`;
    this.style.overflow = "hidden"
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

popupTitle.focus();

// folder select
folderSelectButton.onclick = function () {
    folderPanel.style.display = "block";
    mainPanel.style.display = "none";
};

backToMainButton.onclick = function () {
    folderPanel.style.display = "none";
    mainPanel.style.display = "block";
};

async function setupFolderButton() {
    const lastSelectedFolderQuery = await readValueByIndex("metadata", "name", "lastSelectedFolder");


    folderSelectButton.querySelector("span").textContent = lastSelectedFolderQuery[0].value;
}


// my bookmarks
openEditorButton.onclick = function () {
    chrome.tabs.create({ url: "src/html/editor.html" });
};


// save 
saveButton.onclick = function () {
    const dateAdded = Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date());
    const folderName = folderSelectButton.querySelector("span").textContent.replace(/^\s+|\s+$/g, '');
    const data = {
        url: popupUrl.value,
        title: popupTitle.value,
        thumbnail: popupThumbnail.src,
        description: popupDescription.value,
        dateAdded: dateAdded,
        folder: folderName
    };
    const request = indexedDB.open("mainDatabase", 1);

    request.onsuccess = function () {

        const db = request.result;

        const bookmarkStore = db.transaction("bookmarks", "readwrite").objectStore("bookmarks");

        bookmarkStore.put(data);
    };

    putItem("metadata", { name: "lastSelectedFolder", value: folderName });

    saveButton.textContent = "Saved";
    saveButton.disabled = true;
    setTimeout(() => {
        window.close();
    }, 300);
};


// Cancel
cancelButton.onclick = function () {
    window.close();
}


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

//folder panel

async function setupFolderListing() {
    const folders = await readAllObjectStore("folders");
    for (const folder of folders) {
        folderListing.insertAdjacentHTML("beforeend",
            `<div class="folder-item">
                <i class="bi bi-folder-fill"></i>
                <span class="folder-item-name">${folder.name}</span>
            </div>`);

        const lastFolderItem = folderListing.lastChild;
        lastFolderItem.onclick = selectFolder;
    }
}

function selectFolder() {
    folderSelectButton.querySelector("span").textContent = this.querySelector(".folder-item-name").textContent;
    folderPanel.style.display = "none";
    mainPanel.style.display = "block";
}

addFolderButton.onclick = function () {
    addFolderButton.style.display = "none";
    folderNameInput.style.display = "inline-block";
    folderNameInput.focus();
};

folderNameInput.onkeydown = function (e) {
    const newFolder = folderNameInput.value.replace(/^\s+|\s+$/g, '');
    const currentFolderItems = document.querySelectorAll(".folder-item-name");

    let currentFolderNames = [];
    for (const item of currentFolderItems) {
        currentFolderNames.push(item.textContent);
    }

    if (e.key === "Enter") {
        if (currentFolderNames.includes(newFolder)) {
            folderDuplicateAlert.style.display = "inline-block";
        } else {
            folderNameInput.style.display = "none";
            addFolderButton.style.display = "inline-block";
            folderDuplicateAlert.style.display = "none";

            folderListing.insertAdjacentHTML("afterbegin",
                `<div class="folder-item">
                <i class="bi bi-folder-fill"></i>
                <span class="folder-item-name">${newFolder}</span>
            </div>`);

            const newFolderItem = folderListing.firstChild;

            putItem("folders", { name: newFolder });

            newFolderItem.onclick = selectFolder;

            folderNameInput.value = "";
        }
    } else if (e.key === "Escape") {
        e.preventDefault();

        folderNameInput.style.display = "none";
        addFolderButton.style.display = "inline-block";
        folderDuplicateAlert.style.display = "none";

        folderNameInput.value = "";
    }
};


(async function () {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["src/vendor/page-metadata-parser.bundle.js"]
    }, (result) => {
        const metadata = result[0].result;
        displaySiteInfo(metadata.url, metadata.title, metadata.image, metadata.description);
        popupTitle.style.height = `${popupTitle.scrollHeight}px`
    });

    await setupFolderButton();
    await setupFolderListing();
})();