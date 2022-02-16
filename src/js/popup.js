async function readCurrentSiteInfo() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            resolve([tabs[0].url, tabs[0].title]);
        })
    })
}

function savePageInfo(url, title) {
    chrome.storage.local.set({ [url]: title })
}

let tabUrl, tabTitle;
async function init() {
    let tabInfo = await readCurrentSiteInfo();
    tabUrl = tabInfo[0];
    tabTitle = tabInfo[1];
}

const saveButton = document.getElementById("save");
saveButton.addEventListener("click", () => {
    savePageInfo(tabUrl, tabTitle);
});

const openEditorButton = document.getElementById("open-editor");
openEditorButton.addEventListener("click", () => {
    chrome.tabs.create({ url: "src/html/editor.html" });
})

init();