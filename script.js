const books = [
  { id: "quiet-hours", title: "The Quiet Hours", author: "Ella Wilder", category: "Fiction", price: 18, tag: "Staff pick", cover: "cover-meadow", coverTitle: "THE<br>QUIET<br>HOURS" },
  { id: "blue-between", title: "The Blue Between Us", author: "Mara Ellis", category: "Fiction", price: 21, tag: "Reader favorite", cover: "cover-blue", coverTitle: "THE BLUE<br>BETWEEN US" },
  { id: "small-joys", title: "A Field Guide to Small Joys", author: "Nina Park", category: "Nonfiction", price: 24, tag: "New", cover: "cover-coral", coverTitle: "A FIELD GUIDE<br>TO SMALL JOYS" },
  { id: "wild-gardens", title: "Wild Gardens", author: "Theo Bennett", category: "Nonfiction", price: 28, tag: "", cover: "cover-cream", coverTitle: "WILD<br>GARDENS" },
  { id: "soft-edges", title: "Soft Edges", author: "Amara Wells", category: "Poetry", price: 16, tag: "", cover: "cover-lilac", coverTitle: "SOFT<br>EDGES" },
  { id: "moon-atlas", title: "The Moon Atlas", author: "Julian Moreau", category: "For little ones", price: 19, tag: "Little wonder", cover: "cover-yellow", coverTitle: "THE MOON<br>ATLAS" },
  { id: "things-we-keep", title: "The Things We Keep", author: "S. Rowan", category: "Fiction", price: 22, tag: "", cover: "cover-rust", coverTitle: "THE THINGS<br>WE KEEP" },
  { id: "grow-slow", title: "Grow Slow", author: "Poppy Lane", category: "For little ones", price: 17, tag: "", cover: "cover-green", coverTitle: "GROW<br>SLOW" },
];

const bookGrid = document.querySelector("#book-grid");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const categoryList = document.querySelector("#category-list");
const resultsCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const cartDrawer = document.querySelector("#cart-drawer");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartSubtotal = document.querySelector("#cart-subtotal");
const cartSummary = document.querySelector("#cart-summary");
const cartEmpty = document.querySelector("#cart-empty");
const toast = document.querySelector("#toast");
const checkoutDialog = document.querySelector("#checkout-dialog");

let activeCategory = "All books";
let cart = new Map();
let toastTimeout;

const money = (amount) => `$${amount.toFixed(2)}`;

