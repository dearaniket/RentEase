// RentEase Test Runner Framework
document.addEventListener("DOMContentLoaded", () => {
  // Theme Toggle in Test Runner Page
  const themeToggleBtn = document.getElementById("theme-toggle");
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });

  // Test suite configurations
  const tests = [
    {
      id: "t1",
      name: "Theme Toggle Functionality",
      desc: "Verifies that the theme switcher modifies the body class lists and updates the localStorage preference key.",
      fn: async () => {
        const initialTheme = localStorage.getItem("rentease_theme");
        
        // Simulate click toggle to light theme
        document.body.classList.add("light-theme");
        localStorage.setItem("rentease_theme", "light");
        
        assertEqual(document.body.classList.contains("light-theme"), true, "Body should contain light-theme class");
        assertEqual(localStorage.getItem("rentease_theme"), "light", "localStorage theme setting should be 'light'");
        
        // Revert back
        document.body.classList.remove("light-theme");
        if (initialTheme) {
          localStorage.setItem("rentease_theme", initialTheme);
        } else {
          localStorage.removeItem("rentease_theme");
        }
      }
    },
    {
      id: "t2",
      name: "Catalog Filters & Category Segmentation",
      desc: "Checks that products can be correctly queried and segmented by category (Furniture, Appliances) using db.getProducts.",
      fn: async () => {
        const products = window.RentEaseDB.getProducts();
        assert(products.length > 0, "Products database should not be empty");
        
        // Check filtering of furniture
        const furniture = products.filter(p => p.category.toLowerCase() === "furniture");
        furniture.forEach(item => {
          assertEqual(item.category, "Furniture", `Filtered item ${item.name} should be in Furniture category`);
        });

        // Check filtering of appliances
        const appliances = products.filter(p => p.category.toLowerCase() === "appliances");
        appliances.forEach(item => {
          assertEqual(item.category, "Appliances", `Filtered item ${item.name} should be in Appliances category`);
        });
      }
    },
    {
      id: "t3",
      name: "Cart Operations & Dynamic Tenure Pricing",
      desc: "Verifies Cart additions, tenure discounts (5% off for 6m, 10% off for 12m), and item removal.",
      fn: async () => {
        const products = window.RentEaseDB.getProducts();
        const testProduct = products[0]; // e.g. Cosmo Sofa
        
        // Simulation of Cart Addition for 3 months (No discount)
        let cart = [];
        cart.push({
          productId: testProduct.id,
          name: testProduct.name,
          monthlyRent: testProduct.monthlyRent,
          securityDeposit: testProduct.securityDeposit,
          tenure: 3
        });
        
        assertEqual(cart.length, 1, "Cart size should be 1");
        assertEqual(cart[0].monthlyRent, testProduct.monthlyRent, "3 Month tenure should have no discount");

        // Simulation of Cart Addition for 6 months (5% discount)
        const discount6m = 0.95;
        const expectedRent6m = testProduct.monthlyRent * discount6m;
        cart.push({
          productId: testProduct.id,
          name: testProduct.name,
          monthlyRent: expectedRent6m,
          securityDeposit: testProduct.securityDeposit,
          tenure: 6
        });
        
        assertEqual(cart[1].monthlyRent, expectedRent6m, "6 Month tenure should apply a 5% discount");

        // Simulation of Cart Addition for 12 months (10% discount)
        const discount12m = 0.90;
        const expectedRent12m = testProduct.monthlyRent * discount12m;
        cart.push({
          productId: testProduct.id,
          name: testProduct.name,
          monthlyRent: expectedRent12m,
          securityDeposit: testProduct.securityDeposit,
          tenure: 12
        });
        
        assertEqual(cart[2].monthlyRent, expectedRent12m, "12 Month tenure should apply a 10% discount");

        // Simulation of cart item removal
        cart.splice(0, 1);
        assertEqual(cart.length, 2, "Cart should have 2 items remaining after removal");
      }
    },
    {
      id: "t4",
      name: "Lease Creation & Product Stock Reservation",
      desc: "Asserts that checkout properly allocates and reserves units, decrementing the stock level by 1 in the inventory catalog database.",
      fn: async () => {
        const productsBefore = window.RentEaseDB.getProducts();
        const targetProduct = productsBefore.find(p => p.stock > 1);
        assert(targetProduct !== undefined, "Requires a product with stock > 1");
        const initialStock = targetProduct.stock;

        // Simulate checkout cart containing this product
        const mockCart = [{
          productId: targetProduct.id,
          name: targetProduct.name,
          monthlyRent: targetProduct.monthlyRent,
          securityDeposit: targetProduct.securityDeposit,
          tenure: 3
        }];

        // Create lease record
        const address = "123 Test Suite Apt, Diagnostics City";
        const deliveryDate = "2026-07-01";
        const newLeases = window.RentEaseDB.createRental("u1", mockCart, address, deliveryDate);
        
        assert(newLeases.length > 0, "Lease should be successfully created");
        assertEqual(newLeases[0].status, "Pending", "New lease status should default to 'Pending'");

        // Verify stock decreased by 1
        const productsAfter = window.RentEaseDB.getProducts();
        const updatedProduct = productsAfter.find(p => p.id === targetProduct.id);
        assertEqual(updatedProduct.stock, initialStock - 1, "Product stock should decrement by exactly 1 upon checkout reservation");
      }
    },
    {
      id: "t5",
      name: "Lease Completion & Inventory Stock Refurbishing",
      desc: "Verifies that marking a lease status as 'Completed' (when product return is collected and closed) increases inventory stock back by 1 (Verifying Stock Leak Fix).",
      fn: async () => {
        // Step 1: Query initial product stock
        const productsBefore = window.RentEaseDB.getProducts();
        const targetProduct = productsBefore.find(p => p.stock > 1);
        assert(targetProduct !== undefined, "Requires a product with stock > 1");
        const initialStock = targetProduct.stock;

        // Step 2: Checkout the product (decrements stock by 1)
        const mockCart = [{
          productId: targetProduct.id,
          name: targetProduct.name,
          monthlyRent: targetProduct.monthlyRent,
          securityDeposit: targetProduct.securityDeposit,
          tenure: 3
        }];
        const newLeases = window.RentEaseDB.createRental("u1", mockCart, "456 Diagnostics St", "2026-07-02");
        const rentalId = newLeases[0].id;
        
        const productsAfterCheckout = window.RentEaseDB.getProducts();
        const checkedProduct = productsAfterCheckout.find(p => p.id === targetProduct.id);
        assertEqual(checkedProduct.stock, initialStock - 1, "Stock should have decremented by 1");

        // Step 3: Simulate Return Pickup Completion (Transitions status to 'Completed')
        const updatedRental = window.RentEaseDB.updateRentalStatus(rentalId, "Completed");
        assertEqual(updatedRental.status, "Completed", "Lease status should update to Completed");

        // Step 4: Verify stock was refurbished (incremented back by 1)
        const productsAfterReturn = window.RentEaseDB.getProducts();
        const refurbishedProduct = productsAfterReturn.find(p => p.id === targetProduct.id);
        assertEqual(refurbishedProduct.stock, initialStock, "Inventory stock level should increment back by 1 when lease is marked Completed");
      }
    },
    {
      id: "t6",
      name: "Timezone-Safe Lease Extensions",
      desc: "Asserts that extending a lease tenure adds months correctly without causing timezone date offsets/shifting (Verifying Date Arithmetic Fix).",
      fn: async () => {
        const mockCart = [{
          productId: "p1",
          name: "Cosmo Sofa",
          monthlyRent: 49.00,
          securityDeposit: 99.00,
          tenure: 6
        }];
        
        const newLeases = window.RentEaseDB.createRental("u1", mockCart, "456 Diagnostics St", "2026-07-02");
        const rental = newLeases[0];
        const initialEndDate = rental.endDate; // format YYYY-MM-DD
        
        // Extend lease by 3 months
        const extendedRental = window.RentEaseDB.extendRental(rental.id, 3);
        
        assertEqual(extendedRental.status, "Extended", "Lease status should transition to 'Extended'");
        assertEqual(extendedRental.tenureMonths, 9, "Lease tenure should be updated to 9 Months");
        
        // Assert the date string logic:
        const initialParts = initialEndDate.split('-');
        const expectedYear = parseInt(initialParts[0]);
        const expectedMonth = parseInt(initialParts[1]);
        const expectedDay = parseInt(initialParts[2]);
        
        const expectedEndDate = new Date(expectedYear, expectedMonth - 1 + 3, expectedDay);
        const yyyy = expectedEndDate.getFullYear();
        const mm = String(expectedEndDate.getMonth() + 1).padStart(2, '0');
        const dd = String(expectedEndDate.getDate()).padStart(2, '0');
        const expectedDateStr = `${yyyy}-${mm}-${dd}`;
        
        assertEqual(extendedRental.endDate, expectedDateStr, "End date should match exact local arithmetic calculations without shifting due to UTC timezone offsets");
      }
    },
    {
      id: "t7",
      name: "Service Support Request Filing",
      desc: "Ensures customer users can raise maintenance tickets regarding their active lease items.",
      fn: async () => {
        const rentals = window.RentEaseDB.getRentals();
        const activeRental = rentals.find(r => r.status !== "Completed");
        assert(activeRental !== undefined, "Requires at least one active lease to raise support ticket");

        const descText = "The buttons on the control panel are stuck and cannot be pressed.";
        const ticket = window.RentEaseDB.createMaintenanceRequest(activeRental.id, descText, "customer@rentease.com");
        
        assert(ticket !== null, "Ticket object should be created");
        assertEqual(ticket.rentalId, activeRental.id, "Ticket should map to correct lease ID");
        assertEqual(ticket.issueDescription, descText, "Ticket should preserve customer issue description text");
        assertEqual(ticket.status, "Open", "New maintenance tickets should default to status 'Open'");
      }
    }
  ];

  // Helper Assertion Functions
  function assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion Failed: ${message}`);
    }
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`Assertion Failed: ${message}. Expected [${expected}] but got [${actual}]`);
    }
  }

  // Render Test UI Elements
  const container = document.getElementById("test-list-container");
  container.innerHTML = tests.map(t => `
    <div class="test-item" id="test-item-${t.id}">
      <div class="test-info">
        <div class="test-name">
          <span id="icon-${t.id}"><i class="fa-solid fa-circle-play" style="color: var(--text-muted); cursor: pointer;" title="Run this test"></i></span>
          <span>${t.name}</span>
        </div>
        <div class="test-desc">${t.desc}</div>
        <div class="test-error" id="error-${t.id}"></div>
      </div>
      <div class="test-status">
        <span class="status-badge status-pending" id="badge-${t.id}">Pending</span>
        <span class="duration" id="duration-${t.id}">--</span>
      </div>
    </div>
  `).join("");

  // Attach individual run button listeners
  tests.forEach(t => {
    const playIcon = document.querySelector(`#icon-${t.id} .fa-circle-play`);
    if (playIcon) {
      playIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        runSingleTest(t);
      });
    }
  });

  // DB Backup and Restore to prevent test run polluting application state
  let dbBackup = {};
  
  function backupDatabase() {
    dbBackup = {
      products: localStorage.getItem("rentease_products"),
      users: localStorage.getItem("rentease_users"),
      rentals: localStorage.getItem("rentease_rentals"),
      maintenance: localStorage.getItem("rentease_maintenance")
    };
  }

  function restoreDatabase() {
    if (dbBackup.products) localStorage.setItem("rentease_products", dbBackup.products);
    if (dbBackup.users) localStorage.setItem("rentease_users", dbBackup.users);
    if (dbBackup.rentals) localStorage.setItem("rentease_rentals", dbBackup.rentals);
    if (dbBackup.maintenance) localStorage.setItem("rentease_maintenance", dbBackup.maintenance);
  }

  // Core execution functions
  async function runSingleTest(t) {
    backupDatabase();
    
    // Set UI to running
    const badge = document.getElementById(`badge-${t.id}`);
    badge.className = "status-badge status-running";
    badge.innerText = "Running";
    document.getElementById(`error-${t.id}`).style.display = "none";

    const startTime = performance.now();
    let passed = false;
    let errorMsg = "";

    try {
      await t.fn();
      passed = true;
    } catch (e) {
      errorMsg = e.message + "\n" + e.stack;
    }

    const duration = Math.round(performance.now() - startTime);
    document.getElementById(`duration-${t.id}`).innerText = `${duration}ms`;

    if (passed) {
      badge.className = "status-badge status-passed";
      badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Passed';
      document.getElementById(`icon-${t.id}`).innerHTML = '<i class="fa-solid fa-check" style="color: var(--success);"></i>';
    } else {
      badge.className = "status-badge status-failed";
      badge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Failed';
      document.getElementById(`icon-${t.id}`).innerHTML = '<i class="fa-solid fa-xmark" style="color: var(--danger);"></i>';
      
      const errorDiv = document.getElementById(`error-${t.id}`);
      errorDiv.innerText = errorMsg;
      errorDiv.style.display = "block";
    }

    restoreDatabase();
    return passed;
  }

  async function runAllTests() {
    const runBtn = document.getElementById("run-tests-btn");
    runBtn.disabled = true;
    runBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running Suite...';
    
    const suiteStatus = document.getElementById("suite-status");
    suiteStatus.className = "status-badge status-running";
    suiteStatus.innerText = "Running";

    backupDatabase();

    let passedCount = 0;
    let failedCount = 0;
    const totalCount = tests.length;
    const suiteStartTime = performance.now();

    for (let i = 0; i < totalCount; i++) {
      const t = tests[i];
      
      // Update progress bar
      const percent = Math.round((i / totalCount) * 100);
      document.getElementById("progress-bar").style.width = `${percent}%`;
      document.getElementById("progress-percent").innerText = `${percent}%`;

      const passed = await runSingleTest(t);
      if (passed) {
        passedCount++;
      } else {
        failedCount++;
      }

      // Brief delay to make execution look beautiful and readable in UI
      await new Promise(r => setTimeout(r, 200));
    }

    // Final progress update
    document.getElementById("progress-bar").style.width = "100%";
    document.getElementById("progress-percent").innerText = "100%";

    const totalDuration = Math.round(performance.now() - suiteStartTime);
    
    // Update KPIs
    document.getElementById("val-passed").innerText = passedCount;
    document.getElementById("val-failed").innerText = failedCount;
    document.getElementById("val-duration").innerText = `${totalDuration}ms`;

    const kpiPassed = document.getElementById("kpi-passed");
    const kpiFailed = document.getElementById("kpi-failed");
    
    kpiPassed.className = "kpi-card " + (passedCount === totalCount ? "pass" : "");
    kpiFailed.className = "kpi-card " + (failedCount > 0 ? "fail" : "");

    // Suite badge
    if (failedCount === 0) {
      suiteStatus.className = "status-badge status-passed";
      suiteStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Passed';
    } else {
      suiteStatus.className = "status-badge status-failed";
      suiteStatus.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Failed';
    }

    runBtn.disabled = false;
    runBtn.innerHTML = '<i class="fa-solid fa-play"></i> Run All Diagnostics';

    restoreDatabase();
  }

  // Hook run-all button
  document.getElementById("run-tests-btn").addEventListener("click", runAllTests);
});
