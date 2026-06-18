const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(express.json());

// Default mock database state
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
    status: "Active",
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
    status: "Assigned",
    createdAt: "2026-06-15",
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150"]
  }
];

// Helper to load database
function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      products: DEFAULT_PRODUCTS,
      users: DEFAULT_USERS,
      rentals: DEFAULT_RENTALS,
      maintenance: DEFAULT_MAINTENANCE
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db.json, returning default", err);
    return {
      products: DEFAULT_PRODUCTS,
      users: DEFAULT_USERS,
      rentals: DEFAULT_RENTALS,
      maintenance: DEFAULT_MAINTENANCE
    };
  }
}

// Helper to save database
function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Error writing to db.json", err);
    return false;
  }
}

// Serve static files
app.use(express.static(__dirname));

// Endpoint to fetch current database state
app.get('/api/db', (req, res) => {
  const dbData = loadDatabase();
  res.json(dbData);
});

// Endpoint to synchronize client state to server database
app.post('/api/sync', (req, res) => {
  const { products, users, rentals, maintenance } = req.body;
  if (!products || !users || !rentals || !maintenance) {
    return res.status(400).json({ error: "Missing required database arrays" });
  }

  const success = saveDatabase({ products, users, rentals, maintenance });
  if (success) {
    res.json({ status: "ok", message: "Database synchronized successfully" });
  } else {
    res.status(500).json({ error: "Failed to write database file" });
  }
});

// Serve frontend default route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`RentEase Node.js server running on http://localhost:${PORT}`);
});
