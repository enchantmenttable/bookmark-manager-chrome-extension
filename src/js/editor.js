import * as utils from "./utilities.js";

const addFolderButton = document.getElementById("add-folder");
const folderNameInput = document.getElementById("folder-name-input");
const folderDuplicateAlert = document.getElementById("folder-duplicate-alert");
const sidebarFolderListing = document.getElementById("sidebar-folder-listing");
const allBookmarkButton = document.getElementById("all-bookmark");

// sidebar
async function setupSidebar() {
    const folders = await utils.readAllObjectStore("folders");

    for (const folder of folders) {
        sidebarFolderListing.insertAdjacentHTML("beforeend",
            `<li class="nav-item sidebar-folder-item" data-folder="${folder.name}">
                <span data-folder="${folder.name}" class="nav-link link-dark">
                    ${folder.name}
                </span>
                <span class="item-count"></span>
            </li>`);
        const item = sidebarFolderListing.lastChild;
        item.onclick = navigateTo;
        item.onmouseover = darkenOnMouseOver;
        item.onmouseout = lightenOnMouseOut;
    };

    allBookmarkButton.onclick = async function () {
        const data = await utils.readAllObjectStore("bookmarks");
        setupCards(data);
    };
    allBookmarkButton.onmouseover = darkenOnMouseOver;
    allBookmarkButton.onmouseout = lightenOnMouseOut;
}

function darkenOnMouseOver() {
    this.style.backgroundColor = "rgba(0,0,0,0.05)"
}

function lightenOnMouseOut() {
    this.style.backgroundColor = "rgba(0,0,0,0)"
}

addFolderButton.onclick = function () {
    addFolderButton.style.display = "none";
    folderNameInput.style.display = "inline-block";
    folderNameInput.focus();
}

folderNameInput.onkeydown = async function (e) {
    const newFolder = folderNameInput.value.trim();
    const folders = await utils.readAllObjectStore("folders");

    let currentFolderNames = [];
    for (const folder of folders) {
        currentFolderNames.push(folder.name);
    }

    if (e.key === "Enter") {
        if (currentFolderNames.includes(newFolder)) {
            folderDuplicateAlert.style.display = "block";
        } else {
            folderNameInput.style.display = "none";
            addFolderButton.style.display = "inline-block";
            folderDuplicateAlert.style.display = "none";

            sidebarFolderListing.insertAdjacentHTML("afterbegin",
                `<li class="nav-item sidebar-folder-item" data-folder="${newFolder}">
                    <span data-folder="${newFolder}" class="nav-link link-dark">
                        ${newFolder}
                    </span>
                </li>`)

            utils.putItem("folders", { name: newFolder });

            folderNameInput.value = "";
        }
    } else if (e.key === "Escape") {
        e.preventDefault();

        folderNameInput.style.display = "none";
        addFolderButton.style.display = "inline-block";
        folderDuplicateAlert.style.display = "none";

        folderNameInput.value = "";
    }
}

async function navigateTo(e) {
    const folderName = e.currentTarget.dataset.folder;
    const data = await utils.readValueByIndex("bookmarks", "folder", folderName);
    setupCards(data);
}

// main content

async function setupCards(data) {
    const listingContainter = document.getElementById("card-listing");

    listingContainter.innerHTML = "";

    const cardTemplate = await utils.getTemplate("../html/templates/card.html");

    for (const entry of data) {
        listingContainter.insertAdjacentHTML("beforeend", cardTemplate);

        let href;
        if (entry.url.indexOf("://") === -1) {
            href = `https://${entry.url}`;
        } else {
            href = entry.url;
        }

        const displayDomain = utils.getDomain(entry.url);

        const lastCard = listingContainter.lastChild;
        const cardElems = utils.getCardElems(lastCard);

        cardElems.thumbnail.src = entry.thumbnail;
        cardElems.urlInput.value = href;
        cardElems.domainDisplayText.textContent = displayDomain;
        cardElems.dateAdded.textContent = entry.dateAdded;
        cardElems.mainLink.href = href;

        const folderInfo = await utils.readAllObjectStore("folders");
        for (const folderOption of folderInfo) {
            cardElems.folder.insertAdjacentHTML("beforeend", `<option>${folderOption.name}</option>`)
        }
        cardElems.folder.value = entry.folder;
        cardElems.folderDisplay.textContent = entry.folder;

        cardElems.title.textContent = entry.title;
        cardElems.title.style.height = `${cardElems.title.scrollHeight + 4}px`;

        cardElems.description.textContent = entry.description;
        if (cardElems.description.textContent === "") {
            cardElems.description.style.display = "none"
        } else {
            cardElems.description.style.height = `${cardElems.description.scrollHeight + 4}px`;
        };

        // setup event listeners

        lastCard.addEventListener("click", handleClick);
        limitClickable(lastCard);

        cardElems.saveButton.onclick = handleSaveButton;
        cardElems.cancelButton.onclick = handleCancelButton;
        cardElems.deleteButton.onclick = handleDeleteButton;
        cardElems.editButton.onclick = handleEditButton;
        cardElems.title.oninput = expandOnInput;
        cardElems.description.oninput = expandOnInput;

        utils.saveDataPrevValueAttr(cardElems);

        // setup hover

        lastCard.addEventListener("mouseover", handleCardOnMouseOver);
        lastCard.addEventListener("mouseout", handleCardOnMouseOut);
    }
}

