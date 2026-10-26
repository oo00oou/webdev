// Remember the guitar that the visitor selected.
var selectedGuitar = "Not sure yet";
var popup = document.getElementById("popup");
var menuButton = document.getElementById("menu-button");
var lastPopupButton;

// Open or close the curtain menu.
function toggleCurtainMenu() {
    if (document.body.classList.contains("curtain-open")) {
        closeCurtainMenu();
        menuButton.focus();
    } else {
        document.body.classList.add("curtain-open");
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Close curtain menu");
        document.querySelector("#menu a").focus();
    }
}

function closeCurtainMenu() {
    document.body.classList.remove("curtain-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open curtain menu");
}

// Show the requested section inside the popup.
function openPopup(sectionId) {
    if (!popup.open) {
        lastPopupButton = document.activeElement;

        // On a phone, the navigation links disappear when the menu closes.
        if (document.body.classList.contains("curtain-open")) {
            lastPopupButton = menuButton;
        }
    }

    closeCurtainMenu();

    var sections = document.querySelectorAll(".popup-section");
    for (var i = 0; i < sections.length; i++) {
        sections[i].hidden = true;
    }

    document.getElementById(sectionId).hidden = false;
    popup.setAttribute("aria-labelledby", sectionId + "-title");
    document.body.classList.add("popup-open");

    if (!popup.open) {
        popup.showModal();
    }

    popup.scrollTop = 0;
    document.querySelector(".close-button").focus();
}

function closePopup() {
    popup.close();
}

// This also runs when the visitor presses Escape to close the popup.
function popupClosed() {
    document.body.classList.remove("popup-open");
    if (lastPopupButton) {
        lastPopupButton.focus();
    }
}

// Change the popup picture and description for each guitar.
function showGuitar(name) {
    selectedGuitar = name;
    document.getElementById("guitar-title").textContent = name;

    var picture = document.getElementById("guitar-picture");
    var image = document.getElementById("guitar-image");
    var description = document.getElementById("guitar-description");

    if (name === "CL-30") {
        picture.className = "guitar-photo small-guitar popup-photo";
        image.src = "assets/1.png"
        image.alt = "A small spruce acoustic guitar";
        description.textContent = "A small, comfortable guitar for lighter playing and quiet sessions.";
    } else if (name === "SD-100") {
        picture.className = "guitar-photo om-guitar popup-photo";
        image.src = "assets/2.png"
        image.alt = "The dark wooden back of an OM guitar";
        description.textContent = "A versatile guitar with a balanced body size, suited to fingerstyle and chords.";
    } else {
        picture.className = "guitar-photo dreadnought-guitar popup-photo";
        image.src = "assets/3.png"
        image.alt = "3.png";
        description.textContent = "A larger guitar for full chords and strong strumming.";
    }

    openPopup("guitar");
}

// Go to the build page. If a guitar was chosen, the build page starts with that body picked.
function openCommission(name) {
    if (name && name !== "Not sure yet") {
        window.location.href = "build.html?body=" + encodeURIComponent(name);
    } else {
        window.location.href = "build.html";
    }
}


// ---------- gallery page ----------

// Which photo is open in the viewer, counted among the photos that are showing.
var photoNumber = 0;

// Show only the photos in one category ("all" shows every photo).
function filterGallery(category, clickedButton) {
    var items = document.querySelectorAll(".gallery-grid li");
    var showing = 0;

    for (var i = 0; i < items.length; i++) {
        var match = category === "all" || items[i].dataset.category === category;
        items[i].hidden = !match;
        if (match) {
            showing = showing + 1;
        }
    }

    // Switch on the button that was clicked and switch off the others.
    var buttons = document.querySelectorAll(".filters button");
    for (var j = 0; j < buttons.length; j++) {
        buttons[j].setAttribute("aria-pressed", buttons[j] === clickedButton ? "true" : "false");
    }

    // The big feature tile only makes sense when every photo is showing.
    document.querySelector(".gallery-grid").classList.toggle("filtered", category !== "all");

    var count = document.getElementById("gallery-count");
    if (category === "all") {
        count.textContent = "Showing all " + showing + " photos";
    } else {
        count.textContent = "Showing " + showing + " of " + items.length + " photos";
    }
}

