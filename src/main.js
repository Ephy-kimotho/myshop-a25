/* ------------------- IMPORTS ------------------- */
import { nanoid } from "nanoid";

/* ------------------- SELECTING DOM ELEMENTS ------------------- */
const searchInput = document.getElementById("shopping-input");
const itemsContainer = document.querySelector(".items-container");
const modal = document.querySelector(".modal");
const errorBoxName = document.getElementById("errorBoxName");
const errorBoxLocation = document.getElementById("errorBoxLocation");
const searchForm = document.forms[0];
const infoForm = document.forms[1];
const nameInput = infoForm.querySelector("#nameInput");
const locationInput = infoForm.querySelector("#locationInput");
const errorMessage = document.querySelector(".error-message");
const errorParagraph = errorMessage.querySelector("p");
const cartIconContainer = document.querySelector(".cart-icon-container");
const itemsCount = cartIconContainer.querySelector(".items-count");
const shoppingCart = document.querySelector(".shopping-cart");
const cartItemsContainer = document.querySelector(".cart-items-container");
const totalPriceSpan = document.querySelector(".total-price");
const shareBtn = document.querySelector(".share-cart-btn");
const cancelBtn = document.querySelector(".cancel-btn");
const loader = document.querySelector(".loader");
const clearCartBtn = document.querySelector(".clear-cart-btn");

/* ------------------- GLOBALS ------------------- */
let fetchedItems = [];
let cart = [];

/* ------------------- EVENT LISTENERS ------------------- */
window.addEventListener("click", () =>
  shoppingCart.classList.remove("show-cart")
);

document.addEventListener("DOMContentLoaded", () => {
  loadCartItemsFromLocalStorage();
});

itemsContainer.addEventListener("click", (e) => {
  e.stopPropagation();
  const target = e.target;
  if (target.classList.contains("add-to-cart-btn")) {
    const itemId = target.parentNode.parentNode.id;
    addToCart(itemId);
  }
});

cartItemsContainer.addEventListener("click", (e) => {
  e.stopPropagation();
  const target = e.target;
  const itemId = target.parentNode.parentNode.parentNode.id;

  if (target.classList.contains("plus")) {
    updateNumberOfUnits("plus", itemId);
  } else if (target.classList.contains("minus")) {
    updateNumberOfUnits("minus", itemId);
  } else if (target.classList.contains("delete-btn")) {
    removeItemFromCart(itemId);
  }
});

searchForm.addEventListener("submit", getItem);
infoForm.addEventListener("submit", handleSubmit);
cartIconContainer.addEventListener("click", showCart);
shareBtn.addEventListener("click", verifyShare);
cancelBtn.addEventListener("click", hideModal);
clearCartBtn.addEventListener("click", removeCartFromLocalStorage);

/* ------------------- UTILITY FUNCTIONS ------------------- */
function clearInput(element) {
  element.value = "";
}

function clearItemsContainer() {
  itemsContainer.innerHTML = "";
}

function cartItemsExist() {
  return cart.length > 0;
}

function showCart(e) {
  e.stopPropagation();
  shoppingCart.classList.toggle("show-cart");
}

function clearCartItemsContainer() {
  cartItemsContainer.innerHTML = "";
}

function displayErrorMessage(message) {
  errorMessage.style.display = "flex";
  errorParagraph.textContent = message;

  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 5500);
}

function resetErrorBoxes() {
  errorBoxName.textContent = "";
  errorBoxLocation.textContent = "";
  nameInput.style.outlineColor = "#6e6e6e";
  locationInput.style.outlineColor = "#6e6e6e";
}

function hideModal() {
  resetErrorBoxes();
  clearInput(nameInput);
  clearInput(locationInput);
  modal.style.display = "none";
}

/* ------------------- UI FUNCTIONS ------------------- */
function getItem(e) {
  e.preventDefault();

  const searchTerm = searchInput.value.trim();
  clearInput(searchInput);

  if (searchTerm === "") {
    displayErrorMessage("Item name is required.");
  } else {
    const url = `https://shop-heii.onrender.com/api/v1/products?name=${searchTerm}`;

    clearItemsContainer();
    loader.classList.add("show-loader");
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        fetchedItems = data.map((item) => ({ id: nanoid(), ...item }));
        renderItems(fetchedItems);
      })
      .catch((err) => console.error("Error: ", err))
      .finally(() => {
        loader.classList.remove("show-loader");
      });
  }
}

function renderItems(items) {
  if (items.length > 0) {
    items = items.map((item) => {
      return ` <article class="item" id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">

                    <div class="item-content">
                        <h2 class="item-name">${item.name}</h2>
                        <h3 class="item-category">${item.category}</h3>
                        <p class="item-category">${item.description}</p>
                        <p class="item-price">Ksh.${item.price}</p>
                        <button class="add-to-cart-btn">
                            Add to cart
                        </button>
                    </div>
                </article>`;
    });

    itemsContainer.innerHTML = items.join("");
  } else {
    displayErrorMessage("No such item was found.");
  }
}

/* ------------------- SHARE TO WHATSAPP FUNCTIONS ------------------- */
function verifyShare() {
  if (cartItemsExist()) {
    modal.style.display = "flex";
  } else {
    displayErrorMessage("Can't share an empty cart.");
  }
}

