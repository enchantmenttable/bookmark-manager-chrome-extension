import * as utils from "./utilities.js";

async function readAllLocalStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, (data) => {
            if (data === {}) {
                reject("có gì đâu");
            } else {
                resolve(data);
            }
        })
    })
}

async function displayListings(rawData) {
    const listingContainter = document.getElementById("card-listing");
    const sidebar = document.getElementById("sidebar");

    const sidebarTemplate = await utils.getTemplate("../html/templates/sidebar.html");

    const cardTemplate = await utils.getTemplate("../html/templates/card.html");

    for (const [url, data] of Object.entries(rawData)) {
        if (url === "folders") continue;

        let href;
        if (url.indexOf("://") === -1) {
            href = `https://${url}`;
        } else {
            href = url;
        }

        const displayDomain = utils.getDomain(url);

        listingContainter.insertAdjacentHTML("beforeend", cardTemplate);

        const lastCard = listingContainter.lastChild;
        const cardElems = utils.getCardElems(lastCard);

        cardElems.thumbnail.src = data.thumbnail;
        cardElems.urlInput.value = href;
        cardElems.domainDisplayText.textContent = displayDomain;
        cardElems.folderDisplayText.textContent = data.folder;
        cardElems.dateAdded.textContent = data.dateAdded;
        cardElems.mainLink.href = href;

        cardElems.title.textContent = data.title;
        cardElems.title.style.height = `${cardElems.title.scrollHeight + 4}px`;

        cardElems.description.textContent = data.description;
        if (cardElems.description.textContent === "") {
            cardElems.description.style.display = "none"
        } else {
            cardElems.description.style.height = `${cardElems.description.scrollHeight + 4}px`;
        };

        utils.saveDataPrevValueAttr(cardElems);
    }
}

// setup card clicking behavior

function handleClick() {
    const isTextSelected = window.getSelection().toString();
    const mainLink = this.querySelector(".card-main-link");

    if (!isTextSelected) {
        mainLink.click();
    }
};

function setupCardUrlClickable() {
    const cards = document.querySelectorAll(".card");
    for (const card of cards) {
        card.addEventListener("click", handleClick);

        const clickableElems = Array.from(card.querySelectorAll(".clickable"));
        clickableElems.forEach((elem) => {
            elem.addEventListener("click", (e) => e.stopPropagation())
        });
    }
}



// card switch state

function switchToReadonlyMode(card) {
    card.addEventListener("click", handleClick);

    const cardElems = utils.getCardElems(card);

    for (const elem of [cardElems.title, cardElems.description]) {
        elem.classList.remove("edit-mode");
        elem.classList.add("readonly-mode");
        elem.readOnly = true;
    }

    cardElems.urlInput.style.display = "none";

    cardElems.domainDisplayText.style.display = "inline-block";

    cardElems.editButton.style.display = "inline-block";
    cardElems.deleteButton.style.display = "inline-block";

    cardElems.cancelButton.style.display = "none";
    cardElems.saveButton.style.display = "none";
}

function switchToEditMode(card) {
    card.removeEventListener("click", handleClick);

    const cardElems = utils.getCardElems(card);

    for (const elem of [cardElems.title, cardElems.description]) {
        elem.classList.add("edit-mode");
        elem.classList.remove("readonly-mode");
        elem.readOnly = false;
    };

    cardElems.urlInput.style.display = "inline-block";

    cardElems.domainDisplayText.style.display = "none";


    const cardDeleteButton = card.querySelector(".card-delete-button");
    const cardEditButton = card.querySelector(".card-edit-button");
    cardDeleteButton.style.display = "none";
    cardEditButton.style.display = "none";

    cardElems.cancelButton.style.display = "inline-block";
    cardElems.saveButton.style.display = "inline-block";
}


// delete button

function handleDeleteCard() {
    const card = this.parentElement.parentElement;
    const cardUrl = card.querySelector(".card-main-link").href;
    chrome.storage.local.remove(cardUrl);
    card.remove();
}

function setupDeleteButton() {
    const deleteButtons = document.querySelectorAll(".card-delete-button");
    for (const elem of deleteButtons) {
        elem.addEventListener("click", handleDeleteCard);
    };
}


// edit button

function handleEditButton() {
    const card = this.parentElement.parentElement;

    switchToEditMode(card);
}

function setupEditButton() {
    const editButtons = document.querySelectorAll(".card-edit-button");
    for (const elem of editButtons) {
        elem.addEventListener("click", handleEditButton);
    };
}


// cancel button

function handleCancelButton() {
    const card = this.parentElement.parentElement;

    const cardElems = utils.getCardElems(card);

    cardElems.title.value = cardElems.title.dataset.prevValue;
    cardElems.description.value = cardElems.description.dataset.prevValue;
    cardElems.urlInput.value = cardElems.urlInput.dataset.prevValue;

    switchToReadonlyMode(card);
}

function setupCancelButton() {
    const cancelButtons = document.querySelectorAll(".card-cancel-button");
    for (const elem of cancelButtons) {
        elem.addEventListener("click", handleCancelButton);
    };
}



// save button

function handleSaveButton() {
    const card = this.parentElement.parentElement;

    const cardElems = utils.getCardElems(card);

    const dateAdded = Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date());

    chrome.storage.local.remove(cardElems.mainLink.href);

    let fullUrl;
    if (cardElems.urlInput.value.indexOf("://") === -1) {
        fullUrl = `https://${cardElems.urlInput.value}`;
    } else {
        fullUrl = cardElems.urlInput.value;
    };

    chrome.storage.local.set({
        [fullUrl]: {
            title: cardElems.title.value,
            description: cardElems.description.value,
            thumbnail: cardElems.thumbnail.src,
            dateAdded: dateAdded
        }
    });

    cardElems.mainLink.href = fullUrl;
    cardElems.title.textContent = cardElems.title.value;
    cardElems.description.textContent = cardElems.description.value;
    cardElems.dateAdded.textContent = dateAdded;
    cardElems.domainDisplayText.textContent = utils.getDomain(fullUrl);

    utils.saveDataPrevValueAttr(cardElems);

    switchToReadonlyMode(card);
}

function setupSaveButton() {
    const saveButtons = document.querySelectorAll(".card-save-button");
    for (const elem of saveButtons) {
        elem.addEventListener("click", handleSaveButton);
    };
}



(async () => {
    const rawData = await readAllLocalStorage();
    console.log(rawData);
    await displayListings(rawData);
    setupCardUrlClickable();
    setupDeleteButton();
    setupEditButton();
    setupCancelButton();
    setupSaveButton();
})();