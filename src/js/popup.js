const openEditorButton = document.getElementById("open-editor");
openEditorButton.addEventListener("click", () => {
    chrome.tabs.create({ url: "src/html/editor.html" });
})

//// save 

function saveSuccessDisplay() {
    saveButton.textContent = "Saved";
    saveButton.disabled = true;
}

function saveSiteInfo(url, title, thumbnail, description) {
    const dateAdded = Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date());

    chrome.storage.local.set({
        [url]: {
            title: title,
            thumbnail: thumbnail,
            description: description,
            dateAdded: dateAdded
            // folder: folder
        }
    }, () => {
        saveSuccessDisplay();
    })
}

const saveButton = document.getElementById("save");
saveButton.addEventListener("click", () => {
    saveSiteInfo(popupUrl.value, popupTitle.value, popupThumbnail.src, popupDescription.value);
});

// -- //

//// Cancel
const cancelButton = document.getElementById("cancel");
cancelButton.addEventListener("click", () => {
    window.close();
})

// -- //

const popupThumbnail = document.getElementById("site-thumbnail");
const popupTitle = document.getElementById("site-title");
const popupUrl = document.getElementById("site-url");
const popupDescription = document.getElementById("site-description");


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

//// text area

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

const textareas = document.getElementsByTagName("textarea");
for (const elem of textareas) {
    elem.addEventListener("input", expandOnInput);
    elem.addEventListener("keydown", preventNewline);
}

for (const elem of [popupDescription, popupUrl]) {
    elem.addEventListener("click", expandOnClick, { once: true });
}
//// -- //

(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["src/vendor/page-metadata-parser.bundle.js"]
    }, (result) => {
        const metadata = result[0].result;
        displaySiteInfo(metadata.url, metadata.title, metadata.image, metadata.description);
        popupTitle.style.height = `${popupTitle.scrollHeight}px`
    })
})();