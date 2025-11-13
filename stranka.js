(function () {
  // ---------- SLIDER ----------
  let currentSlide = 0;
  const slides = document.querySelectorAll(".slider-image");
  const dots = document.querySelectorAll(".dot");

  console.log("Slider images found:", slides.length);
  console.log("Slider dots found:", dots.length);

  function showSlide(n) {
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));

    slides[n].classList.add("active");
    dots[n].classList.add("active");
    console.log("Showing slide:", n);
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  document.getElementById("nextBtn")?.addEventListener("click", nextSlide);
  document.getElementById("prevBtn")?.addEventListener("click", prevSlide);

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      currentSlide = parseInt(dot.dataset.index);
      showSlide(currentSlide);
    });
  });

  // Auto-rotate every 5 seconds
  setInterval(nextSlide, 5000);

  // ---------- REST OF APP ----------
  const yearEl = document.getElementById("year");
  yearEl.textContent = new Date().getFullYear();

  function loadTexts() {
    document.querySelectorAll("[data-key]").forEach((el) => {
      const key = el.dataset.key;
      const value = localStorage.getItem("cm_" + key);
      if (value !== null) el.textContent = value;
    });

    const logo = localStorage.getItem("cm_logo");
    if (logo) document.getElementById("logoImg").src = logo;

    document.querySelectorAll(".card").forEach((card) => {
      const idx = card.dataset.index;
      const img = localStorage.getItem("cm_pimg_" + idx);
      if (img) card.querySelector(".pimg").src = img;
    });
  }

  document
    .querySelectorAll('[contenteditable="true"][data-key]')
    .forEach((el) => {
      el.addEventListener("blur", () => {
        const key = el.dataset.key;
        localStorage.setItem("cm_" + key, el.textContent.trim());
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          el.blur();
        }
      });
    });

  const applyLogoBtn = document.getElementById("applyLogo");
  if (applyLogoBtn) {
    applyLogoBtn.addEventListener("click", () => {
      const urlEl = document.getElementById("logoUrl");
      const url = urlEl ? urlEl.value.trim() : "";
      if (!url) return alert("Zadej URL obrázku loga");
      const logoImg = document.getElementById("logoImg");
      if (logoImg) logoImg.src = url;
      localStorage.setItem("cm_logo", url);
    });
  }

  const applyProductBtn = document.getElementById("applyProduct");
  if (applyProductBtn) {
    applyProductBtn.addEventListener("click", () => {
      const idxEl = document.getElementById("editIndex");
      const idx = Number((idxEl ? idxEl.value : "") || 0);
      const nameEl = document.getElementById("editName");
      const priceEl = document.getElementById("editPrice");
      const imgEl = document.getElementById("editImg");
      const name = nameEl ? nameEl.value.trim() : "";
      const price = priceEl ? priceEl.value.trim() : "";
      const img = imgEl ? imgEl.value.trim() : "";
      const card = document.querySelector('.card[data-index="' + idx + '"]');

      if (!card) return alert("Neplatný index produktu");

      if (name) {
        const nameElInCard = card.querySelector('[data-key="p' + idx + '_name"]');
        if (nameElInCard) nameElInCard.textContent = name;
        localStorage.setItem("cm_p" + idx + "_name", name);
      }
      if (price) {
        const priceElInCard = card.querySelector('[data-key="p' + idx + '_price"]');
        if (priceElInCard) priceElInCard.textContent = price;
        localStorage.setItem("cm_p" + idx + "_price", price);
      }
      if (img) {
        const imgInCard = card.querySelector(".pimg");
        if (imgInCard) imgInCard.src = img;
        localStorage.setItem("cm_pimg_" + idx, img);
      }
    });
  }

  const resetDemoBtn = document.getElementById("resetDemo");
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener("click", () => {
      if (!confirm("Obnovit výchozí demo?")) return;
      localStorage.clear();
      location.reload();
    });
  }

  // ---------- CART (persistent) ----------
  let cart = JSON.parse(localStorage.getItem("cart_items") || "{}");

  function updateCartCount() {
    const total = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    const cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) {
      cartCountEl.textContent = total;
      cartCountEl.classList.add("pop");
      setTimeout(() => cartCountEl.classList.remove("pop"), 300);
    }
  }

  function saveCart() {
    localStorage.setItem("cart_items", JSON.stringify(cart));
    updateCartCount();
  }

  function renderCartModal() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotal");
    
    if (Object.keys(cart).length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Váš košík je prázdný</p>';
      if (cartTotalEl) cartTotalEl.textContent = "0 Kč";
      return;
    }

    let totalPrice = 0;
    cartItemsContainer.innerHTML = Object.entries(cart)
      .map(([productId, item]) => {
        const itemTotal = item.qty * item.priceNum;
        totalPrice += itemTotal;
        const priceStr = `${itemTotal} Kč`;
        
        return `
          <div class="cart-item">
            <div class="cart-item-img">
              <img src="${item.image}" alt="${item.name}" />
            </div>
            <div class="cart-item-details">
              <p class="cart-item-name">${item.name}</p>
              <p class="cart-item-price">${item.price}</p>
              <div class="cart-item-controls">
                <button class="qty-btn qty-minus" data-id="${productId}">−</button>
                <span class="qty-display">${item.qty}</span>
                <button class="qty-btn qty-plus" data-id="${productId}">+</button>
              </div>
            </div>
            <button class="cart-item-remove" data-id="${productId}">Odstranit</button>
          </div>
        `;
      })
      .join("");

    if (cartTotalEl) cartTotalEl.textContent = `${totalPrice} Kč`;

    // Attach event listeners to quantity and remove buttons
    document.querySelectorAll(".qty-plus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        cart[id].qty++;
        saveCart();
        renderCartModal();
      });
    });

    document.querySelectorAll(".qty-minus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (cart[id].qty > 1) {
          cart[id].qty--;
        } else {
          delete cart[id];
        }
        saveCart();
        renderCartModal();
      });
    });

    document.querySelectorAll(".cart-item-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        delete cart[id];
        saveCart();
        renderCartModal();
      });
    });
  }

  // Modal open/close
  const cartBtn = document.getElementById("cartBtn");
  const cartModal = document.getElementById("cartModal");
  const closeCartModalBtn = document.getElementById("closeCartModal");
  const cartOverlay = document.querySelector(".modal-overlay");

  function openCartModal() {
    if (cartModal) {
      cartModal.classList.add("active");
      renderCartModal();
    }
  }

  function closeCartModal() {
    if (cartModal) {
      cartModal.classList.remove("active");
    }
  }

  if (cartBtn) cartBtn.addEventListener("click", openCartModal);
  if (closeCartModalBtn) closeCartModalBtn.addEventListener("click", closeCartModal);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCartModal);

  // Attach listeners to "Přidat do košíku" buttons (class .btn-ghost)
  function attachAddToCartListeners() {
    document.querySelectorAll(".btn-ghost").forEach((btn) => {
      if (btn.dataset.listenerAttached) return; // Prevent duplicate listeners
      btn.dataset.listenerAttached = "true";
      
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Find the product card
        const card = btn.closest(".card");
        if (!card) return;

        const productId = card.dataset.index;
        const name = card.querySelector("h4")?.textContent || "Produkt";
        const priceText = card.querySelector(".price")?.textContent || "0 Kč";
        const priceNum = Number(priceText.replace(/[^0-9]/g, "")) || 0;
        const image = card.querySelector(".pimg")?.src || "";

        if (cart[productId]) {
          cart[productId].qty++;
        } else {
          cart[productId] = { name, price: priceText, priceNum, image, qty: 1 };
        }

        saveCart();
      });
    });
  }

  attachAddToCartListeners();
  updateCartCount();

  // ---------- CHECKOUT ----------
  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutModal = document.getElementById("checkoutModal");
  const closeCheckoutModalBtn = document.getElementById("closeCheckoutModal");
  const cancelCheckoutBtn = document.getElementById("cancelCheckoutBtn");
  const submitOrderBtn = document.getElementById("submitOrderBtn");
  const orderForm = document.getElementById("orderForm");
  const checkoutForm = document.getElementById("checkoutForm");
  const confirmationScreen = document.getElementById("confirmationScreen");

  function openCheckoutModal() {
    if (!Object.keys(cart).length) {
      alert("Váš košík je prázdný!");
      return;
    }
    
    renderCheckoutSummary();
    if (checkoutModal) {
      checkoutModal.classList.add("active");
      checkoutForm.style.display = "flex";
      confirmationScreen.style.display = "none";
    }
    closeCartModal();
  }

  function closeCheckoutModal() {
    if (checkoutModal) {
      checkoutModal.classList.remove("active");
    }
  }

  function renderCheckoutSummary() {
    const container = document.getElementById("checkoutOrderItems");
    let total = 0;
    let html = "";

    Object.values(cart).forEach((item) => {
      const itemTotal = item.qty * item.priceNum;
      total += itemTotal;
      html += `
        <div class="checkout-item">
          <span class="checkout-item-name">${item.name}</span>
          <span class="checkout-item-qty">×${item.qty}</span>
          <span class="checkout-item-price">${itemTotal} Kč</span>
        </div>
      `;
    });

    container.innerHTML = html;
    const checkoutTotalEl = document.getElementById("checkoutTotal");
    if (checkoutTotalEl) checkoutTotalEl.textContent = `${total} Kč`;
  }

  function generateOrderNumber() {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}-${timestamp}`;
  }

  function submitOrder(e) {
    e.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const note = document.getElementById("customerNote").value.trim();

    if (!name || !email || !phone || !address) {
      alert("Prosím vyplňte všechna povinná pole!");
      return;
    }

    const orderNumber = generateOrderNumber();
    const orderData = {
      orderNumber,
      customer: { name, email, phone, address, note },
      items: cart,
      total: Object.values(cart).reduce((sum, item) => sum + item.qty * item.priceNum, 0),
      date: new Date().toLocaleString("cs-CZ"),
    };

    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(orderData);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Show confirmation
    showConfirmation(orderData);
  }

  function showConfirmation(orderData) {
    checkoutForm.style.display = "none";
    confirmationScreen.style.display = "flex";

    document.getElementById("orderNumber").textContent = orderData.orderNumber;
    
    const detailsHtml = `
      <div><strong>Jméno:</strong> ${orderData.customer.name}</div>
      <div><strong>Email:</strong> ${orderData.customer.email}</div>
      <div><strong>Telefon:</strong> ${orderData.customer.phone}</div>
      <div><strong>Adresa:</strong> ${orderData.customer.address}</div>
      ${orderData.customer.note ? `<div><strong>Poznámka:</strong> ${orderData.customer.note}</div>` : ""}
      <div><strong>Celkem:</strong> ${orderData.total} Kč</div>
      <div><strong>Datum:</strong> ${orderData.date}</div>
    `;
    
    document.getElementById("confirmationDetails").innerHTML = detailsHtml;
  }

  function resetCheckout() {
    orderForm.reset();
    cart = {};
    localStorage.removeItem("cart_items");
    updateCartCount();
    closeCheckoutModal();
  }

  if (checkoutBtn) checkoutBtn.addEventListener("click", openCheckoutModal);
  if (closeCheckoutModalBtn) closeCheckoutModalBtn.addEventListener("click", closeCheckoutModal);
  if (cancelCheckoutBtn) cancelCheckoutBtn.addEventListener("click", closeCheckoutModal);
  if (submitOrderBtn) submitOrderBtn.addEventListener("click", submitOrder);

  // Copy order number to clipboard
  const copyOrderBtn = document.getElementById("copyOrderBtn");
  if (copyOrderBtn) {
    copyOrderBtn.addEventListener("click", () => {
      const orderNum = document.getElementById("orderNumber").textContent;
      navigator.clipboard.writeText(orderNum).then(() => {
        const originalText = copyOrderBtn.textContent;
        copyOrderBtn.textContent = "✓ Zkopírováno!";
        setTimeout(() => {
          copyOrderBtn.textContent = originalText;
        }, 2000);
      });
    });
  }

  // Close modal when clicking overlay
  const checkoutOverlay = checkoutModal?.querySelector(".modal-overlay");
  if (checkoutOverlay) {
    checkoutOverlay.addEventListener("click", closeCheckoutModal);
  }

  loadTexts();
})();