// The photo buttons that are not hidden by a filter.
function shownPhotos() {
    return document.querySelectorAll(".gallery-grid li:not([hidden]) .gallery-item");
}

// Open the viewer on the photo that was clicked.
function openPhoto(clickedPhoto) {
    var photos = shownPhotos();
    for (var i = 0; i < photos.length; i++) {
        if (photos[i] === clickedPhoto) {
            photoNumber = i;
        }
    }

    showPhoto();
    openPopup("photo");
}

// Copy the picture, name and caption from the tile into the viewer.
function showPhoto() {
    var photos = shownPhotos();
    var tile = photos[photoNumber];
    var tileImage = tile.querySelector("img");
    var image = document.getElementById("photo-image");

    document.getElementById("photo-title").textContent = tile.querySelector(".gallery-title").textContent;
    image.hidden = false;
    image.src = tileImage.getAttribute("src");
    image.alt = tileImage.alt;
    document.getElementById("photo-caption").textContent = tile.dataset.caption;
    document.getElementById("photo-count").textContent = (photoNumber + 1) + " of " + photos.length;
}

// step is 1 for the next photo and -1 for the previous one. It wraps round at the ends.
function nextPhoto(step) {
    var total = shownPhotos().length;
    photoNumber = (photoNumber + step + total) % total;
    showPhoto();
}

// The left and right arrow keys flick through photos while the viewer is open.
// The home page has no viewer, so this only runs on the gallery page.
if (document.getElementById("photo")) {
    popup.addEventListener("keydown", function (event) {
        if (document.getElementById("photo").hidden) {
            return;
        }
        if (event.key === "ArrowRight") {
            nextPhoto(1);
        } else if (event.key === "ArrowLeft") {
            nextPhoto(-1);
        }
    });
}


// ---------- build page ----------

// The radio button that is checked in one group: "body", "finish" or "hardware".
function checkedOption(groupName) {
    return document.querySelector('#build-form input[name="' + groupName + '"]:checked');
}

// Turn a number like 3450 into "$3,450".
function formatPrice(amount) {
    return "$" + amount.toLocaleString("en-NZ");
}

// Add up the price of the three choices.
function buildTotal() {
    return Number(checkedOption("body").dataset.price)
         + Number(checkedOption("finish").dataset.price)
         + Number(checkedOption("hardware").dataset.price);
}

// Runs every time something on the build form changes.
function updateBuild() {
    var body = checkedOption("body");
    var finish = checkedOption("finish");
    var hardware = checkedOption("hardware");
    var preview = document.getElementById("guitar-preview");

    // Show the body shape, bridge and strings for the chosen body, and hide the others.
    var parts = preview.querySelectorAll("[data-body]");
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].dataset.body === body.value) {
            parts[i].removeAttribute("hidden");
        } else {
            parts[i].setAttribute("hidden", "");
        }
    }

    // Change the two colours in the drawing.
    preview.style.setProperty("--finish", finish.dataset.fill);
    preview.style.setProperty("--hardware", hardware.dataset.colour);

    // The text a screen reader reads for the drawing.
    document.getElementById("preview-title").textContent =
        body.value + " guitar, " + finish.value + " finish, " + hardware.value + " hardware";

    // Summary under the drawing.
    document.getElementById("build-name").textContent = body.value;
    document.getElementById("summary-body").textContent = body.dataset.name;
    document.getElementById("summary-finish").textContent = finish.value;
    document.getElementById("summary-hardware").textContent = hardware.value;

    // The price is shown in two places, so update every element with the build-price class.
    var prices = document.querySelectorAll(".build-price");
    for (var j = 0; j < prices.length; j++) {
        prices[j].textContent = formatPrice(buildTotal());
    }

    // If an enquiry was already prepared or the build was saved, those messages are out of date now.
    document.getElementById("enquiry-result").hidden = true;
    document.getElementById("save-message").textContent = "";
}