function renderBooks() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleBooks = books
    .filter((book) => activeCategory === "All books" || book.category === activeCategory)
    .filter((book) => `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(query))
    .sort((a, b) => {
      switch (sortSelect.value) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "title": return a.title.localeCompare(b.title);
        default: return books.indexOf(a) - books.indexOf(b);
      }
    });

  resultsCount.textContent = `Showing ${visibleBooks.length} ${visibleBooks.length === 1 ? "book" : "books"}`;
  emptyState.hidden = visibleBooks.length > 0;
  bookGrid.hidden = visibleBooks.length === 0;
  bookGrid.innerHTML = visibleBooks.map((book) => `
    <article class="book-card">
      <div class="book-visual">
        ${book.tag ? `<span class="book-badge">${book.tag}</span>` : ""}
        <div class="book-cover ${book.cover}" aria-label="Cover of ${book.title}" role="img">
          <div class="cover-art" aria-hidden="true"></div>
          <span class="cover-title">${book.coverTitle}</span>
          <span class="cover-author">${book.author.toUpperCase()}</span>
        </div>
      </div>
      <div class="book-info">
        <div>
          <p class="book-category">${book.category}</p>
          <h3>${book.title}</h3>
          <p class="book-author">by ${book.author}</p>
        </div>
        <span class="book-price">${money(book.price)}</span>
      </div>
      <button class="add-button" type="button" data-add-book="${book.id}" aria-label="Add ${book.title} to your bag">
        Add to bag <span aria-hidden="true">+</span>
      </button>
    </article>
  `).join("");
}

function renderCart() {
  const entries = [...cart.entries()];
  const quantity = entries.reduce((total, [, count]) => total + count, 0);
  const subtotal = entries.reduce((total, [id, count]) => {
    const book = books.find((item) => item.id === id);
    return total + book.price * count;
  }, 0);

  cartCount.textContent = quantity;
  cartItems.innerHTML = entries.map(([id, count]) => {
    const book = books.find((item) => item.id === id);
    return `
      <article class="cart-line">
        <div class="mini-cover ${book.cover}">${book.coverTitle}</div>
        <div>
          <h3>${book.title}</h3>
          <p>by ${book.author}</p>
          <div class="quantity-control" aria-label="Quantity for ${book.title}">
            <button type="button" data-change-quantity="${id}" data-delta="-1" aria-label="Remove one ${book.title}">−</button>
            <span>${count}</span>
            <button type="button" data-change-quantity="${id}" data-delta="1" aria-label="Add one ${book.title}">+</button>
          </div>
        </div>
        <span class="line-price">${money(book.price * count)}</span>
      </article>
    `;
  }).join("");

  cartSubtotal.textContent = money(subtotal);
  cartEmpty.classList.toggle("is-visible", quantity === 0);
  cartSummary.hidden = quantity === 0;
  cartItems.hidden = quantity === 0;
}

function renderCheckoutSummary() {
  const entries = [...cart.entries()];
  const subtotal = entries.reduce((total, [id, count]) => {
    const book = books.find((item) => item.id === id);
    return total + book.price * count;
  }, 0);

  document.querySelector("#checkout-items").innerHTML = entries.map(([id, count]) => {
    const book = books.find((item) => item.id === id);
    return `<div class="checkout-item"><span>${book.title} <small>× ${count}</small></span><strong>${money(book.price * count)}</strong></div>`;
  }).join("");
  document.querySelector("#checkout-subtotal").textContent = money(subtotal);
}

function openCart() {
  document.body.classList.add("cart-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  document.body.classList.remove("cart-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.querySelector("#open-cart").focus();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

bookGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-book]");
  if (!button) return;

  const id = button.dataset.addBook;
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  showToast(`${books.find((book) => book.id === id).title} added to your bag`);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-change-quantity]");
  if (!button) return;

  const id = button.dataset.changeQuantity;
  const nextCount = (cart.get(id) || 0) + Number(button.dataset.delta);
  if (nextCount <= 0) cart.delete(id);
  else cart.set(id, nextCount);
  renderCart();
});

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;
  categoryList.querySelector(".is-active").classList.remove("is-active");
  button.classList.add("is-active");
  renderBooks();
});

searchInput.addEventListener("input", renderBooks);
sortSelect.addEventListener("change", renderBooks);
document.querySelector("#clear-filters").addEventListener("click", () => {
  activeCategory = "All books";
  searchInput.value = "";
  categoryList.querySelector(".is-active").classList.remove("is-active");
  categoryList.querySelector('[data-category="All books"]').classList.add("is-active");
  renderBooks();
});

document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document.querySelector("#drawer-backdrop").addEventListener("click", closeCart);
document.querySelector("#browse-books").addEventListener("click", () => {
  closeCart();
  document.querySelector("#books").scrollIntoView({ behavior: "smooth" });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("cart-open")) closeCart();
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  if (cart.size === 0) return;
  closeCart();
  renderCheckoutSummary();
  document.querySelector("#checkout-form-view").hidden = false;
  document.querySelector("#checkout-success").hidden = true;
  checkoutDialog.showModal();
});

document.querySelector("#close-checkout").addEventListener("click", () => checkoutDialog.close());
document.querySelector("#finish-checkout").addEventListener("click", () => checkoutDialog.close());
checkoutDialog.addEventListener("close", () => document.querySelector("#open-cart").focus());

document.querySelector("#place-order").addEventListener("click", () => {
  if (cart.size === 0) return;
  const reference = `PP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  document.querySelector("#order-reference").textContent = reference;
  document.querySelector("#checkout-form-view").hidden = true;
  document.querySelector("#checkout-success").hidden = false;
  cart.clear();
  renderCart();
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.querySelector("#newsletter-message");
  message.textContent = "Thanks! This demo doesn’t store or send your email.";
  message.style.color = "var(--green)";
  event.currentTarget.reset();
});

renderBooks();
renderCart();