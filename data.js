// Local mock data store using localStorage

const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    name: "Cosmo 3-Seater Fabric Sofa",
    category: "Furniture",
    description: "Premium velvet fabric sofa with high-density foam cushions and solid eucalyptus wood frame. Super comfortable and fits any modern living room setup.",
    monthlyRent: 49.00,
    securityDeposit: 99.00,
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "p2",
    name: "Luxury Queen Platform Bed",
    category: "Furniture",
    description: "Elegant queen-sized platform bed with an upholstered headboard, strong wooden slats, and no box spring required. Designed for premium comfort and style.",
    monthlyRent: 39.00,
    securityDeposit: 79.00,
    stock: 5,
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "p3",
    name: "Premium Solid Wood Dining Set",
    category: "Furniture",
    description: "Beautiful dining table made of solid oak wood, complete with 4 cushioned chairs. Perfect for dinner parties and family meals.",
    monthlyRent: 35.00,
    securityDeposit: 70.00,
    stock: 4,
    imageUrl: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "p4",
    name: "Ergonomic Height-Adjustable Desk",
    category: "Furniture",
    description: "Electric height-adjustable standing desk with dual motor and memory presets. Ideal for a productive and healthy work-from-home layout.",
    monthlyRent: 29.00,
    securityDeposit: 60.00,
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "p5",
    name: "Sleek Slide-door Wardrobe",
    category: "Furniture",
    description: "Spacious double-door wardrobe with sliding mirror panel, multiple hanging rods, and integrated drawers for optimal bedroom storage.",
    monthlyRent: 32.00,
    securityDeposit: 65.00,
    stock: 6,
    imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "p6",
    name: "Premium Ergonomic Mesh Chair",
    category: "Furniture",
    description: "High-back office chair with adjustable 3D armrests, lumbar support, and breathable cooling mesh. Perfect companion for your study desk.",
    monthlyRent: 15.00,
    securityDeposit: 30.00,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "p7",
    name: "Smart Double-Door Refrigerator (350L)",
    category: "Appliances",
    description: "Energy-efficient frost-free refrigerator featuring smart inverter technology, convertible freezer, and digital display control.",
    monthlyRent: 45.00,
    securityDeposit: 120.00,
    stock: 6,
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "p8",
    name: "Front Load Fully-Automatic Washer (8kg)",
    category: "Appliances",
    description: "Inverter front-load washing machine with steam wash, custom allergen cycle, and quiet operation mode. Keeps your clothes pristine.",
    monthlyRent: 38.00,
    securityDeposit: 90.00,
    stock: 7,
    imageUrl: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "p9",
    name: "Ultra HD 4K OLED Smart TV (55\")",
    category: "Appliances",
    description: "Vibrant self-lit OLED pixels, Dolby Vision IQ, Dolby Atmos sound system, and built-in streaming apps for an unparalleled home theater experience.",
    monthlyRent: 42.00,
    securityDeposit: 100.00,
    stock: 5,
    imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "p10",
    name: "Convection Microwave Oven (28L)",
    category: "Appliances",
    description: "Touch keypad control microwave supporting grill, bake, defrost, and multi-stage healthy cooking features. Clean touch door design.",
    monthlyRent: 18.00,
    securityDeposit: 40.00,
    stock: 10,
    imageUrl: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "p11",
    name: "Inverter Split Air Conditioner (1.5 Ton)",
    category: "Appliances",
    description: "5-Star split air conditioner featuring high ambient cooling, active PM 2.5 filter, and smart app scheduling options for perfect sleep.",
    monthlyRent: 49.00,
    securityDeposit: 150.00,
    stock: 4,
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80"
  }
];

const DEFAULT_USERS = [
  { id: "u1", name: "Jane Doe", email: "customer@rentease.com", phone: "+1 555-0199", role: "Customer" },
  { id: "u2", name: "Apex Rentals Ltd.", email: "vendor@rentease.com", phone: "+1 555-0188", role: "Vendor" },
  { id: "u3", name: "Super Admin", email: "admin@rentease.com", phone: "+1 555-0100", role: "Admin" }
];

const DEFAULT_RENTALS = [
  {
    id: "r1",
    userId: "u1",
    userName: "Jane Doe",
    productId: "p1",
    productName: "Cosmo 3-Seater Fabric Sofa",
    monthlyRent: 49.00,
    securityDeposit: 99.00,
    tenureMonths: 6,
    startDate: "2026-02-15",
    endDate: "2026-08-15",
    status: "Active", // Confirmed, Delivered, Active, Extended, Pickup Scheduled, Completed
    address: "Apt 4B, 128 Pine Street, Seattle, WA",
    deliveryDate: "2026-02-17"
  },
  {
    id: "r2",
    userId: "u1",
    userName: "Jane Doe",
    productId: "p6",
    productName: "Premium Ergonomic Mesh Chair",
    monthlyRent: 15.00,
    securityDeposit: 30.00,
    tenureMonths: 3,
    startDate: "2025-10-01",
    endDate: "2026-01-01",
    status: "Completed",
    address: "Apt 4B, 128 Pine Street, Seattle, WA",
    deliveryDate: "2025-10-03"
  },
  {
    id: "r3",
    userId: "u1",
    userName: "Jane Doe",
    productId: "p7",
    productName: "Smart Double-Door Refrigerator (350L)",
    monthlyRent: 45.00,
    securityDeposit: 120.00,
    tenureMonths: 12,
    startDate: "2026-05-10",
    endDate: "2027-05-10",
    status: "Delivered",
    address: "Apt 4B, 128 Pine Street, Seattle, WA",
    deliveryDate: "2026-05-12"
  }
];

