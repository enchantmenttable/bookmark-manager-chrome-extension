const openEditorButton = document.getElementById("open-editor");
openEditorButton.addEventListener("click", () => {
    chrome.tabs.create({ url: "src/html/editor.html" });
})


//// save button
function saveSuccessDisplay() {
    saveButton.textContent = "Saved";
    saveButton.disabled = true;
}

function savePageInfo(url, title, thumbnail) {
    const dateAdded = Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date());

    chrome.storage.local.set({ [url]: { title: title, thumbnail: thumbnail, dateAdded: dateAdded } }, () => {
        saveSuccessDisplay();
    })
}

const saveButton = document.getElementById("save");
saveButton.addEventListener("click", () => {
    savePageInfo(popupUrl.value, popupTitle.value, popupThumbnail.src);
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


function displaySiteInfo(url, title, thumbnail) {
    popupThumbnail.setAttribute("src", thumbnail);
    popupTitle.textContent = title;
    popupUrl.textContent = url;
}

//// text area

function expandOnInput() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
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


popupUrl.addEventListener("click", () => {
    popupUrl.style.height = `${popupUrl.scrollHeight}px`;
}, { once: true });

//// -- //

(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["src/vendor/page-metadata-parser.bundle.js"]
    }, (result) => {
        const metadata = result[0].result;
        displaySiteInfo(metadata.url, metadata.title, metadata.image);
    })
})();