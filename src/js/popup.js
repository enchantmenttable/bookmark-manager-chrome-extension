async function readCurrentSiteInfo() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            resolve([tabs[0].url, tabs[0].title, `https://www.google.com/s2/favicons?domain=${tabs[0].url}&sz=64`]);
        })
    })
}

function savePageInfo(url, title) {
    chrome.storage.local.set({ [url]: title }, (data) => {
        alert("yo");
    })
}


const saveButton = document.getElementById("save");
saveButton.addEventListener("click", () => {
    savePageInfo(tabUrl, tabTitle);
});

const openEditorButton = document.getElementById("open-editor");
openEditorButton.addEventListener("click", () => {
    chrome.tabs.create({ url: "src/html/editor.html" });
})

function displaySiteInfo(tabUrl, tabTitle, tabFavIconURL, siteInfoContainer) {
    const siteFavIcon = siteInfoContainer.querySelector("#site-fav-icon");
    const siteTitle = siteInfoContainer.querySelector("#site-title");
    const siteUrl = siteInfoContainer.querySelector("#site-url");

    siteFavIcon.setAttribute("src", tabFavIconURL);
    siteTitle.textContent = tabTitle;
    siteUrl.setAttribute("value", tabUrl);

}

async function init() {
    let tabInfo = await readCurrentSiteInfo();
    const siteInfoContainer = document.getElementById("site-info-container");
    displaySiteInfo(tabInfo[0], tabInfo[1], tabInfo[2], siteInfoContainer);
}

init();