function handleCardOnMouseOver() {
    const cardElems = utils.getCardElems(this);
    cardElems.editButton.style.display = "inline-block";
    cardElems.deleteButton.style.display = "inline-block";
    this.style.filter = "brightness(.93)";
}

function handleCardOnMouseOut() {
    const cardElems = utils.getCardElems(this);
    cardElems.editButton.style.display = "none";
    cardElems.deleteButton.style.display = "none";
    this.style.filter = "brightness(1)";
}

function expandOnInput() {
    this.style.height = "auto";
    this.style.height = `${this.scrollHeight}px`;
}

function handleClick() {
    const isTextSelected = window.getSelection().toString();
    const mainLink = this.querySelector(".card-main-link");

    if (!isTextSelected) {
        mainLink.click();
    }
}

function limitClickable(card) {
    const clickableElems = Array.from(card.querySelectorAll(".clickable"));
    clickableElems.forEach((elem) => {
        elem.addEventListener("click", (e) => e.stopPropagation())
    });
}

function switchToReadonlyMode(card) {
    card.querySelector(".edit-mode-button-panel").style.display = "none";
    card.querySelector(".readonly-mode-button-panel").style.display = "inline-block";
    card.addEventListener("click", handleClick);
    card.addEventListener("mouseout", handleCardOnMouseOut);
    card.addEventListener("mouseover", handleCardOnMouseOver);

    const cardElems = utils.getCardElems(card);

    for (const elem of [cardElems.title, cardElems.description]) {
        elem.classList.remove("edit-mode");
        elem.readOnly = true;
    }

    cardElems.urlInput.style.display = "none";
    cardElems.domainDisplayText.style.display = "inline-block";
    cardElems.folder.style.display = "none";
    cardElems.folderDisplay.style.display = "inline-block";
}

function switchToEditMode(card) {
    card.querySelector(".readonly-mode-button-panel").style.display = "none";
    card.querySelector(".edit-mode-button-panel").style.display = "inline-block";
    card.removeEventListener("click", handleClick);

    card.removeEventListener("mouseout", handleCardOnMouseOut);
    card.removeEventListener("mouseover", handleCardOnMouseOver);
    card.style.filter = "brightness(1)";

    const cardElems = utils.getCardElems(card);

    for (const elem of [cardElems.title, cardElems.description]) {
        elem.classList.add("edit-mode");
        elem.readOnly = false;
    };

    cardElems.urlInput.style.display = "inline-block";
    cardElems.domainDisplayText.style.display = "none";
    cardElems.folder.style.display = "inline-block";
    cardElems.folderDisplay.style.display = "none";
}

function handleEditButton() {
    const card = this.closest(".card");
    switchToEditMode(card);
}

function handleDeleteButton() {
    const card = this.closest(".card");
    const key = card.querySelector(".card-main-link").href;

    utils.deleteItem("bookmarks", key);

    card.remove();
}

function handleCancelButton() {
    const card = this.closest(".card");

    const cardElems = utils.getCardElems(card);

    cardElems.title.value = cardElems.title.dataset.prevValue;
    cardElems.description.value = cardElems.description.dataset.prevValue;
    cardElems.urlInput.value = cardElems.urlInput.dataset.prevValue;
    cardElems.folder.value = cardElems.folder.dataset.prevValue;

    switchToReadonlyMode(card);
}

async function handleSaveButton() {
    const card = this.closest(".card");

    const cardElems = utils.getCardElems(card);
    const oldUrl = cardElems.mainLink.href;
    const dateAdded = Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date());

    let fullNewUrl;
    if (!((cardElems.urlInput.value.indexOf("http://") !== -1)
        || (cardElems.urlInput.value.indexOf("https://") !== -1))) {
        fullNewUrl = `https://${cardElems.urlInput.value}`;
    } else {
        fullNewUrl = cardElems.urlInput.value;
    };

    const data = {
        url: fullNewUrl,
        title: cardElems.title.value,
        description: cardElems.description.value,
        thumbnail: cardElems.thumbnail.src,
        dateAdded: dateAdded,
        folder: cardElems.folder.value.replace(/^\s+|\s+$/g, '')
    }

    cardElems.mainLink.href = fullNewUrl;
    cardElems.title.textContent = cardElems.title.value;
    cardElems.description.textContent = cardElems.description.value;
    cardElems.dateAdded.textContent = dateAdded;
    cardElems.domainDisplayText.textContent = utils.getDomain(fullNewUrl);
    cardElems.folderDisplay.textContent = cardElems.folder.value;

    utils.saveDataPrevValueAttr(cardElems);

    utils.deleteItem("bookmarks", oldUrl);
    utils.putItem("bookmarks", data);

    switchToReadonlyMode(card);

};

(async function () {
    const data = await utils.readAllObjectStore("bookmarks");
    await setupSidebar();
    await setupCards(data);
})();