function handleSubmit(e) {
  e.preventDefault();
  const isFormValid = validateInputs();

  if (isFormValid) {
    const name = nameInput.value.trim();
    const location = locationInput.value.trim();
    clearInput(nameInput);
    clearInput(locationInput);
    modal.style.display = "none";
    shareToWhatsApp(name, location);
  }
}

function validateInputs() {
  resetErrorBoxes();
  const name = nameInput.value.trim();
  const location = locationInput.value.trim();
  let isValid = true;

  if (name === "") {
    errorBoxName.textContent = "Required.";
    nameInput.style.outlineColor = "#DE1701";
    isValid = false;
  } else if (name.length < 3) {
    errorBoxName.textContent = "Name is too short.";
    nameInput.style.outlineColor = "#DE1701";
    isValid = false;
  } else {
    errorBoxName.textContent = "";
    nameInput.style.outlineColor = "#6e6e6e";
  }

  if (location === "") {
    errorBoxLocation.textContent = "Required.";
    locationInput.style.outlineColor = "#DE1701";
    isValid = false;
  } else if (location.length < 4) {
    errorBoxLocation.textContent = "Must 4 characters or more";
    locationInput.style.outlineColor = "#DE1701";
    isValid = false;
  } else {
    errorBoxLocation.textContent = "";
    locationInput.style.outlineColor = "#6e6e6e";
  }

  return isValid;
}

function shareToWhatsApp(name, location) {
  const listItems = cart
    .map((item) => {
      return `${item.numberOfUnits} - ${item.description} ${item.category} ${
        item.name
      } Ksh. ${item.price * item.numberOfUnits},`;
    })
    .join("\n");
  const price = totalPriceSpan.textContent;
  const oldPrice = parseInt(price.slice(5));

  let totalPriceWithComission = 0;

  if (oldPrice <= 1000) {
    totalPriceWithComission = oldPrice + 100;
  } else if (oldPrice > 1000) {
    totalPriceWithComission = Math.round(0.1 * oldPrice + oldPrice);
  }

  const phoneNumber = "254715240982";
  const message = encodeURIComponent(
    `Shopping List for ${name}, to be delivered at ${location}:\n${listItems}\nTotal price without commission: ${price}\nTotal price with commission: Ksh. ${totalPriceWithComission}.
    `
  );

  const whatsAppLink = `https://wa.me/${phoneNumber}?text=${message}`;

  window.open(whatsAppLink, "_blank");
  removeCartFromLocalStorage();
}

/* ------------------- CART FUNCTIONS ------------------- */
function addToCart(itemId) {
  if (cart.some((item) => item.id === itemId)) {
    updateNumberOfUnits("plus", itemId);
  } else {
    const selectedItem = fetchedItems.find((item) => item.id === itemId);
    cart.push({ numberOfUnits: 1, ...selectedItem });
    updateCart();
  }
}

function updateCart() {
  if (cart.length === 0) {
    shoppingCart.classList.remove("show-cart");
  }

  renderCartItems();
  renderTotalPrice();
  saveCartItemsToLocalStorage();
}

function renderCartItems() {
  clearCartItemsContainer();
  const cartItems = cart.map((item) => {
    return `<article class="cart-item" id="${item.id}">
                <div class="cart-item-details">
                    <img class="cart-item-image" src="${item.image}" alt="${item.name}" />
                    <div>
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="item-category">${item.description} ${item.category}</p>
                        <p class="cart-item-price">Ksh. ${item.price}</p>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <p>
                        <span class="minus">-</span>
                        <span class="item-count">${item.numberOfUnits}</span>
                        <span class="plus">+</span>
                    </p>
                    <button class="remove-item-btn">
                        <i class="fa-solid fa-trash delete-btn"></i>
                    </button>
                </div>
            </article>
          `;
  });

  cartItemsContainer.innerHTML = cartItems.join("");
}

function renderTotalPrice() {
  let totalPrice = 0,
    totalItems = 0;

  cart.forEach((item) => {
    totalPrice += item.numberOfUnits * item.price;
    totalItems += item.numberOfUnits;
  });

  itemsCount.textContent = totalItems.toString();
  totalPriceSpan.textContent = `Ksh. ${totalPrice}`;
}

function updateNumberOfUnits(action, itemId) {
  const selectedItem = cart.find((item) => item.id === itemId);
  if (action === "plus") {
    selectedItem.numberOfUnits = selectedItem.numberOfUnits + 1;
  } else if (action === "minus" && selectedItem.numberOfUnits > 1) {
    selectedItem.numberOfUnits = selectedItem.numberOfUnits - 1;
  }
  updateCart();
}

function removeItemFromCart(itemId) {
  cart = cart.filter((item) => item.id != itemId);
  updateCart();
}

/* ------------------- LOCAL STORAGE FUNCTIONS ------------------- */
function saveCartItemsToLocalStorage() {
  localStorage.setItem("shoppingCart", JSON.stringify(cart));
}

function loadCartItemsFromLocalStorage() {
  const savedCart = JSON.parse(localStorage.getItem("shoppingCart"));
  if (savedCart) {
    cart = savedCart;
    updateCart();
  }
}

function removeCartFromLocalStorage(e) {
  localStorage.removeItem("shoppingCart");
  cart = [];
  updateCart();
}