// Runs when the visitor presses "Prepare my enquiry".
// The browser checks the name and email first because they are marked required.
function prepareEnquiry(event) {
    event.preventDefault();   // stop the form reloading the page

    var body = checkedOption("body");
    var notes = document.getElementById("customer-notes").value.trim();

    var text = "Guitar Tech build enquiry\n\n"
        + "Name: " + document.getElementById("customer-name").value.trim() + "\n"
        + "Email: " + document.getElementById("customer-email").value.trim() + "\n\n"
        + "Body: " + body.value + " (" + body.dataset.name + ")\n"
        + "Finish: " + checkedOption("finish").value + "\n"
        + "Hardware: " + checkedOption("hardware").value + "\n"
        + "Estimated price: " + formatPrice(buildTotal()) + " NZD\n\n"
        + "Notes: " + (notes === "" ? "None" : notes);

    document.getElementById("enquiry-text").value = text;
    document.getElementById("copy-message").textContent = "";

    var result = document.getElementById("enquiry-result");
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("enquiry-text").focus();
}

// Copy the enquiry so the visitor can paste it into an email.
function copyEnquiry() {
    var text = document.getElementById("enquiry-text");
    var message = document.getElementById("copy-message");
    text.select();

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text.value).then(function () {
            message.textContent = "Copied. Paste it into an email to the workshop.";
        }, function () {
            message.textContent = "The text is selected. Press Ctrl+C (Cmd+C on a Mac) to copy it.";
        });
    } else {
        message.textContent = "The text is selected. Press Ctrl+C (Cmd+C on a Mac) to copy it.";
    }
}

// Save the current build to the account of whoever is logged in.
function saveBuild() {
    var message = document.getElementById("save-message");
    var user = currentUser();

    if (!user) {
        // This text is always the same, so it is safe to write it as HTML.
        message.innerHTML = 'You need to be logged in to save builds. <a href="login.html">Log in</a>';
        return;
    }

    user.builds.push({
        id: String(Date.now()),
        body: checkedOption("body").value,
        finish: checkedOption("finish").value,
        hardware: checkedOption("hardware").value,
        price: buildTotal(),
        saved: new Date().toISOString()
    });
    updateUser(user);
    message.innerHTML = 'Saved. <a href="account.html">See it in My Account</a>';
}


// ---------- accounts ----------
//
// This is a demo. A real website keeps accounts on a server.
// Here every account is kept in the visitor's own browser using localStorage,
// so it only works on the computer and browser where the account was made.
//
// "gt-users"   holds every account, looked up by email address.
// "gt-current" holds the email of the person who is logged in.

// Read all the accounts. If there are none yet (or the browser blocks storage) use an empty list.
function loadUsers() {
    try {
        return JSON.parse(localStorage.getItem("gt-users")) || {};
    } catch (error) {
        return {};
    }
}

function saveUsers(users) {
    try {
        localStorage.setItem("gt-users", JSON.stringify(users));
        return true;
    } catch (error) {
        return false;
    }
}

// The account of the person who is logged in, or null if nobody is.
function currentUser() {
    var email = null;
    try {
        email = localStorage.getItem("gt-current");
    } catch (error) {
        return null;
    }
    if (!email) {
        return null;
    }
    return loadUsers()[email] || null;
}

// Save changes to one account.
function updateUser(user) {
    var users = loadUsers();
    users[user.email] = user;
    return saveUsers(users);
}

function setCurrentUser(email) {
    try {
        localStorage.setItem("gt-current", email);
    } catch (error) {
        // storage is blocked, nothing else we can do
    }
}

function logOut() {
    try {
        localStorage.removeItem("gt-current");
    } catch (error) {
        // storage is blocked, nothing to remove
    }
    window.location.href = "index.html";
}

// Turn the password into a scrambled code called a hash, so the real password is never saved.
// The same password always gives the same hash, so we can compare hashes when someone logs in.
// Real websites do this on the server with a slower hash. crypto.subtle only works on https,
// localhost or a file opened straight from the computer.
function hashPassword(email, password) {
    var data = new TextEncoder().encode(email + ":" + password);
    return crypto.subtle.digest("SHA-256", data).then(function (buffer) {
        var bytes = new Uint8Array(buffer);
        var hash = "";
        for (var i = 0; i < bytes.length; i++) {
            hash = hash + bytes[i].toString(16).padStart(2, "0");
        }
        return hash;
    });
}

