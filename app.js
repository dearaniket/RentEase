document.addEventListener("DOMContentLoaded", async () => {
  let currentRole = "Customer";
  let activePage = "catalog";
  let cart = [];
  
  let searchQuery = "";
  let selectedCategory = "all";
  let activeSort = "default";
  
  let activeProductDetail = null;
  let activeTenureSelection = 3;
  
  let trendChart = null;
  let categoryChart = null;

  const roleSwitcher = document.getElementById("role-switcher");
  const mainNav = document.getElementById("main-nav");
  const navCatalog = document.getElementById("nav-catalog");
  const navCustomerDb = document.getElementById("nav-customer-db");
  const navVendorDb = document.getElementById("nav-vendor-db");
  const navAdminDb = document.getElementById("nav-admin-db");
  const cartToggleBtn = document.getElementById("cart-toggle-btn");
  const cartCount = document.getElementById("cart-count");
  const themeToggleBtn = document.getElementById("theme-toggle");
  
  const catalogPage = document.getElementById("catalog-page");
  const cartPage = document.getElementById("cart-page");
  const customerDbPage = document.getElementById("customer-dashboard-page");
  const vendorDbPage = document.getElementById("vendor-dashboard-page");
  const adminDbPage = document.getElementById("admin-dashboard-page");

  const productModal = document.getElementById("product-modal");
  const maintenanceModal = document.getElementById("maintenance-modal");
  const productFormModal = document.getElementById("product-form-modal");

  try {
    const res = await fetch("/api/db");
    if (res.ok) {
      const serverData = await res.json();
      localStorage.setItem("rentease_products", JSON.stringify(serverData.products));
      localStorage.setItem("rentease_users", JSON.stringify(serverData.users));
      localStorage.setItem("rentease_rentals", JSON.stringify(serverData.rentals));
      localStorage.setItem("rentease_maintenance", JSON.stringify(serverData.maintenance));
    }
  } catch (err) {
    console.warn("Could not connect to Node.js backend. Using local storage.", err);
  }

  initTheme();
  renderCatalog();
  updateNavForRole();
  updateCartBadge();

  function initTheme() {
    const savedTheme = localStorage.getItem("rentease_theme") || "light";
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
      document.body.classList.remove("dark-theme");
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  }

  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    localStorage.setItem("rentease_theme", isDark ? "dark" : "light");
    themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    showToast(`Switched to ${isDark ? 'Dark' : 'Light'} Mode`, "info");
    
    if (activePage === "admin-dashboard") {
      setTimeout(renderAdminCharts, 50);
    }
  });

  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = '<i class="fa-solid fa-circle-check"></i>';
    if (type === "danger") icon = '<i class="fa-solid fa-circle-exclamation"></i>';
    if (type === "warning") icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
    if (type === "info") icon = '<i class="fa-solid fa-circle-info"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = "slideOut 0.2s ease forwards";
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }

  function navigateTo(pageId) {
    activePage = pageId;
    
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));

    const targetSection = document.getElementById(`${pageId}-page`);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    const targetLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (targetLink) {
      targetLink.classList.add("active");
    }

    if (pageId === "catalog") {
      renderCatalog();
    } else if (pageId === "cart") {
      renderCart();
    } else if (pageId === "customer-dashboard") {
      renderCustomerDashboard();
    } else if (pageId === "vendor-dashboard") {
      renderVendorDashboard();
    } else if (pageId === "admin-dashboard") {
      renderAdminDashboard();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      const targetPage = link.getAttribute("data-page");
      navigateTo(targetPage);
    });
  });

  document.getElementById("logo-btn").addEventListener("click", () => navigateTo("catalog"));
  cartToggleBtn.addEventListener("click", () => navigateTo("cart"));

  roleSwitcher.addEventListener("change", (e) => {
    currentRole = e.target.value;
    updateNavForRole();
    showToast(`Role switched to ${currentRole}`, "info");
    
    if (currentRole === "Customer") {
      if (["vendor-dashboard", "admin-dashboard"].includes(activePage)) {
        navigateTo("catalog");
      }
    } else if (currentRole === "Vendor") {
      if (activePage === "admin-dashboard") {
        navigateTo("vendor-dashboard");
      }
    } else if (currentRole === "Admin") {
      if (activePage === "vendor-dashboard") {
        navigateTo("admin-dashboard");
      }
    }
  });

  function updateNavForRole() {
    if (currentRole === "Customer") {
      navCustomerDb.style.display = "block";
      navVendorDb.style.display = "none";
      navAdminDb.style.display = "none";
      document.getElementById("customer-greeting").innerHTML = `<i class="fa-solid fa-circle-user"></i> My Customer Hub`;
    } else if (currentRole === "Vendor") {
      navCustomerDb.style.display = "none";
      navVendorDb.style.display = "block";
      navAdminDb.style.display = "none";
    } else if (currentRole === "Admin") {
      navCustomerDb.style.display = "none";
      navVendorDb.style.display = "none";
      navAdminDb.style.display = "block";
    }
  }

  function renderCatalog() {
    const grid = document.getElementById("products-grid");
    const products = window.RentEaseDB.getProducts();

    let filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });

    if (activeSort === "price-asc") {
      filtered.sort((a, b) => a.monthlyRent - b.monthlyRent);
    } else if (activeSort === "price-desc") {
      filtered.sort((a, b) => b.monthlyRent - a.monthlyRent);
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon"><i class="fa-solid fa-box-open"></i></div>
          <div class="empty-state-title">No products found</div>
          <div class="empty-state-desc">Try refining your search query or switching categories.</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => `
      <div class="product-card">
        <div class="product-image-container">
          <img src="${p.imageUrl}" alt="${p.name}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'">
          <span class="product-category-tag">${p.category}</span>
        </div>
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc-snippet">${p.description}</p>
          <div class="product-footer">
            <div class="price-block">
              <span class="price-label">Starts at</span>
              <div>
                <span class="price-value">$${p.monthlyRent.toFixed(2)}</span>
                <span class="price-unit">/ mo</span>
              </div>
            </div>
            <button class="btn btn-primary btn-icon-only open-details-btn" data-id="${p.id}" title="View Details">
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".open-details-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const prodId = btn.getAttribute("data-id");
        openProductModal(prodId);
      });
    });
  }

  document.getElementById("search-bar").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderCatalog();
  });

  document.querySelectorAll(".category-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.getAttribute("data-category");
      renderCatalog();
    });
  });

  document.getElementById("sort-select").addEventListener("change", (e) => {
    activeSort = e.target.value;
    renderCatalog();
  });

  function openProductModal(id) {
    const products = window.RentEaseDB.getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    activeProductDetail = product;
    activeTenureSelection = 3;

    document.getElementById("modal-product-name").innerText = product.name;
    document.getElementById("modal-product-image").src = product.imageUrl;
    document.getElementById("modal-product-category").innerText = product.category;
    document.getElementById("modal-product-desc").innerText = product.description;
    
    updateModalPricing();

    const tenureButtons = document.querySelectorAll("#modal-tenure-container .tenure-btn");
    tenureButtons.forEach(btn => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-months") === "3") {
        btn.classList.add("active");
      }
    });

    productModal.classList.add("active");
  }

  document.querySelectorAll("#modal-tenure-container .tenure-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#modal-tenure-container .tenure-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeTenureSelection = parseInt(btn.getAttribute("data-months"));
      updateModalPricing();
    });
  });

  function updateModalPricing() {
    if (!activeProductDetail) return;
    
    let discountRate = 1.0;
    if (activeTenureSelection === 6) discountRate = 0.95;
    if (activeTenureSelection === 12) discountRate = 0.90;

    const rent = activeProductDetail.monthlyRent * discountRate;
    const deposit = activeProductDetail.securityDeposit;

    document.getElementById("modal-product-rent").innerText = `$${rent.toFixed(2)}`;
    document.getElementById("modal-product-deposit").innerText = `$${deposit.toFixed(2)}`;
  }

  document.getElementById("modal-add-to-cart-btn").addEventListener("click", () => {
    if (!activeProductDetail) return;

    const exists = cart.find(item => item.productId === activeProductDetail.id);
    if (exists) {
      showToast(`${activeProductDetail.name} is already in your cart`, "warning");
      closeModals();
      return;
    }

    let discountRate = 1.0;
    if (activeTenureSelection === 6) discountRate = 0.95;
    if (activeTenureSelection === 12) discountRate = 0.90;

    const finalRent = activeProductDetail.monthlyRent * discountRate;

    cart.push({
      productId: activeProductDetail.id,
      name: activeProductDetail.name,
      monthlyRent: finalRent,
      securityDeposit: activeProductDetail.securityDeposit,
      tenure: activeTenureSelection,
      imageUrl: activeProductDetail.imageUrl
    });

    updateCartBadge();
    showToast(`Added ${activeProductDetail.name} to Cart!`);
    closeModals();
  });

  function closeModals() {
    productModal.classList.remove("active");
    maintenanceModal.classList.remove("active");
    productFormModal.classList.remove("active");
    activeProductDetail = null;
  }

  document.getElementById("close-product-modal").addEventListener("click", closeModals);
  document.getElementById("modal-close-btn").addEventListener("click", closeModals);
  document.getElementById("close-maintenance-modal").addEventListener("click", closeModals);
  document.getElementById("cancel-maintenance-modal").addEventListener("click", closeModals);
  document.getElementById("close-product-form-modal").addEventListener("click", closeModals);
  document.getElementById("cancel-product-form-modal").addEventListener("click", closeModals);

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      closeModals();
    }
  });

  function updateCartBadge() {
    cartCount.innerText = cart.length;
    cartCount.style.display = cart.length > 0 ? "flex" : "none";
  }

  function renderCart() {
    const container = document.getElementById("cart-layout-container");
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; padding: 5rem 1rem;">
          <div class="empty-state-icon"><i class="fa-solid fa-cart-flatbed-suitcases"></i></div>
          <div class="empty-state-title">Your cart is empty</div>
          <div class="empty-state-desc">Head back to the catalog and find premium furniture and appliances for rent.</div>
          <br>
          <button class="btn btn-primary" id="cart-back-to-catalog"><i class="fa-solid fa-arrow-left"></i> Back to Catalog</button>
        </div>
      `;
      document.getElementById("cart-back-to-catalog").addEventListener("click", () => navigateTo("catalog"));
      return;
    }

    let rentSum = 0;
    let depositSum = 0;

    cart.forEach(item => {
      rentSum += item.monthlyRent;
      depositSum += item.securityDeposit;
    });

    const deliveryFee = 25.00;
    const checkoutTotal = rentSum + depositSum + deliveryFee;

    const cartItemsHtml = cart.map((item, idx) => `
      <div class="cart-item">
        <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200'">
        <div class="cart-item-details">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <h4 class="cart-item-name">${item.name}</h4>
            <button class="btn btn-outline btn-icon-only remove-cart-item-btn" data-idx="${idx}" style="color:var(--danger); border-color:transparent;" title="Remove Item">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <div class="cart-item-meta">
            <span><i class="fa-solid fa-clock"></i> Tenure: <strong>${item.tenure} Months</strong></span>
            <span>Monthly Rent: <strong>$${item.monthlyRent.toFixed(2)}</strong></span>
            <span>Security Deposit: <strong>$${item.securityDeposit.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>
    `).join("");

    container.innerHTML = `
      <div class="cart-items-panel">
        ${cartItemsHtml}
      </div>

      <div class="cart-checkout-sidebar">
        <h3 style="font-weight:700; font-size:1.15rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">Lease Summary</h3>
        
        <div class="summary-row">
          <span>Monthly Rental Subtotal</span>
          <span>$${rentSum.toFixed(2)}/mo</span>
        </div>
        <div class="summary-row">
          <span>Total Security Deposit</span>
          <span>$${depositSum.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Delivery & Setup fee</span>
          <span>$${deliveryFee.toFixed(2)}</span>
        </div>
        
        <div class="summary-row total">
          <span>Upfront Payment</span>
          <span>$${checkoutTotal.toFixed(2)}</span>
        </div>
        
        <small style="color:var(--text-muted); display:block; margin: 1rem 0; line-height: 1.3;">
          * The Upfront Payment includes refundable security deposits and first month's rental fee. Recurring monthly rents start from next month.
        </small>
        
        <form id="checkout-form">
          <div class="checkout-form-group">
            <label class="form-label" for="checkout-address">Delivery Address</label>
            <input type="text" class="form-control" id="checkout-address" placeholder="123 Pine St, Suite 4B, Seattle, WA" required>
          </div>
          
          <div class="checkout-form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label" for="checkout-date">Scheduled Delivery Date</label>
            <input type="date" class="form-control" id="checkout-date" required>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width:100%; padding: 0.85rem;"><i class="fa-solid fa-credit-card"></i> Pay & Confirm Lease</button>
        </form>
      </div>
    `;

    const dateInput = document.getElementById("checkout-date");
    if (dateInput) {
      const today = new Date();
      const yyyyMin = today.getFullYear();
      const mmMin = String(today.getMonth() + 1).padStart(2, '0');
      const ddMin = String(today.getDate()).padStart(2, '0');
      const minDateStr = `${yyyyMin}-${mmMin}-${ddMin}`;

      const defDate = new Date();
      defDate.setDate(defDate.getDate() + 3);
      const yyyyDef = defDate.getFullYear();
      const mmDef = String(defDate.getMonth() + 1).padStart(2, '0');
      const ddDef = String(defDate.getDate()).padStart(2, '0');
      const defDateStr = `${yyyyDef}-${mmDef}-${ddDef}`;

      dateInput.value = defDateStr;
      dateInput.min = minDateStr;
    }

    document.querySelectorAll(".remove-cart-item-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-idx"));
        cart.splice(idx, 1);
        updateCartBadge();
        renderCart();
        showToast("Item removed from cart", "warning");
      });
    });

    document.getElementById("checkout-form").addEventListener("submit", (e) => {
      e.preventDefault();
      
      const address = document.getElementById("checkout-address").value;
      const deliveryDate = document.getElementById("checkout-date").value;
      
      const newLeases = window.RentEaseDB.createRental("u1", cart, address, deliveryDate);
      
      if (newLeases.length > 0) {
        showToast("Lease confirmed successfully! Payment received.", "success");
        cart = [];
        updateCartBadge();
        navigateTo("customer-dashboard");
      } else {
        showToast("Error processing lease. Check product stock.", "danger");
      }
    });
  }

  function renderCustomerDashboard() {
    const rentals = window.RentEaseDB.getRentals();
    const customerRentals = rentals.filter(r => r.userId === "u1");
    
    const activeSubs = customerRentals.filter(r => r.status !== "Completed");
    const pastSubs = customerRentals.filter(r => r.status === "Completed");

    document.getElementById("active-rentals-count-badge").innerText = `${activeSubs.length} Subscriptions`;

    const activeGrid = document.getElementById("active-rentals-grid");
    if (activeSubs.length === 0) {
      activeGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; padding: 2rem 0;">
          <div class="empty-state-icon"><i class="fa-solid fa-spinner"></i></div>
          <div class="empty-state-title">No active subscriptions</div>
          <p class="empty-state-desc">You don't have any current rental items. Head to the catalog to subscribe!</p>
        </div>
      `;
    } else {
      activeGrid.innerHTML = activeSubs.map(r => `
        <div class="rental-card">
          <div class="rental-card-header">
            <div>
              <span class="status-pill status-${r.status.toLowerCase().replace(" ", "")}">${r.status}</span>
              <h4 class="rental-card-title" style="margin-top:0.5rem;">${r.productName}</h4>
            </div>
            <span style="font-weight:700; font-size:1.1rem; color:var(--primary);">$${r.monthlyRent.toFixed(2)}<small style="font-size:0.75rem; color:var(--text-secondary); font-weight:500;">/mo</small></span>
          </div>
          
          <div class="rental-card-meta">
            <div><i class="fa-solid fa-circle-info"></i> Lease ID: <strong>${r.id}</strong></div>
            <div><i class="fa-solid fa-hourglass-half"></i> Term Plan: <strong>${r.tenureMonths} Months</strong></div>
            <div><i class="fa-solid fa-calendar-days"></i> Lease End: <strong>${r.endDate}</strong></div>
            <div style="margin-top:0.4rem; font-size:0.8rem; color:var(--text-muted);"><i class="fa-solid fa-location-dot"></i> Delivery: ${r.address}</div>
          </div>
          
          <div class="rental-card-actions">
            <button class="btn btn-outline extend-rental-btn" data-id="${r.id}" style="flex:1; font-size:0.8rem; padding: 0.5rem 0.25rem;"><i class="fa-solid fa-calendar-plus"></i> Extend</button>
            <button class="btn btn-outline return-rental-btn" data-id="${r.id}" style="flex:1; font-size:0.8rem; padding: 0.5rem 0.25rem;"><i class="fa-solid fa-truck-pickup"></i> Schedule Return</button>
          </div>
        </div>
      `).join("");

      document.querySelectorAll(".extend-rental-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const rentalId = btn.getAttribute("data-id");
          const extendMonths = prompt("Enter number of months to extend rental tenure (1 to 12):", "3");
          if (extendMonths && !isNaN(extendMonths) && parseInt(extendMonths) > 0) {
            const updated = window.RentEaseDB.extendRental(rentalId, extendMonths);
            if (updated) {
              showToast(`Lease extended successfully! New end date: ${updated.endDate}`);
              renderCustomerDashboard();
            } else {
              showToast("Error extending lease.", "danger");
            }
          }
        });
      });

      document.querySelectorAll(".return-rental-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const rentalId = btn.getAttribute("data-id");
          const conf = confirm("Are you sure you want to schedule a return pickup for this product?");
          if (conf) {
            const updated = window.RentEaseDB.updateRentalStatus(rentalId, "Pickup Scheduled");
            if (updated) {
              showToast("Return pickup scheduled! Vendor will collect it shortly.");
              renderCustomerDashboard();
            }
          }
        });
      });
    }

    const historyTbody = document.getElementById("rental-history-tbody");
    if (pastSubs.length === 0) {
      historyTbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 2rem; color:var(--text-muted);">
            No subscription history records found.
          </td>
        </tr>
      `;
    } else {
      historyTbody.innerHTML = pastSubs.map(r => `
        <tr>
          <td>#${r.id}</td>
          <td><strong>${r.productName}</strong></td>
          <td>${r.tenureMonths} Months</td>
          <td>${r.startDate}</td>
          <td>${r.endDate}</td>
          <td>$${r.monthlyRent.toFixed(2)}/mo</td>
          <td><span class="status-pill status-completed">Completed</span></td>
        </tr>
      `).join("");
    }

    renderCustomerTickets();
  }

  function renderCustomerTickets() {
    const tickets = window.RentEaseDB.getMaintenanceRequests();
    const customerTickets = tickets.filter(t => t.userId === "u1");
    const container = document.getElementById("customer-tickets-container");

    if (customerTickets.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2rem 0;">
          <div class="empty-state-icon"><i class="fa-solid fa-ticket"></i></div>
          <div class="empty-state-title">No support tickets</div>
          <p class="empty-state-desc">Raise a maintenance ticket if you experience any issue with your rented items.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = customerTickets.map(t => `
      <div class="ticket-item">
        <div class="ticket-item-header">
          <h4 style="font-weight:700;">Issue regarding <strong>${t.productName}</strong></h4>
          <span class="status-pill status-${t.status.toLowerCase().replace(" ", "")}">${t.status}</span>
        </div>
        <p class="ticket-desc">${t.issueDescription}</p>
        <div class="ticket-footer">
          <span>Ticket ID: <strong>#${t.id}</strong></span>
          <span>Opened on: <strong>${t.createdAt}</strong></span>
        </div>
      </div>
    `).join("");
  }

  document.getElementById("open-maintenance-btn").addEventListener("click", () => {
    const rentals = window.RentEaseDB.getRentals();
    const activeCustomerRentals = rentals.filter(r => r.userId === "u1" && r.status !== "Completed");
    
    if (activeCustomerRentals.length === 0) {
      showToast("You must have active subscriptions to raise a service ticket", "warning");
      return;
    }

    const select = document.getElementById("maintenance-rental-select");
    select.innerHTML = activeCustomerRentals.map(r => `
      <option value="${r.id}">${r.productName} (Lease #${r.id})</option>
    `).join("");

    document.getElementById("maintenance-description").value = "";
    maintenanceModal.classList.add("active");
  });

  document.getElementById("maintenance-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const rentalId = document.getElementById("maintenance-rental-select").value;
    const desc = document.getElementById("maintenance-description").value;

    const newTicket = window.RentEaseDB.createMaintenanceRequest(rentalId, desc, "customer@rentease.com");
    if (newTicket) {
      showToast("Service ticket raised successfully! Support will reach out soon.");
      closeModals();
      renderCustomerDashboard();
    } else {
      showToast("Failed to file maintenance request", "danger");
    }
  });

  function renderVendorDashboard() {
    const products = window.RentEaseDB.getProducts();
    const rentals = window.RentEaseDB.getRentals();
    const tickets = window.RentEaseDB.getMaintenanceRequests();

    const activeLeases = rentals.filter(r => r.status !== "Completed" && r.status !== "Pending");
    const totalDispatched = activeLeases.length;
    const totalInventoryStock = products.reduce((sum, p) => sum + p.stock, 0);
    const pendingTicketsCount = tickets.filter(t => t.status !== "Resolved" && t.status !== "Closed").length;
    const totalMonthlyRent = activeLeases.reduce((sum, r) => sum + r.monthlyRent, 0);

    document.getElementById("vendor-kpi-monthly-rent").innerText = `$${totalMonthlyRent.toFixed(2)}`;
    document.getElementById("vendor-kpi-dispatched").innerText = totalDispatched;
    document.getElementById("vendor-kpi-stock").innerText = totalInventoryStock;
    document.getElementById("vendor-kpi-tickets").innerText = pendingTicketsCount;

    const productsTbody = document.getElementById("vendor-products-tbody");
    productsTbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap: 0.75rem;">
            <img src="${p.imageUrl}" alt="${p.name}" style="width: 45px; height: 45px; object-fit: cover; border-radius: var(--radius-sm);" onerror="this.src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100'">
            <div>
              <div style="font-weight:700;">${p.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.description}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-primary" style="margin-bottom:0; font-size:0.75rem;">${p.category}</span></td>
        <td><strong>$${p.monthlyRent.toFixed(2)}</strong></td>
        <td>$${p.securityDeposit.toFixed(2)}</td>
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button class="btn btn-outline btn-icon-only stock-dec-btn" data-id="${p.id}" style="width:24px; height:24px; font-size:0.75rem;"><i class="fa-solid fa-minus"></i></button>
            <span style="font-weight:700; width: 20px; text-align:center;">${p.stock}</span>
            <button class="btn btn-outline btn-icon-only stock-inc-btn" data-id="${p.id}" style="width:24px; height:24px; font-size:0.75rem;"><i class="fa-solid fa-plus"></i></button>
          </div>
        </td>
        <td>
          <button class="btn btn-outline btn-icon-only delete-product-btn" data-id="${p.id}" style="color:var(--danger); border-color:transparent;" title="Delete Product">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join("");

    document.querySelectorAll(".stock-inc-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const prod = products.find(p => p.id === id);
        if (prod) {
          window.RentEaseDB.updateProduct(id, { stock: prod.stock + 1 });
          renderVendorDashboard();
          showToast(`Stock updated for ${prod.name}`);
        }
      });
    });

    document.querySelectorAll(".stock-dec-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const prod = products.find(p => p.id === id);
        if (prod && prod.stock > 0) {
          window.RentEaseDB.updateProduct(id, { stock: prod.stock - 1 });
          renderVendorDashboard();
          showToast(`Stock updated for ${prod.name}`);
        }
      });
    });

    document.querySelectorAll(".delete-product-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const conf = confirm("Are you sure you want to delete this product from the platform catalog?");
        if (conf) {
          window.RentEaseDB.deleteProduct(id);
          renderVendorDashboard();
          showToast("Product deleted successfully", "warning");
        }
      });
    });

    const rentalsTbody = document.getElementById("vendor-rentals-tbody");
    if (rentals.length === 0) {
      rentalsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--text-muted)">No orders/rentals logs.</td></tr>`;
    } else {
      rentalsTbody.innerHTML = rentals.map(r => {
        let actionBtn = "";
        if (r.status === "Pending") {
          actionBtn = `<button class="btn btn-primary btn-sm update-lease-status-btn" data-id="${r.id}" data-next="Confirmed" style="padding: 0.35rem 0.75rem; font-size:0.75rem;">Approve Lease</button>`;
        } else if (r.status === "Confirmed") {
          actionBtn = `<button class="btn btn-outline btn-sm update-lease-status-btn" data-id="${r.id}" data-next="Delivered" style="padding: 0.35rem 0.75rem; font-size:0.75rem;"><i class="fa-solid fa-truck"></i> Ship out</button>`;
        } else if (r.status === "Delivered") {
          actionBtn = `<button class="btn btn-primary btn-sm update-lease-status-btn" data-id="${r.id}" data-next="Active" style="padding: 0.35rem 0.75rem; font-size:0.75rem;"><i class="fa-solid fa-circle-play"></i> Activate</button>`;
        } else if (r.status === "Pickup Scheduled") {
          actionBtn = `<button class="btn btn-secondary btn-sm update-lease-status-btn" data-id="${r.id}" data-next="Completed" style="padding: 0.35rem 0.75rem; font-size:0.75rem;"><i class="fa-solid fa-circle-check"></i> Collect & Close</button>`;
        } else {
          actionBtn = `<span style="font-size:0.75rem; color:var(--text-muted);">Fully Managed</span>`;
        }

        return `
          <tr>
            <td>#${r.id}</td>
            <td><strong>${r.userName}</strong></td>
            <td>${r.productName}</td>
            <td>${r.deliveryDate}</td>
            <td><span class="status-pill status-${r.status.toLowerCase().replace(" ", "")}">${r.status}</span></td>
            <td>${actionBtn}</td>
          </tr>
        `;
      }).join("");

      document.querySelectorAll(".update-lease-status-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const nextState = btn.getAttribute("data-next");
          const updated = window.RentEaseDB.updateRentalStatus(id, nextState);
          if (updated) {
            showToast(`Lease status updated to ${nextState}`);
            renderVendorDashboard();
          }
        });
      });
    }

    const vendorTicketsTbody = document.getElementById("vendor-tickets-tbody");
    if (tickets.length === 0) {
      vendorTicketsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No service tickets raised.</td></tr>`;
    } else {
      vendorTicketsTbody.innerHTML = tickets.map(t => {
        let actionControls = "";
        if (t.status === "Open") {
          actionControls = `<button class="btn btn-outline btn-sm update-ticket-status-btn" data-id="${t.id}" data-next="Assigned" style="padding: 0.35rem 0.75rem; font-size:0.75rem;">Assign Crew</button>`;
        } else if (t.status === "Assigned") {
          actionControls = `<button class="btn btn-outline btn-sm update-ticket-status-btn" data-id="${t.id}" data-next="In Progress" style="padding: 0.35rem 0.75rem; font-size:0.75rem;">Work In Progress</button>`;
        } else if (t.status === "In Progress") {
          actionControls = `<button class="btn btn-primary btn-sm update-ticket-status-btn" data-id="${t.id}" data-next="Resolved" style="padding: 0.35rem 0.75rem; font-size:0.75rem;"><i class="fa-solid fa-circle-check"></i> Mark Resolved</button>`;
        } else if (t.status === "Resolved") {
          actionControls = `<button class="btn btn-secondary btn-sm update-ticket-status-btn" data-id="${t.id}" data-next="Closed" style="padding: 0.35rem 0.75rem; font-size:0.75rem;">Close Ticket</button>`;
        } else {
          actionControls = `<span style="font-size:0.75rem; color:var(--text-muted)">Resolved</span>`;
        }

        return `
          <tr>
            <td><strong>#${t.id}</strong></td>
            <td><strong>${t.userName}</strong></td>
            <td><div style="font-size:0.85rem; max-width: 250px; line-height: 1.4;">${t.issueDescription}</div></td>
            <td>${t.createdAt}</td>
            <td><span class="status-pill status-${t.status.toLowerCase().replace(" ", "")}">${t.status}</span></td>
            <td>${actionControls}</td>
          </tr>
        `;
      }).join("");

      document.querySelectorAll(".update-ticket-status-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const nextState = btn.getAttribute("data-next");
          const updated = window.RentEaseDB.updateMaintenanceStatus(id, nextState);
          if (updated) {
            showToast(`Ticket status updated to ${nextState}`);
            renderVendorDashboard();
          }
        });
      });
    }
  }

  document.getElementById("add-product-toggle-btn").addEventListener("click", () => {
    document.getElementById("product-create-form").reset();
    document.getElementById("product-form-modal-title").innerText = "Add New Product to Catalog";
    productFormModal.classList.add("active");
  });

  document.getElementById("product-create-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const newProduct = {
      name: document.getElementById("prod-name").value,
      category: document.getElementById("prod-category").value,
      stock: document.getElementById("prod-stock").value,
      monthlyRent: document.getElementById("prod-rent").value,
      securityDeposit: document.getElementById("prod-deposit").value,
      imageUrl: document.getElementById("prod-image").value,
      description: document.getElementById("prod-desc").value
    };

    const added = window.RentEaseDB.addProduct(newProduct);
    if (added) {
      showToast(`${added.name} successfully added to platform catalog!`);
      closeModals();
      renderVendorDashboard();
    } else {
      showToast("Error adding product to database", "danger");
    }
  });

  function renderAdminDashboard() {
    const kpi = window.RentEaseDB.getKPIs();
    const users = window.RentEaseDB.getUsers();
    const rentals = window.RentEaseDB.getRentals();

    document.getElementById("admin-kpi-users").innerText = kpi.totalUsers;
    document.getElementById("admin-kpi-rentals").innerText = kpi.activeRentalsCount;
    document.getElementById("admin-kpi-mrr").innerText = `$${kpi.monthlyRevenue.toFixed(2)}`;
    document.getElementById("admin-kpi-utilization").innerText = `${kpi.utilizationRate}%`;

    const usersTbody = document.getElementById("admin-users-tbody");
    usersTbody.innerHTML = users.map(u => `
      <tr>
        <td>#${u.id}</td>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone || "Not Configured"}</td>
        <td><span class="badge ${u.role === 'Admin' ? 'badge-primary' : 'badge-secondary'}" style="margin-bottom:0; font-size:0.75rem;">${u.role}</span></td>
      </tr>
    `).join("");

    const rentalsTbody = document.getElementById("admin-rentals-tbody");
    if (rentals.length === 0) {
      rentalsTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--text-muted)">No leases exist.</td></tr>`;
    } else {
      rentalsTbody.innerHTML = rentals.map(r => `
        <tr>
          <td>#${r.id}</td>
          <td><strong>${r.userName}</strong></td>
          <td>${r.productName}</td>
          <td><strong>$${r.securityDeposit.toFixed(2)}</strong></td>
          <td><div style="font-size:0.8rem;">${r.startDate} to ${r.endDate} (${r.tenureMonths}m)</div></td>
          <td><span class="status-pill status-${r.status.toLowerCase().replace(" ", "")}">${r.status}</span></td>
          <td>
            <select class="form-control admin-status-override-select" data-id="${r.id}" style="padding: 0.25rem 0.5rem; font-size:0.75rem; height: auto; width:130px;">
              <option value="Pending" ${r.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Confirmed" ${r.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Delivered" ${r.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Active" ${r.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Extended" ${r.status === 'Extended' ? 'selected' : ''}>Extended</option>
              <option value="Pickup Scheduled" ${r.status === 'Pickup Scheduled' ? 'selected' : ''}>Pickup Scheduled</option>
              <option value="Completed" ${r.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </td>
        </tr>
      `).join("");

      document.querySelectorAll(".admin-status-override-select").forEach(select => {
        select.addEventListener("change", (e) => {
          const id = select.getAttribute("data-id");
          const nextState = e.target.value;
          const updated = window.RentEaseDB.updateRentalStatus(id, nextState);
          if (updated) {
            showToast(`Lease #${id} state overridden to ${nextState} by Admin`);
            renderAdminDashboard();
          }
        });
      });
    }

    setTimeout(renderAdminCharts, 50);
  }

  function renderAdminCharts() {
    const kpi = window.RentEaseDB.getKPIs();
    
    const isLightTheme = !document.body.classList.contains("dark-theme");
    const textColor = isLightTheme ? "#475569" : "#94a3b8";
    const gridColor = isLightTheme ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";

    const trendCtx = document.getElementById("adminTrendChart");
    if (trendCtx) {
      if (trendChart) trendChart.destroy();
      
      const labels = Object.keys(kpi.recentRentalsByMonth);
      const dataValues = Object.values(kpi.recentRentalsByMonth);

      trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Leases Initiated',
            data: dataValues,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: '#6366f1',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: 500 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: { 
                color: textColor, 
                stepSize: 1, 
                font: { family: 'Plus Jakarta Sans', weight: 500 } 
              }
            }
          }
        }
      });
    }

    const categoryCtx = document.getElementById("adminCategoryChart");
    if (categoryCtx) {
      if (categoryChart) categoryChart.destroy();

      const labels = Object.keys(kpi.categoryStats);
      const dataValues = Object.values(kpi.categoryStats);

      categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: ['#6366f1', '#06b6d4', '#f59e0b', '#10b981'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: textColor,
                font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 },
                boxWidth: 12,
                padding: 15
              }
            }
          },
          cutout: '65%'
        }
      });
    }
  }
});