const DEFAULT_MAINTENANCE = [
  {
    id: "m1",
    rentalId: "r3",
    productName: "Smart Double-Door Refrigerator (350L)",
    userId: "u1",
    userName: "Jane Doe",
    issueDescription: "The refrigerator's cooling has stopped suddenly and there is water leakage from the bottom compartment.",
    status: "Assigned", // Open, Assigned, In Progress, Resolved, Closed
    createdAt: "2026-06-15",
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150"]
  }
];

// Setup local storage with initial dataset if not already populated
function initDatabase() {
  if (!localStorage.getItem("rentease_products")) {
    localStorage.setItem("rentease_products", JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem("rentease_users")) {
    localStorage.setItem("rentease_users", JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem("rentease_rentals")) {
    localStorage.setItem("rentease_rentals", JSON.stringify(DEFAULT_RENTALS));
  }
  if (!localStorage.getItem("rentease_maintenance")) {
    localStorage.setItem("rentease_maintenance", JSON.stringify(DEFAULT_MAINTENANCE));
  }
}

initDatabase();

const db = {
  getProducts: () => JSON.parse(localStorage.getItem("rentease_products")),
  saveProducts: (products) => localStorage.setItem("rentease_products", JSON.stringify(products)),
  addProduct: (product) => {
    const products = db.getProducts();
    const newProduct = {
      id: "p_" + Date.now(),
      ...product,
      monthlyRent: parseFloat(product.monthlyRent),
      securityDeposit: parseFloat(product.securityDeposit),
      stock: parseInt(product.stock)
    };
    products.push(newProduct);
    db.saveProducts(products);
    return newProduct;
  },
  updateProduct: (id, updatedFields) => {
    const products = db.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...updatedFields };
      db.saveProducts(products);
      return products[idx];
    }
    return null;
  },
  deleteProduct: (id) => {
    let products = db.getProducts();
    products = products.filter(p => p.id !== id);
    db.saveProducts(products);
  },

  getUsers: () => JSON.parse(localStorage.getItem("rentease_users")),
  saveUsers: (users) => localStorage.setItem("rentease_users", JSON.stringify(users)),
  addUser: (name, email, role = "Customer", phone = "") => {
    const users = db.getUsers();
    const newUser = { id: "u_" + Date.now(), name, email, phone, role };
    users.push(newUser);
    db.saveUsers(users);
    return newUser;
  },

  getRentals: () => JSON.parse(localStorage.getItem("rentease_rentals")),
  saveRentals: (rentals) => localStorage.setItem("rentease_rentals", JSON.stringify(rentals)),
  createRental: (userId, cart, address, deliveryDate) => {
    const rentals = db.getRentals();
    const products = db.getProducts();
    const users = db.getUsers();
    const user = users.find(u => u.id === userId) || { name: "Jane Doe" };

    const newRentals = [];
    cart.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p && p.stock >= 1) {
        // Decrement stock
        p.stock -= 1;
        
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const startDateStr = `${yyyy}-${mm}-${dd}`;

        const endDate = new Date(yyyy, today.getMonth() + parseInt(item.tenure), today.getDate());
        const yyyyEnd = endDate.getFullYear();
        const mmEnd = String(endDate.getMonth() + 1).padStart(2, '0');
        const ddEnd = String(endDate.getDate()).padStart(2, '0');
        const endDateStr = `${yyyyEnd}-${mmEnd}-${ddEnd}`;

        const rental = {
          id: "r_" + Math.random().toString(36).substring(2, 9),
          userId: userId,
          userName: user.name,
          productId: p.id,
          productName: p.name,
          monthlyRent: p.monthlyRent,
          securityDeposit: p.securityDeposit,
          tenureMonths: parseInt(item.tenure),
          startDate: startDateStr,
          endDate: endDateStr,
          status: "Pending", // Default is Pending
          address: address,
          deliveryDate: deliveryDate
        };
        rentals.push(rental);
        newRentals.push(rental);
      }
    });

    db.saveProducts(products);
    db.saveRentals(rentals);
    return newRentals;
  },
  updateRentalStatus: (id, status) => {
    const rentals = db.getRentals();
    const idx = rentals.findIndex(r => r.id === id);
    if (idx !== -1) {
      const oldStatus = rentals[idx].status;
      const newStatus = status;

      if (oldStatus !== newStatus) {
        rentals[idx].status = status;

        // Stock adjustment logic
        // If transitioning to Completed (returned), increment stock
        if (newStatus === "Completed" && oldStatus !== "Completed") {
          const products = db.getProducts();
          const p = products.find(prod => prod.id === rentals[idx].productId);
          if (p) {
            p.stock += 1;
            db.saveProducts(products);
          }
        }
        // If transitioning away from Completed (e.g., admin override), decrement stock
        else if (oldStatus === "Completed" && newStatus !== "Completed") {
          const products = db.getProducts();
          const p = products.find(prod => prod.id === rentals[idx].productId);
          if (p) {
            p.stock = Math.max(0, p.stock - 1);
            db.saveProducts(products);
          }
        }
      }
      db.saveRentals(rentals);
      return rentals[idx];
    }
    return null;
  },
  extendRental: (id, months) => {
    const rentals = db.getRentals();
    const idx = rentals.findIndex(r => r.id === id);
    if (idx !== -1) {
      const r = rentals[idx];
      r.tenureMonths += parseInt(months);
      
      const parts = r.endDate.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const day = parseInt(parts[2]);
      
      const end = new Date(year, month - 1 + parseInt(months), day);
      
      const yyyy = end.getFullYear();
      const mm = String(end.getMonth() + 1).padStart(2, '0');
      const dd = String(end.getDate()).padStart(2, '0');
      r.endDate = `${yyyy}-${mm}-${dd}`;
      r.status = "Extended";
      db.saveRentals(rentals);
      return r;
    }
    return null;
  },

  getMaintenanceRequests: () => JSON.parse(localStorage.getItem("rentease_maintenance")),
  saveMaintenanceRequests: (requests) => localStorage.setItem("rentease_maintenance", JSON.stringify(requests)),
  createMaintenanceRequest: (rentalId, desc, userEmail) => {
    const rentals = db.getRentals();
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) return null;

    const requests = db.getMaintenanceRequests();
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const localDateStr = `${yyyy}-${mm}-${dd}`;

    const newRequest = {
      id: "m_" + Math.random().toString(36).substring(2, 9),
      rentalId: rentalId,
      productName: rental.productName,
      userId: rental.userId,
      userName: rental.userName,
      issueDescription: desc,
      status: "Open", // Open, Assigned, In Progress, Resolved, Closed
      createdAt: localDateStr,
      images: ["https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150"] // Mock image upload
    };
    requests.push(newRequest);
    db.saveMaintenanceRequests(requests);
    return newRequest;
  },
  updateMaintenanceStatus: (id, status) => {
    const requests = db.getMaintenanceRequests();
    const idx = requests.findIndex(m => m.id === id);
    if (idx !== -1) {
      requests[idx].status = status;
      db.saveMaintenanceRequests(requests);
      return requests[idx];
    }
    return null;
  },

  getKPIs: () => {
    const rentals = db.getRentals();
    const products = db.getProducts();
    const users = db.getUsers();
    const maintenance = db.getMaintenanceRequests();

    const totalUsers = users.filter(u => u.role === "Customer").length;
    const activeRentals = rentals.filter(r => ["Active", "Extended", "Delivered"].includes(r.status));
    
    // Revenue calculations
    // Estimated Monthly Revenue: sum of active/extended/delivered rentals' monthly rents
    const monthlyRevenue = activeRentals.reduce((sum, r) => sum + r.monthlyRent, 0);

    // Total products and utilization rate
    const totalItems = products.reduce((sum, p) => sum + p.stock, 0) + rentals.filter(r => r.status !== "Completed").length;
    const itemsInUse = rentals.filter(r => ["Active", "Extended", "Delivered", "Pickup Scheduled"].includes(r.status)).length;
    const utilizationRate = totalItems > 0 ? Math.round((itemsInUse / totalItems) * 100) : 0;

    // Maintenance Resolution Time
    // Mock metric for styling/visual UI
    const resolvedTickets = maintenance.filter(m => m.status === "Resolved" || m.status === "Closed");
    const avgResolutionTime = resolvedTickets.length > 0 ? "18 Hours" : "24 Hours";

    // Category distribution
    const categoryStats = {};
    products.forEach(p => {
      categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
    });

    // Monthly orders distribution
    const recentRentalsByMonth = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0
    };
    rentals.forEach(r => {
      const month = new Date(r.startDate).toLocaleString('default', { month: 'short' });
      if (month in recentRentalsByMonth) {
        recentRentalsByMonth[month] += 1;
      }
    });

    return {
      totalUsers,
      activeRentalsCount: activeRentals.length,
      monthlyRevenue,
      utilizationRate,
      avgResolutionTime,
      categoryStats,
      recentRentalsByMonth
    };
  }
};

window.RentEaseDB = db;