function canHashPasswords() {
    return window.crypto && window.crypto.subtle;
}

// Show an error under a form, or hide it when text is "".
function showFormMessage(id, text) {
    var message = document.getElementById(id);
    message.textContent = text;
    message.hidden = text === "";
}


// ---------- log in page ----------

// Switch between the "Log in" and "Create account" tabs.
function showLoginTab(name) {
    var tabs = ["login", "create"];
    for (var i = 0; i < tabs.length; i++) {
        var isOpen = tabs[i] === name;
        var tab = document.getElementById(tabs[i] + "-tab");
        tab.setAttribute("aria-selected", isOpen ? "true" : "false");
        document.getElementById(tabs[i] + "-panel").hidden = !isOpen;
    }
    showFormMessage("login-message", "");
    showFormMessage("create-message", "");
    document.querySelector("#" + name + "-panel input").focus();
}

// The Show / Hide button next to a password box.
function togglePassword(button) {
    var input = document.getElementById(button.getAttribute("aria-controls"));
    if (input.type === "password") {
        input.type = "text";
        button.textContent = "Hide";
    } else {
        input.type = "password";
        button.textContent = "Show";
    }
}

function logIn(event) {
    event.preventDefault();
    var email = document.getElementById("login-email").value.trim().toLowerCase();
    var password = document.getElementById("login-password").value;
    var user = loadUsers()[email];

    if (!canHashPasswords()) {
        showFormMessage("login-message", "Logging in needs the site to be opened over https or from your computer.");
        return;
    }

    hashPassword(email, password).then(function (hash) {
        // Use the same message for a wrong email and a wrong password,
        // so nobody can use this form to find out who has an account.
        if (!user || user.passwordHash !== hash) {
            showFormMessage("login-message", "That email and password don't match an account.");
            return;
        }
        setCurrentUser(email);
        window.location.href = "account.html";
    });
}

function createAccount(event) {
    event.preventDefault();
    var name = document.getElementById("create-name").value.trim();
    var email = document.getElementById("create-email").value.trim().toLowerCase();
    var password = document.getElementById("create-password").value;
    var users = loadUsers();

    if (password !== document.getElementById("create-confirm").value) {
        showFormMessage("create-message", "The two passwords are different. Please type them again.");
        return;
    }
    if (users[email]) {
        showFormMessage("create-message", "There is already an account with that email. Try logging in.");
        return;
    }
    if (!canHashPasswords()) {
        showFormMessage("create-message", "Making an account needs the site to be opened over https or from your computer.");
        return;
    }

    hashPassword(email, password).then(function (hash) {
        users[email] = {
            name: name,
            email: email,
            phone: "",
            passwordHash: hash,
            joined: new Date().toISOString(),
            builds: []
        };
        if (!saveUsers(users)) {
            showFormMessage("create-message", "Your browser is blocking saved data, so the account can't be made.");
            return;
        }
        setCurrentUser(email);
        window.location.href = "account.html";
    });
}


// ---------- account page ----------

// "Janssen Bautista" becomes "JB".
function initials(name) {
    var words = name.trim().split(/\s+/);
    var letters = words[0].charAt(0);
    if (words.length > 1) {
        letters = letters + words[words.length - 1].charAt(0);
    }
    return letters.toUpperCase();
}

// Turn a saved date into something like "27 October 2026".
function niceDate(isoDate) {
    return new Date(isoDate).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" });
}

// Fill in the account page with the details of whoever is logged in.
function showAccount(user) {
    var firstName = user.name.trim().split(/\s+/)[0];

    document.getElementById("greeting-name").textContent = firstName;
    document.getElementById("account-initials").textContent = initials(user.name);
    document.getElementById("account-name").textContent = user.name;
    document.getElementById("account-email").textContent = user.email;
    document.getElementById("account-since").textContent = "Member since " + niceDate(user.joined);

    document.getElementById("details-name").value = user.name;
    document.getElementById("details-email").value = user.email;
    document.getElementById("details-phone").value = user.phone;

    showSavedBuilds(user);
}

// Make one card for each saved build by copying the <template> in account.html.
function showSavedBuilds(user) {
    var list = document.getElementById("saved-builds");
    var template = document.getElementById("build-card-template");
    var count = user.builds.length;

    list.textContent = "";   // remove the old cards
    document.getElementById("no-builds").hidden = count > 0;
    document.getElementById("builds-count").textContent = count + (count === 1 ? " build" : " builds");

    // Newest first.
    for (var i = count - 1; i >= 0; i--) {
        var build = user.builds[i];
        var card = template.content.cloneNode(true);

        // "Tobacco burst" uses the "tobacco" swatch colour from styles.css.
        card.querySelector(".saved-swatch").classList.add(build.finish.split(" ")[0].toLowerCase());
        card.querySelector(".saved-name").textContent = build.body;
        card.querySelector(".saved-info").textContent = build.finish + " finish · " + build.hardware + " hardware";
        card.querySelector(".saved-date").textContent = "Saved " + niceDate(build.saved);
        card.querySelector(".saved-price").textContent = formatPrice(build.price);
        card.querySelector(".saved-open").href = "build.html?body=" + encodeURIComponent(build.body)
            + "&finish=" + encodeURIComponent(build.finish)
            + "&hardware=" + encodeURIComponent(build.hardware);
        card.querySelector(".saved-remove").dataset.id = build.id;
        card.querySelector(".saved-remove").setAttribute("aria-label", "Remove " + build.body + " in " + build.finish);

        list.appendChild(card);
    }
}

function removeBuild(button) {
    var user = currentUser();
    var kept = [];
    for (var i = 0; i < user.builds.length; i++) {
        if (user.builds[i].id !== button.dataset.id) {
            kept.push(user.builds[i]);
        }
    }
    user.builds = kept;
    updateUser(user);
    showSavedBuilds(user);
    document.getElementById("builds-heading").focus();
}

function saveDetails(event) {
    event.preventDefault();
    var user = currentUser();
    user.name = document.getElementById("details-name").value.trim();
    user.phone = document.getElementById("details-phone").value.trim();

    if (updateUser(user)) {
        showAccount(user);
        document.getElementById("details-message").textContent = "Saved.";
    } else {
        document.getElementById("details-message").textContent = "Your browser is blocking saved data, so this couldn't be saved.";
    }
}

function deleteAccount() {
    var user = currentUser();
    if (!confirm("Delete your account and all your saved builds? This can't be undone.")) {
        return;
    }
    var users = loadUsers();
    delete users[user.email];
    saveUsers(users);
    logOut();
}


// ---------- when each page opens ----------

// The "My Account" link becomes "Log in" when nobody is logged in.
var accountLink = document.getElementById("account-link");
if (accountLink && !currentUser()) {
    accountLink.textContent = "Log in";
    accountLink.href = "login.html";
}

// Build page: pick the choices from the link if there are any
// (for example build.html?body=DD-12&finish=Sunburst), then draw the guitar.
if (document.getElementById("build-form")) {
    var linkChoices = new URLSearchParams(window.location.search);
    var radios = document.querySelectorAll("#build-form input[type=radio]");
    for (var k = 0; k < radios.length; k++) {
        if (radios[k].value === linkChoices.get(radios[k].name)) {
            radios[k].checked = true;
        }
    }

    // Fill in the name and email for someone who is logged in.
    var builder = currentUser();
    if (builder) {
        document.getElementById("customer-name").value = builder.name;
        document.getElementById("customer-email").value = builder.email;
    }

    updateBuild();
}

// Log in page: someone who is already logged in goes straight to their account.
if (document.getElementById("login-panel")) {
    if (currentUser()) {
        window.location.replace("account.html");
    } else if (window.location.hash === "#create") {
        showLoginTab("create");
    }
}

// Account page: someone who is not logged in is sent to the log in page.
if (document.getElementById("details-form")) {
    var member = currentUser();
    if (member) {
        showAccount(member);
    } else {
        window.location.replace("login.html");
    }
}


// Update the copyright year automatically.
document.getElementById("year").textContent = new Date().getFullYear();
