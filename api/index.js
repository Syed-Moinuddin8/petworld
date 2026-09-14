// api/expressServer.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";

// api/server/db.ts
import fs from "fs";
import path from "path";

// api/server/data.ts
var INITIAL_SETTINGS = {
  businessName: "PET WORLD",
  tagline: "Premium Multi-Branch Pet Care & Retail Chain",
  headOfficeAddress: "Pet World Tower, Suite 402, Nariman Point, Mumbai, MH 400021",
  headOfficePhone: "+91 22 4589 8800",
  gstin: "27AABCP1924M1Z5",
  invoicePrefix: "PW-SAL-",
  thermalWidth: "80mm",
  defaultTaxRate: 18,
  currencySymbol: "\u20B9",
  currencyCode: "INR",
  lowStockDefaultThreshold: 10,
  receiptFooter: "Thank you for caring for your furry friends! Visit us at www.petworld.co.in | No exchange without bill",
  paymentMethods: ["CASH", "UPI", "CARD", "SPLIT"]
};
var INITIAL_BRANCHES = [
  {
    id: "branch-1",
    code: "B01",
    name: "Pet World Downtown Flagship",
    address: "14/B, Colaba Causeway, Near Regal Cinema",
    city: "Mumbai",
    phone: "+91 22 2202 1144",
    email: "colaba@petworld.co.in",
    managerName: "Rajesh Sharma",
    status: "ACTIVE",
    openingDate: "2021-03-15",
    taxRate: 18
  },
  {
    id: "branch-2",
    code: "B02",
    name: "Pet World Westside Mall",
    address: "Ground Floor, Galleria Arcade, Linking Road, Bandra West",
    city: "Mumbai",
    phone: "+91 22 2640 8822",
    email: "bandra@petworld.co.in",
    managerName: "Priya Mehra",
    status: "ACTIVE",
    openingDate: "2021-09-10",
    taxRate: 18
  },
  {
    id: "branch-3",
    code: "B03",
    name: "Pet World Suburban Plaza",
    address: "Unit 4, Western Heights, Chakala, Andheri East",
    city: "Mumbai",
    phone: "+91 22 2838 5599",
    email: "andheri@petworld.co.in",
    managerName: "Amit Verma",
    status: "ACTIVE",
    openingDate: "2022-04-01",
    taxRate: 18
  },
  {
    id: "branch-4",
    code: "B04",
    name: "Pet World Green Valley",
    address: "Hiranandani Gardens, Central Avenue, Powai",
    city: "Mumbai",
    phone: "+91 22 2570 3311",
    email: "powai@petworld.co.in",
    managerName: "Neha Deshmukh",
    status: "ACTIVE",
    openingDate: "2022-11-20",
    taxRate: 18
  },
  {
    id: "branch-5",
    code: "B05",
    name: "Pet World Coastal Bay",
    address: "7 Juhu Tara Road, Opposite Sea Princess Hotel, Juhu",
    city: "Mumbai",
    phone: "+91 22 2618 9944",
    email: "juhu@petworld.co.in",
    managerName: "Karan Malhotra",
    status: "ACTIVE",
    openingDate: "2023-06-12",
    taxRate: 18
  },
  {
    id: "branch-6",
    code: "B06",
    name: "Pet World Express Hub",
    address: "Shop 12-14, Viviana Boulevard, Eastern Express Highway, Thane West",
    city: "Thane",
    phone: "+91 22 2544 6677",
    email: "thane@petworld.co.in",
    managerName: "Sunita Patil",
    status: "ACTIVE",
    openingDate: "2024-01-18",
    taxRate: 18
  }
];
var INITIAL_SUPPLIERS = [
  {
    id: "sup-1",
    name: "Royal Canin India Pvt Ltd",
    contactPerson: "Sandeep Ghosh",
    phone: "+91 98201 44552",
    email: "orders@royalcanin.in",
    address: "B-601, Nesco IT Park, Goregaon East, Mumbai",
    gstin: "27AABCR4450E1Z1"
  },
  {
    id: "sup-2",
    name: "Mars Petcare India (Pedigree / Whiskas)",
    contactPerson: "Ananya Roy",
    phone: "+91 98334 11220",
    email: "wholesale@marspetcare.in",
    address: "DLF Cyber City, Tower 10, Gurugram / Mumbai Depot",
    gstin: "27AACCM2918K1ZX"
  },
  {
    id: "sup-3",
    name: "Drools Pet Food Pvt Ltd",
    contactPerson: "Manoj Tiwari",
    phone: "+91 99112 88440",
    email: "distributor@drools.in",
    address: "IB Group Complex, Rajnandgaon & Bhiwandi Logistics Hub",
    gstin: "27AABCD6710F1Z4"
  },
  {
    id: "sup-4",
    name: "Pet Passion Import & Distribution Hub",
    contactPerson: "Farhan Merchant",
    phone: "+91 98200 99441",
    email: "sales@petpassion.co.in",
    address: "Gala 10, Mittal Industrial Estate, Andheri Kurla Rd, Mumbai",
    gstin: "27AAECP1144Q1Z8"
  },
  {
    id: "sup-5",
    name: "Aquaria World & Exotic Marine",
    contactPerson: "Victor Fernandes",
    phone: "+91 97690 33221",
    email: "contact@aquariaworld.in",
    address: "Shop 4, Crawford Market Marine Annexe, Mumbai",
    gstin: "27AAGFA9812M1Z2"
  },
  {
    id: "sup-6",
    name: "VetCare India Pharmaceuticals",
    contactPerson: "Dr. Ramesh Nair",
    phone: "+91 98450 77112",
    email: "supply@vetcarepharma.in",
    address: "22 Peenya Industrial Area, Bengaluru / Mumbai CFA",
    gstin: "27AABCV1290P1Z6"
  }
];
var INITIAL_PRODUCTS = [
  // DOG FOOD (12 items)
  {
    id: "prod-001",
    sku: "DF-RC-001",
    barcode: "89010010001",
    name: "Royal Canin Maxi Adult Dog Food 15kg",
    category: "Dog Food",
    brand: "Royal Canin",
    unit: "packet",
    purchasePrice: 6200,
    sellingPrice: 7990,
    mrp: 8400,
    taxPercent: 18,
    minStockLevel: 5,
    reorderLevel: 10,
    supplierId: "sup-1",
    supplierName: "Royal Canin India Pvt Ltd",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-002",
    sku: "DF-RC-002",
    barcode: "89010010002",
    name: "Royal Canin Mini Adult Dog Food 4kg",
    category: "Dog Food",
    brand: "Royal Canin",
    unit: "packet",
    purchasePrice: 2250,
    sellingPrice: 2890,
    mrp: 3100,
    taxPercent: 18,
    minStockLevel: 8,
    reorderLevel: 15,
    supplierId: "sup-1",
    supplierName: "Royal Canin India Pvt Ltd",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-003",
    sku: "DF-PED-003",
    barcode: "89010010003",
    name: "Pedigree Adult Chicken & Vegetables 10kg",
    category: "Dog Food",
    brand: "Pedigree",
    unit: "packet",
    purchasePrice: 1650,
    sellingPrice: 2150,
    mrp: 2300,
    taxPercent: 18,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-2",
    supplierName: "Mars Petcare India",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-004",
    sku: "DF-PED-004",
    barcode: "89010010004",
    name: "Pedigree Pro Starter Mother & Pup 3kg",
    category: "Dog Food",
    brand: "Pedigree",
    unit: "packet",
    purchasePrice: 1100,
    sellingPrice: 1450,
    mrp: 1550,
    taxPercent: 18,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-2",
    supplierName: "Mars Petcare India",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-005",
    sku: "DF-FAR-005",
    barcode: "89010010005",
    name: "Farmina N&D Pumpkin Lamb & Blueberry 12kg",
    category: "Dog Food",
    brand: "Farmina",
    unit: "packet",
    purchasePrice: 6900,
    sellingPrice: 8850,
    mrp: 9400,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-006",
    sku: "DF-HIL-006",
    barcode: "89010010006",
    name: "Hill's Science Diet Canine Adult 12kg",
    category: "Dog Food",
    brand: "Hill's",
    unit: "packet",
    purchasePrice: 5800,
    sellingPrice: 7400,
    mrp: 7900,
    taxPercent: 18,
    minStockLevel: 5,
    reorderLevel: 10,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-007",
    sku: "DF-DRO-007",
    barcode: "89010010007",
    name: "Drools Focus Puppy Super Premium 15kg",
    category: "Dog Food",
    brand: "Drools",
    unit: "packet",
    purchasePrice: 3800,
    sellingPrice: 4950,
    mrp: 5300,
    taxPercent: 18,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-3",
    supplierName: "Drools Pet Food Pvt Ltd",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-008",
    sku: "DF-ORI-008",
    barcode: "89010010008",
    name: "Orijen Original Grain-Free Dog 11.4kg",
    category: "Dog Food",
    brand: "Orijen",
    unit: "packet",
    purchasePrice: 8900,
    sellingPrice: 11400,
    mrp: 12e3,
    taxPercent: 18,
    minStockLevel: 3,
    reorderLevel: 6,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-009",
    sku: "DF-ACA-009",
    barcode: "89010010009",
    name: "Acana Grasslands Heritage Dog 6kg",
    category: "Dog Food",
    brand: "Acana",
    unit: "packet",
    purchasePrice: 4600,
    sellingPrice: 5900,
    mrp: 6300,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-010",
    sku: "DF-PUR-010",
    barcode: "89010010010",
    name: "Purina Pro Plan Adult Medium Chicken 14kg",
    category: "Dog Food",
    brand: "Purina",
    unit: "packet",
    purchasePrice: 5500,
    sellingPrice: 6990,
    mrp: 7500,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-011",
    sku: "DF-TOW-011",
    barcode: "89010010011",
    name: "Taste of the Wild High Prairie Canine 12.2kg",
    category: "Dog Food",
    brand: "Taste of the Wild",
    unit: "packet",
    purchasePrice: 6800,
    sellingPrice: 8700,
    mrp: 9200,
    taxPercent: 18,
    minStockLevel: 3,
    reorderLevel: 6,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-012",
    sku: "DF-ARD-012",
    barcode: "89010010012",
    name: "Arden Grange Adult Fresh Chicken 12kg",
    category: "Dog Food",
    brand: "Arden Grange",
    unit: "packet",
    purchasePrice: 4900,
    sellingPrice: 6300,
    mrp: 6700,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  // CAT FOOD (10 items)
  {
    id: "prod-013",
    sku: "CF-RC-013",
    barcode: "89010010013",
    name: "Royal Canin Kitten Second Age 4kg",
    category: "Cat Food",
    brand: "Royal Canin",
    unit: "packet",
    purchasePrice: 2600,
    sellingPrice: 3350,
    mrp: 3600,
    taxPercent: 18,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-1",
    supplierName: "Royal Canin India Pvt Ltd",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-014",
    sku: "CF-RC-014",
    barcode: "89010010014",
    name: "Royal Canin Persian Adult Cat 4kg",
    category: "Cat Food",
    brand: "Royal Canin",
    unit: "packet",
    purchasePrice: 2800,
    sellingPrice: 3650,
    mrp: 3900,
    taxPercent: 18,
    minStockLevel: 8,
    reorderLevel: 15,
    supplierId: "sup-1",
    supplierName: "Royal Canin India Pvt Ltd",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-015",
    sku: "CF-WHI-015",
    barcode: "89010010015",
    name: "Whiskas Ocean Fish Adult Cat Food 7kg",
    category: "Cat Food",
    brand: "Whiskas",
    unit: "packet",
    purchasePrice: 1550,
    sellingPrice: 1999,
    mrp: 2200,
    taxPercent: 18,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-2",
    supplierName: "Mars Petcare India",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-016",
    sku: "CF-WHI-016",
    barcode: "89010010016",
    name: "Whiskas Tuna in Jelly Wet Cat Food 85g (Pack of 12)",
    category: "Cat Food",
    brand: "Whiskas",
    unit: "box",
    purchasePrice: 420,
    sellingPrice: 540,
    mrp: 600,
    taxPercent: 18,
    minStockLevel: 15,
    reorderLevel: 30,
    supplierId: "sup-2",
    supplierName: "Mars Petcare India",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-017",
    sku: "CF-FAR-017",
    barcode: "89010010017",
    name: "Farmina N&D Ocean Cod Fish & Orange Cat 5kg",
    category: "Cat Food",
    brand: "Farmina",
    unit: "packet",
    purchasePrice: 3900,
    sellingPrice: 4990,
    mrp: 5350,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-018",
    sku: "CF-SHE-018",
    barcode: "89010010018",
    name: "Sheba Premium Succulent Chicken Breast Loaf 70g (12 Cans)",
    category: "Cat Food",
    brand: "Sheba",
    unit: "box",
    purchasePrice: 650,
    sellingPrice: 840,
    mrp: 900,
    taxPercent: 18,
    minStockLevel: 10,
    reorderLevel: 25,
    supplierId: "sup-2",
    supplierName: "Mars Petcare India",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-019",
    sku: "CF-MEO-019",
    barcode: "89010010019",
    name: "Me-O Persian Anti Hairball Cat Food 7kg",
    category: "Cat Food",
    brand: "Me-O",
    unit: "packet",
    purchasePrice: 1750,
    sellingPrice: 2250,
    mrp: 2450,
    taxPercent: 18,
    minStockLevel: 8,
    reorderLevel: 16,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-020",
    sku: "CF-HIL-020",
    barcode: "89010010020",
    name: "Hill's Science Diet Indoor Adult Cat 3.1kg",
    category: "Cat Food",
    brand: "Hill's",
    unit: "packet",
    purchasePrice: 2300,
    sellingPrice: 2990,
    mrp: 3200,
    taxPercent: 18,
    minStockLevel: 5,
    reorderLevel: 10,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-021",
    sku: "CF-PUR-021",
    barcode: "89010010021",
    name: "Purepet Ocean Fish Adult Cat Food 7kg",
    category: "Cat Food",
    brand: "Purepet",
    unit: "packet",
    purchasePrice: 950,
    sellingPrice: 1250,
    mrp: 1400,
    taxPercent: 18,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-3",
    supplierName: "Drools Pet Food Pvt Ltd",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-022",
    sku: "CF-FEL-022",
    barcode: "89010010022",
    name: "Felix As Good As It Looks Kitten Jelly 85g x 12",
    category: "Cat Food",
    brand: "Felix",
    unit: "box",
    purchasePrice: 480,
    sellingPrice: 620,
    mrp: 660,
    taxPercent: 18,
    minStockLevel: 12,
    reorderLevel: 24,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  // BIRD FOOD (8 items)
  {
    id: "prod-023",
    sku: "BF-VER-023",
    barcode: "89010010023",
    name: "Versele-Laga Prestige Budgies Seed Mix 1kg",
    category: "Bird Food",
    brand: "Versele-Laga",
    unit: "packet",
    purchasePrice: 380,
    sellingPrice: 520,
    mrp: 580,
    taxPercent: 12,
    minStockLevel: 8,
    reorderLevel: 15,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "bird",
    status: "ACTIVE"
  },
  {
    id: "prod-024",
    sku: "BF-ZUP-024",
    barcode: "89010010024",
    name: "ZuPreem FruitBlend Pellets Cockatiel 900g",
    category: "Bird Food",
    brand: "ZuPreem",
    unit: "packet",
    purchasePrice: 850,
    sellingPrice: 1190,
    mrp: 1300,
    taxPercent: 12,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "bird",
    status: "ACTIVE"
  },
  {
    id: "prod-025",
    sku: "BF-VIT-025",
    barcode: "89010010025",
    name: "Vitapol Economic Food for Cockatiel 1.2kg",
    category: "Bird Food",
    brand: "Vitapol",
    unit: "packet",
    purchasePrice: 320,
    sellingPrice: 450,
    mrp: 500,
    taxPercent: 12,
    minStockLevel: 8,
    reorderLevel: 16,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "bird",
    status: "ACTIVE"
  },
  {
    id: "prod-026",
    sku: "BF-BOL-026",
    barcode: "89010010026",
    name: "Boltz Bird Food for Budgies Clean Seeds 1.2kg",
    category: "Bird Food",
    brand: "Boltz",
    unit: "packet",
    purchasePrice: 210,
    sellingPrice: 299,
    mrp: 350,
    taxPercent: 12,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "bird",
    status: "ACTIVE"
  },
  {
    id: "prod-027",
    sku: "BF-HAR-027",
    barcode: "89010010027",
    name: "Harrison's Adult Lifetime Fine Organic Bird 454g",
    category: "Bird Food",
    brand: "Harrison's",
    unit: "packet",
    purchasePrice: 1200,
    sellingPrice: 1650,
    mrp: 1800,
    taxPercent: 12,
    minStockLevel: 3,
    reorderLevel: 6,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "bird",
    status: "ACTIVE"
  },
  {
    id: "prod-028",
    sku: "BF-KAY-028",
    barcode: "89010010028",
    name: "Kaytee Forti-Diet Pro Health Canary Food 1.36kg",
    category: "Bird Food",
    brand: "Kaytee",
    unit: "packet",
    purchasePrice: 620,
    sellingPrice: 850,
    mrp: 950,
    taxPercent: 12,
    minStockLevel: 5,
    reorderLevel: 10,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "bird",
    status: "ACTIVE"
  },
  {
    id: "prod-029",
    sku: "BF-RIO-029",
    barcode: "89010010029",
    name: "Rio Daily Feed for Exotic Finches 1kg",
    category: "Bird Food",
    brand: "Rio",
    unit: "packet",
    purchasePrice: 340,
    sellingPrice: 480,
    mrp: 520,
    taxPercent: 12,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "bird",
    status: "ACTIVE"
  },
  {
    id: "prod-030",
    sku: "BF-VIT-030",
    barcode: "89010010030",
    name: "Vitapol Smakers Treat Sticks for Lovebirds (Pack of 2)",
    category: "Bird Food",
    brand: "Vitapol",
    unit: "packet",
    purchasePrice: 140,
    sellingPrice: 220,
    mrp: 260,
    taxPercent: 12,
    minStockLevel: 12,
    reorderLevel: 25,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "bird",
    status: "ACTIVE"
  },
  // FISH FOOD (8 items)
  {
    id: "prod-031",
    sku: "FF-HIK-031",
    barcode: "89010010031",
    name: "Hikari Micro Wafers Tropical Fish Food 45g",
    category: "Fish Food",
    brand: "Hikari",
    unit: "packet",
    purchasePrice: 360,
    sellingPrice: 490,
    mrp: 550,
    taxPercent: 12,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-032",
    sku: "FF-TET-032",
    barcode: "89010010032",
    name: "Tetra Bits Complete Discus & Tropical 300g (1000ml)",
    category: "Fish Food",
    brand: "Tetra",
    unit: "can",
    purchasePrice: 650,
    sellingPrice: 899,
    mrp: 990,
    taxPercent: 12,
    minStockLevel: 8,
    reorderLevel: 16,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-033",
    sku: "FF-TAI-033",
    barcode: "89010010033",
    name: "Taiyo Grow Fish Food Pellets 500g",
    category: "Fish Food",
    brand: "Taiyo",
    unit: "packet",
    purchasePrice: 110,
    sellingPrice: 165,
    mrp: 190,
    taxPercent: 12,
    minStockLevel: 15,
    reorderLevel: 30,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-034",
    sku: "FF-OPT-034",
    barcode: "89010010034",
    name: "Optimum Betta Mini Pellets with Spirulina 20g",
    category: "Fish Food",
    brand: "Optimum",
    unit: "packet",
    purchasePrice: 75,
    sellingPrice: 120,
    mrp: 140,
    taxPercent: 12,
    minStockLevel: 20,
    reorderLevel: 40,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-035",
    sku: "FF-SER-035",
    barcode: "89010010035",
    name: "Sera Vipan Staple Flake Food 1000ml",
    category: "Fish Food",
    brand: "Sera",
    unit: "can",
    purchasePrice: 780,
    sellingPrice: 1050,
    mrp: 1180,
    taxPercent: 12,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-036",
    sku: "FF-OCE-036",
    barcode: "89010010036",
    name: "Ocean Free AR-G2 Pro Arowana Carnivorous Pellet 500g",
    category: "Fish Food",
    brand: "Ocean Free",
    unit: "can",
    purchasePrice: 1400,
    sellingPrice: 1890,
    mrp: 2100,
    taxPercent: 12,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-037",
    sku: "FF-HIK-037",
    barcode: "89010010037",
    name: "Hikari Algae Wafers Plecostomus & Bottom Feeders 82g",
    category: "Fish Food",
    brand: "Hikari",
    unit: "packet",
    purchasePrice: 420,
    sellingPrice: 580,
    mrp: 650,
    taxPercent: 12,
    minStockLevel: 8,
    reorderLevel: 16,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-038",
    sku: "FF-DYM-038",
    barcode: "89010010038",
    name: "Dymax Spirulina Discus Floating Bites 120g",
    category: "Fish Food",
    brand: "Dymax",
    unit: "can",
    purchasePrice: 320,
    sellingPrice: 450,
    mrp: 500,
    taxPercent: 12,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  // PET TREATS (8 items)
  {
    id: "prod-039",
    sku: "TR-JER-039",
    barcode: "89010010039",
    name: "JerHigh Milky Dog Sticks Real Chicken 70g",
    category: "Pet Treats",
    brand: "JerHigh",
    unit: "packet",
    purchasePrice: 115,
    sellingPrice: 165,
    mrp: 185,
    taxPercent: 18,
    minStockLevel: 20,
    reorderLevel: 40,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-040",
    sku: "TR-GNA-040",
    barcode: "89010010040",
    name: "Gnawlers Calcium Milk Dental Bone Small (30 pcs)",
    category: "Pet Treats",
    brand: "Gnawlers",
    unit: "box",
    purchasePrice: 350,
    sellingPrice: 499,
    mrp: 550,
    taxPercent: 18,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-041",
    sku: "TR-TEM-041",
    barcode: "89010010041",
    name: "Temptations Tasty Chicken Crunchy Cat Treats 85g",
    category: "Pet Treats",
    brand: "Temptations",
    unit: "packet",
    purchasePrice: 130,
    sellingPrice: 180,
    mrp: 200,
    taxPercent: 18,
    minStockLevel: 15,
    reorderLevel: 30,
    supplierId: "sup-2",
    supplierName: "Mars Petcare India",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-042",
    sku: "TR-DRO-042",
    barcode: "89010010042",
    name: "Drools Absolute Calcium Sausage Treats 400g",
    category: "Pet Treats",
    brand: "Drools",
    unit: "box",
    purchasePrice: 220,
    sellingPrice: 310,
    mrp: 350,
    taxPercent: 18,
    minStockLevel: 12,
    reorderLevel: 25,
    supplierId: "sup-3",
    supplierName: "Drools Pet Food Pvt Ltd",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-043",
    sku: "TR-DOG-043",
    barcode: "89010010043",
    name: "Dogaholic Milky Chew Rawhide Braided Sticks 5-inch",
    category: "Pet Treats",
    brand: "Dogaholic",
    unit: "packet",
    purchasePrice: 180,
    sellingPrice: 260,
    mrp: 290,
    taxPercent: 18,
    minStockLevel: 15,
    reorderLevel: 30,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-044",
    sku: "TR-PED-044",
    barcode: "89010010044",
    name: "Pedigree Dentastix Medium Dog Oral Care 7 Sticks",
    category: "Pet Treats",
    brand: "Pedigree",
    unit: "packet",
    purchasePrice: 195,
    sellingPrice: 260,
    mrp: 285,
    taxPercent: 18,
    minStockLevel: 15,
    reorderLevel: 35,
    supplierId: "sup-2",
    supplierName: "Mars Petcare India",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-045",
    sku: "TR-CHI-045",
    barcode: "89010010045",
    name: "Chip Chops Roast Duck Strips Soft Treats 70g",
    category: "Pet Treats",
    brand: "Chip Chops",
    unit: "packet",
    purchasePrice: 140,
    sellingPrice: 210,
    mrp: 240,
    taxPercent: 18,
    minStockLevel: 12,
    reorderLevel: 25,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-046",
    sku: "TR-SHE-046",
    barcode: "89010010046",
    name: "Sheba Melty Creamy Cat Treat Chicken Sachets (4x12g)",
    category: "Pet Treats",
    brand: "Sheba",
    unit: "packet",
    purchasePrice: 110,
    sellingPrice: 150,
    mrp: 170,
    taxPercent: 18,
    minStockLevel: 20,
    reorderLevel: 40,
    supplierId: "sup-2",
    supplierName: "Mars Petcare India",
    avatarType: "cat",
    status: "ACTIVE"
  },
  // TOYS (8 items)
  {
    id: "prod-047",
    sku: "TY-KON-047",
    barcode: "89010010047",
    name: "KONG Classic Durable Natural Rubber Dog Toy (Large)",
    category: "Toys",
    brand: "KONG",
    unit: "piece",
    purchasePrice: 780,
    sellingPrice: 1150,
    mrp: 1299,
    taxPercent: 18,
    minStockLevel: 5,
    reorderLevel: 10,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-048",
    sku: "TY-GIG-048",
    barcode: "89010010048",
    name: "GiGwi Plush Squeaker Duck with Removable Sound Unit",
    category: "Toys",
    brand: "GiGwi",
    unit: "piece",
    purchasePrice: 420,
    sellingPrice: 650,
    mrp: 750,
    taxPercent: 18,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-049",
    sku: "TY-CAT-049",
    barcode: "89010010049",
    name: "PetVogue Automatic Interactive LED Laser Cat Toy",
    category: "Toys",
    brand: "PetVogue",
    unit: "piece",
    purchasePrice: 490,
    sellingPrice: 799,
    mrp: 899,
    taxPercent: 18,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-050",
    sku: "TY-TRI-050",
    barcode: "89010010050",
    name: "Trixie Denta Fun Cotton Knot Rope Ball 26cm",
    category: "Toys",
    brand: "Trixie",
    unit: "piece",
    purchasePrice: 180,
    sellingPrice: 280,
    mrp: 320,
    taxPercent: 18,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-051",
    sku: "TY-NIN-051",
    barcode: "89010010051",
    name: "Nina Ottosson Dog Smart Interactive Brain Puzzle Game",
    category: "Toys",
    brand: "Outward Hound",
    unit: "piece",
    purchasePrice: 1100,
    sellingPrice: 1599,
    mrp: 1799,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-052",
    sku: "TY-CAT-052",
    barcode: "89010010052",
    name: "Catch Me Feather Teaser Wand with Bell for Cats",
    category: "Toys",
    brand: "CatPro",
    unit: "piece",
    purchasePrice: 90,
    sellingPrice: 180,
    mrp: 220,
    taxPercent: 18,
    minStockLevel: 15,
    reorderLevel: 30,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-053",
    sku: "TY-JWP-053",
    barcode: "89010010053",
    name: "JW Pet Hol-ee Roller Natural Rubber Treat Ball Medium",
    category: "Toys",
    brand: "JW Pet",
    unit: "piece",
    purchasePrice: 380,
    sellingPrice: 560,
    mrp: 650,
    taxPercent: 18,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-054",
    sku: "TY-BIR-054",
    barcode: "89010010054",
    name: "Birdie Paradise Wooden Mirror & Bell Perch Toy",
    category: "Toys",
    brand: "BirdPro",
    unit: "piece",
    purchasePrice: 120,
    sellingPrice: 220,
    mrp: 260,
    taxPercent: 18,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "bird",
    status: "ACTIVE"
  },
  // LEASHES & COLLARS (8 items)
  {
    id: "prod-055",
    sku: "LC-ROG-055",
    barcode: "89010010055",
    name: "Rogz Alpinist Utility Reflective Dog Harness (Large)",
    category: "Leashes & Collars",
    brand: "Rogz",
    unit: "piece",
    purchasePrice: 950,
    sellingPrice: 1450,
    mrp: 1650,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-056",
    sku: "LC-FLX-056",
    barcode: "89010010056",
    name: "Flexi New Classic Retractable Tape Leash 5M (Up to 25kg)",
    category: "Leashes & Collars",
    brand: "Flexi",
    unit: "piece",
    purchasePrice: 1250,
    sellingPrice: 1799,
    mrp: 1999,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-057",
    sku: "LC-PAW-057",
    barcode: "89010010057",
    name: "Pawzone Neoprene Padded Anti-Choke Collar Red (Medium)",
    category: "Leashes & Collars",
    brand: "Pawzone",
    unit: "piece",
    purchasePrice: 280,
    sellingPrice: 450,
    mrp: 520,
    taxPercent: 18,
    minStockLevel: 8,
    reorderLevel: 16,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-058",
    sku: "LC-CAT-058",
    barcode: "89010010058",
    name: "Breakaway Safety Bell Cat Collar with Reflective Stripe",
    category: "Leashes & Collars",
    brand: "PetSafe",
    unit: "piece",
    purchasePrice: 95,
    sellingPrice: 180,
    mrp: 220,
    taxPercent: 18,
    minStockLevel: 15,
    reorderLevel: 30,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-059",
    sku: "LC-TRI-059",
    barcode: "89010010059",
    name: "Trixie Premium Padded Dog Harness Black XL",
    category: "Leashes & Collars",
    brand: "Trixie",
    unit: "piece",
    purchasePrice: 850,
    sellingPrice: 1290,
    mrp: 1450,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-060",
    sku: "LC-RED-060",
    barcode: "89010010060",
    name: "Red Dingo Stainless Steel Personalized Dog ID Tag Bone",
    category: "Leashes & Collars",
    brand: "Red Dingo",
    unit: "piece",
    purchasePrice: 250,
    sellingPrice: 420,
    mrp: 490,
    taxPercent: 18,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-061",
    sku: "LC-MIL-061",
    barcode: "89010010061",
    name: "Tactical Military Bungee Training Leash with Traffic Handle",
    category: "Leashes & Collars",
    brand: "K9 Elite",
    unit: "piece",
    purchasePrice: 620,
    sellingPrice: 980,
    mrp: 1150,
    taxPercent: 18,
    minStockLevel: 5,
    reorderLevel: 10,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-062",
    sku: "LC-LED-062",
    barcode: "89010010062",
    name: "USB Rechargeable Glow LED Night Dog Safety Collar Green",
    category: "Leashes & Collars",
    brand: "NiteHowl",
    unit: "piece",
    purchasePrice: 320,
    sellingPrice: 550,
    mrp: 650,
    taxPercent: 18,
    minStockLevel: 8,
    reorderLevel: 15,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  // BEDS & MATS (7 items)
  {
    id: "prod-063",
    sku: "BM-BED-063",
    barcode: "89010010063",
    name: "Bedsure Orthopedic Memory Foam Dog Sofa Bed Large (Grey)",
    category: "Beds & Mats",
    brand: "Bedsure",
    unit: "piece",
    purchasePrice: 2400,
    sellingPrice: 3590,
    mrp: 3990,
    taxPercent: 18,
    minStockLevel: 3,
    reorderLevel: 6,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-064",
    sku: "BM-CUR-064",
    barcode: "89010010064",
    name: "Curver Knit Cozy Round Pet Bed & Cave Mint Green",
    category: "Beds & Mats",
    brand: "Curver",
    unit: "piece",
    purchasePrice: 2800,
    sellingPrice: 4200,
    mrp: 4600,
    taxPercent: 18,
    minStockLevel: 2,
    reorderLevel: 5,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-065",
    sku: "BM-TRI-065",
    barcode: "89010010065",
    name: "Trixie Fluffy Anti-Anxiety Plush Donut Bed (Medium 65cm)",
    category: "Beds & Mats",
    brand: "Trixie",
    unit: "piece",
    purchasePrice: 1400,
    sellingPrice: 2190,
    mrp: 2490,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-066",
    sku: "BM-FUR-066",
    barcode: "89010010066",
    name: "Furhaven Self-Cooling Gel Mat for Dogs & Cats 90x50cm",
    category: "Beds & Mats",
    brand: "Furhaven",
    unit: "piece",
    purchasePrice: 850,
    sellingPrice: 1350,
    mrp: 1550,
    taxPercent: 18,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-067",
    sku: "BM-HAM-067",
    barcode: "89010010067",
    name: "Sunny Seat Cat Window Mounted Hammock Perch (Holds 15kg)",
    category: "Beds & Mats",
    brand: "SunnySeat",
    unit: "piece",
    purchasePrice: 650,
    sellingPrice: 1090,
    mrp: 1250,
    taxPercent: 18,
    minStockLevel: 5,
    reorderLevel: 10,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-068",
    sku: "BM-CRA-068",
    barcode: "89010010068",
    name: "MidWest QuietTime Deluxe Fleece Pet Crate Mat 36-inch",
    category: "Beds & Mats",
    brand: "MidWest",
    unit: "piece",
    purchasePrice: 750,
    sellingPrice: 1190,
    mrp: 1350,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-069",
    sku: "BM-CAR-069",
    barcode: "89010010069",
    name: "Waterproof Dog Car Seat Cover with Mesh Window Hammock",
    category: "Beds & Mats",
    brand: "Vailge",
    unit: "piece",
    purchasePrice: 1100,
    sellingPrice: 1690,
    mrp: 1890,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  // GROOMING (8 items)
  {
    id: "prod-070",
    sku: "GR-WAH-070",
    barcode: "89010010070",
    name: "Wahl Oatmeal & Coconut Pet Conditioning Shampoo 750ml",
    category: "Grooming",
    brand: "Wahl",
    unit: "bottle",
    purchasePrice: 480,
    sellingPrice: 699,
    mrp: 790,
    taxPercent: 18,
    minStockLevel: 8,
    reorderLevel: 16,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-071",
    sku: "GR-HIM-071",
    barcode: "89010010071",
    name: "Himalaya Erina Plus Anti-Dandruff Coat Cleanser 200ml",
    category: "Grooming",
    brand: "Himalaya",
    unit: "bottle",
    purchasePrice: 150,
    sellingPrice: 220,
    mrp: 250,
    taxPercent: 18,
    minStockLevel: 15,
    reorderLevel: 30,
    supplierId: "sup-6",
    supplierName: "VetCare India Pharmaceuticals",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-072",
    sku: "GR-FUR-072",
    barcode: "89010010072",
    name: "FURminator Undercoat deShedding Tool Medium Long Hair",
    category: "Grooming",
    brand: "FURminator",
    unit: "piece",
    purchasePrice: 1450,
    sellingPrice: 2199,
    mrp: 2450,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-073",
    sku: "GR-TRO-073",
    barcode: "89010010073",
    name: "TropiClean Papaya & Coconut 2-in-1 Pet Shampoo & Conditioner 355ml",
    category: "Grooming",
    brand: "TropiClean",
    unit: "bottle",
    purchasePrice: 590,
    sellingPrice: 850,
    mrp: 950,
    taxPercent: 18,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-074",
    sku: "GR-BIO-074",
    barcode: "89010010074",
    name: "Bioline Herbal Ear Care Drops for Dogs & Cats 50ml",
    category: "Grooming",
    brand: "Bioline",
    unit: "bottle",
    purchasePrice: 180,
    sellingPrice: 275,
    mrp: 310,
    taxPercent: 18,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-6",
    supplierName: "VetCare India Pharmaceuticals",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-075",
    sku: "GR-PET-075",
    barcode: "89010010075",
    name: "Petkin Bamboo Eco Pet Wipes with Aloe (Pack of 80)",
    category: "Grooming",
    brand: "Petkin",
    unit: "packet",
    purchasePrice: 220,
    sellingPrice: 350,
    mrp: 395,
    taxPercent: 18,
    minStockLevel: 12,
    reorderLevel: 25,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-076",
    sku: "GR-NAI-076",
    barcode: "89010010076",
    name: "Professional Stainless Steel Pet Nail Clipper with Quick Sensor Guard",
    category: "Grooming",
    brand: "PawGroom",
    unit: "piece",
    purchasePrice: 180,
    sellingPrice: 299,
    mrp: 350,
    taxPercent: 18,
    minStockLevel: 8,
    reorderLevel: 16,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-077",
    sku: "GR-SLI-077",
    barcode: "89010010077",
    name: "Self-Cleaning Slicker Brush for Shedding Pets",
    category: "Grooming",
    brand: "PetClean",
    unit: "piece",
    purchasePrice: 240,
    sellingPrice: 399,
    mrp: 450,
    taxPercent: 18,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  // MEDICINES & CARE (9 items)
  {
    id: "prod-078",
    sku: "MD-BRA-078",
    barcode: "89010010078",
    name: "Bravecto Chewable Tablet for Dogs 20-40kg (3 Months Protection)",
    category: "Medicines & Care",
    brand: "MSD Animal Health",
    unit: "piece",
    purchasePrice: 1850,
    sellingPrice: 2490,
    mrp: 2700,
    taxPercent: 12,
    minStockLevel: 5,
    reorderLevel: 10,
    supplierId: "sup-6",
    supplierName: "VetCare India Pharmaceuticals",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-079",
    sku: "MD-NEX-079",
    barcode: "89010010079",
    name: "NexGard Spectra Flea Tick & Dewormer Chewable 15-30kg",
    category: "Medicines & Care",
    brand: "Boehringer Ingelheim",
    unit: "piece",
    purchasePrice: 1100,
    sellingPrice: 1499,
    mrp: 1650,
    taxPercent: 12,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-6",
    supplierName: "VetCare India Pharmaceuticals",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-080",
    sku: "MD-FIP-080",
    barcode: "89010010080",
    name: "Fiprofort Plus Spot On Pipette for Cats 0.5ml",
    category: "Medicines & Care",
    brand: "Sava Vet",
    unit: "piece",
    purchasePrice: 190,
    sellingPrice: 290,
    mrp: 320,
    taxPercent: 12,
    minStockLevel: 12,
    reorderLevel: 24,
    supplierId: "sup-6",
    supplierName: "VetCare India Pharmaceuticals",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-081",
    sku: "MD-VIR-081",
    barcode: "89010010081",
    name: "Virbac Nutri-Plus Gel High Energy Nutritional Supplement 120.5g",
    category: "Medicines & Care",
    brand: "Virbac",
    unit: "piece",
    purchasePrice: 420,
    sellingPrice: 590,
    mrp: 650,
    taxPercent: 12,
    minStockLevel: 8,
    reorderLevel: 16,
    supplierId: "sup-6",
    supplierName: "VetCare India Pharmaceuticals",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-082",
    sku: "MD-HIM-082",
    barcode: "89010010082",
    name: "Himalaya Digyton Digestive Drops for Dogs & Cats 30ml",
    category: "Medicines & Care",
    brand: "Himalaya",
    unit: "bottle",
    purchasePrice: 95,
    sellingPrice: 145,
    mrp: 165,
    taxPercent: 12,
    minStockLevel: 15,
    reorderLevel: 30,
    supplierId: "sup-6",
    supplierName: "VetCare India Pharmaceuticals",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-083",
    sku: "MD-PET-083",
    barcode: "89010010083",
    name: "Petstar Multivitamin & Amino Acids Syrup 200ml",
    category: "Medicines & Care",
    brand: "Mankind Vet",
    unit: "bottle",
    purchasePrice: 180,
    sellingPrice: 270,
    mrp: 300,
    taxPercent: 12,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-6",
    supplierName: "VetCare India Pharmaceuticals",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-084",
    sku: "MD-CAN-084",
    barcode: "89010010084",
    name: "Canina Calcium Carbonate Bone Strength Powder 400g",
    category: "Medicines & Care",
    brand: "Canina",
    unit: "box",
    purchasePrice: 520,
    sellingPrice: 750,
    mrp: 850,
    taxPercent: 12,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-6",
    supplierName: "VetCare India Pharmaceuticals",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-085",
    sku: "MD-SYR-085",
    barcode: "89010010085",
    name: "Vivaldis Renalof Pet Kidney Stone Care Syrup 100ml",
    category: "Medicines & Care",
    brand: "Vivaldis",
    unit: "bottle",
    purchasePrice: 780,
    sellingPrice: 1090,
    mrp: 1200,
    taxPercent: 12,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-6",
    supplierName: "VetCare India Pharmaceuticals",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-086",
    sku: "MD-EYE-086",
    barcode: "89010010086",
    name: "Cipla Ciplox Eye/Ear Drops 10ml for Pets",
    category: "Medicines & Care",
    brand: "Cipla Vet",
    unit: "bottle",
    purchasePrice: 35,
    sellingPrice: 65,
    mrp: 75,
    taxPercent: 12,
    minStockLevel: 20,
    reorderLevel: 40,
    supplierId: "sup-6",
    supplierName: "VetCare India Pharmaceuticals",
    avatarType: "dog",
    status: "ACTIVE"
  },
  // ACCESSORIES (8 items)
  {
    id: "prod-087",
    sku: "AC-BOW-087",
    barcode: "89010010087",
    name: "Anti-Skid Heavy Stainless Steel Pet Bowl 900ml",
    category: "Accessories",
    brand: "PetPro",
    unit: "piece",
    purchasePrice: 190,
    sellingPrice: 320,
    mrp: 380,
    taxPercent: 18,
    minStockLevel: 12,
    reorderLevel: 24,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-088",
    sku: "AC-LIT-088",
    barcode: "89010010088",
    name: "Hooded Enclosed Cat Litter Box with Carbon Filter & Scoop",
    category: "Accessories",
    brand: "Moderna",
    unit: "piece",
    purchasePrice: 1250,
    sellingPrice: 1890,
    mrp: 2190,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-089",
    sku: "AC-SAN-089",
    barcode: "89010010089",
    name: "Bentonite Clumping Cat Litter Lavender Scent 10kg",
    category: "Accessories",
    brand: "Intersand",
    unit: "packet",
    purchasePrice: 420,
    sellingPrice: 650,
    mrp: 750,
    taxPercent: 18,
    minStockLevel: 15,
    reorderLevel: 30,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-090",
    sku: "AC-SLO-090",
    barcode: "89010010090",
    name: "Trixie Slow Feed Anti-Gulping Interactive Dog Bowl",
    category: "Accessories",
    brand: "Trixie",
    unit: "piece",
    purchasePrice: 310,
    sellingPrice: 490,
    mrp: 550,
    taxPercent: 18,
    minStockLevel: 8,
    reorderLevel: 16,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-091",
    sku: "AC-CAR-091",
    barcode: "89010010091",
    name: "Skudo IATA Approved Pet Travel Carrier Box Size 3 (Up to 12kg)",
    category: "Accessories",
    brand: "Skudo",
    unit: "piece",
    purchasePrice: 2200,
    sellingPrice: 3400,
    mrp: 3800,
    taxPercent: 18,
    minStockLevel: 3,
    reorderLevel: 6,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-092",
    sku: "AC-FOU-092",
    barcode: "89010010092",
    name: "Catit Flower Pet Drinking Fountain with Triple Action Filter 3L",
    category: "Accessories",
    brand: "Catit",
    unit: "piece",
    purchasePrice: 1600,
    sellingPrice: 2399,
    mrp: 2699,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  {
    id: "prod-093",
    sku: "AC-WAU-093",
    barcode: "89010010093",
    name: "Poop Bag Dispenser with 8 Rolls Biodegradable Bags (120 Bags)",
    category: "Accessories",
    brand: "EarthRated",
    unit: "box",
    purchasePrice: 250,
    sellingPrice: 399,
    mrp: 450,
    taxPercent: 18,
    minStockLevel: 15,
    reorderLevel: 30,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "dog",
    status: "ACTIVE"
  },
  {
    id: "prod-094",
    sku: "AC-SCR-094",
    barcode: "89010010094",
    name: "Multi-Level Cat Scratching Post Tree with Sisal Rope 85cm",
    category: "Accessories",
    brand: "CatTree",
    unit: "piece",
    purchasePrice: 1800,
    sellingPrice: 2890,
    mrp: 3200,
    taxPercent: 18,
    minStockLevel: 3,
    reorderLevel: 6,
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    avatarType: "cat",
    status: "ACTIVE"
  },
  // AQUARIUM PRODUCTS (8 items)
  {
    id: "prod-095",
    sku: "AQ-API-095",
    barcode: "89010010095",
    name: "API Stress Coat Water Conditioner & Aloe Healer 237ml",
    category: "Aquarium Products",
    brand: "API",
    unit: "bottle",
    purchasePrice: 420,
    sellingPrice: 599,
    mrp: 670,
    taxPercent: 18,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-096",
    sku: "AQ-SEA-096",
    barcode: "89010010096",
    name: "Seachem Prime Complete Concentrated Water Dechlorinator 250ml",
    category: "Aquarium Products",
    brand: "Seachem",
    unit: "bottle",
    purchasePrice: 650,
    sellingPrice: 899,
    mrp: 990,
    taxPercent: 18,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-097",
    sku: "AQ-SOB-097",
    barcode: "89010010097",
    name: "SOBO Submersible Internal Filter WP-3000 (1200 L/H)",
    category: "Aquarium Products",
    brand: "SOBO",
    unit: "piece",
    purchasePrice: 450,
    sellingPrice: 699,
    mrp: 799,
    taxPercent: 18,
    minStockLevel: 6,
    reorderLevel: 12,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-098",
    sku: "AQ-SUN-098",
    barcode: "89010010098",
    name: "SunSun External Canister Filter HW-603B Multi-Stage",
    category: "Aquarium Products",
    brand: "SunSun",
    unit: "piece",
    purchasePrice: 1150,
    sellingPrice: 1750,
    mrp: 1950,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-099",
    sku: "AQ-HEA-099",
    barcode: "89010010099",
    name: "Eheim Jager Precision Aquarium Thermostatic Heater 100W",
    category: "Aquarium Products",
    brand: "Eheim",
    unit: "piece",
    purchasePrice: 1400,
    sellingPrice: 2090,
    mrp: 2350,
    taxPercent: 18,
    minStockLevel: 4,
    reorderLevel: 8,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-100",
    sku: "AQ-LED-100",
    barcode: "89010010100",
    name: "Chihiros RGB A-Series Aquatic Plant LED Light 45cm",
    category: "Aquarium Products",
    brand: "Chihiros",
    unit: "piece",
    purchasePrice: 2600,
    sellingPrice: 3890,
    mrp: 4300,
    taxPercent: 18,
    minStockLevel: 3,
    reorderLevel: 6,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-101",
    sku: "AQ-GRA-101",
    barcode: "89010010101",
    name: "Natural Black River Aquarium Gravel Substrate 5kg",
    category: "Aquarium Products",
    brand: "AquaScape",
    unit: "packet",
    purchasePrice: 180,
    sellingPrice: 299,
    mrp: 350,
    taxPercent: 18,
    minStockLevel: 10,
    reorderLevel: 20,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  },
  {
    id: "prod-102",
    sku: "AQ-BIO-102",
    barcode: "89010010102",
    name: "Fluval Biomax Biological Filter Rings Media 500g",
    category: "Aquarium Products",
    brand: "Fluval",
    unit: "box",
    purchasePrice: 480,
    sellingPrice: 699,
    mrp: 790,
    taxPercent: 18,
    minStockLevel: 8,
    reorderLevel: 16,
    supplierId: "sup-5",
    supplierName: "Aquaria World & Exotic Marine",
    avatarType: "fish",
    status: "ACTIVE"
  }
];
function generateInitialInventory() {
  const inventory = [];
  const branchIds = ["branch-1", "branch-2", "branch-3", "branch-4", "branch-5", "branch-6"];
  const now = (/* @__PURE__ */ new Date()).toISOString();
  INITIAL_PRODUCTS.forEach((product, idx) => {
    branchIds.forEach((bId, bIndex) => {
      let qty = 15;
      if (idx === 0) {
        const map = {
          "branch-1": 25,
          "branch-2": 18,
          "branch-3": 40,
          "branch-4": 12,
          "branch-5": 31,
          "branch-6": 20
        };
        qty = map[bId] || 20;
      } else if (idx === 2) {
        const map = {
          "branch-1": 30,
          "branch-2": 22,
          "branch-3": 35,
          "branch-4": 18,
          "branch-5": 25,
          "branch-6": 15
        };
        qty = map[bId] || 20;
      } else if (idx % 11 === 0) {
        qty = bIndex === 2 ? 3 : bIndex === 3 ? 2 : (idx * 3 + bIndex * 7) % 25 + 8;
      } else if (idx % 17 === 0) {
        qty = bIndex === 5 ? 0 : (idx * 4 + bIndex * 3) % 20 + 5;
      } else {
        qty = (idx * 7 + bIndex * 13) % 35 + 6;
      }
      inventory.push({
        branchId: bId,
        productId: product.id,
        quantity: qty,
        lastUpdated: now
      });
    });
  });
  return inventory;
}
var INITIAL_STAFF = [
  // Branch 1 (Colaba)
  {
    id: "staff-01",
    staffCode: "STF-B01-01",
    name: "Rajesh Sharma",
    avatarType: "dog",
    phone: "+91 98201 22331",
    email: "rajesh.sharma@petworld.co.in",
    address: "Flat 102, Sunrise Apt, Colaba, Mumbai",
    branchId: "branch-1",
    branchName: "Pet World Downtown Flagship",
    designation: "Branch Manager",
    role: "BRANCH_MANAGER",
    joiningDate: "2021-03-15",
    basicSalary: 55e3,
    status: "ACTIVE",
    username: "rajesh_b1"
  },
  {
    id: "staff-02",
    staffCode: "STF-B01-02",
    name: "Deepak Kamble",
    avatarType: "cat",
    phone: "+91 98202 33442",
    email: "deepak.k@petworld.co.in",
    address: "45 Sassoon Docks Road, Colaba, Mumbai",
    branchId: "branch-1",
    branchName: "Pet World Downtown Flagship",
    designation: "Cashier",
    role: "CASHIER",
    joiningDate: "2021-06-01",
    basicSalary: 28e3,
    status: "ACTIVE",
    username: "deepak_b1"
  },
  {
    id: "staff-03",
    staffCode: "STF-B01-03",
    name: "Sneha Jadhav",
    avatarType: "rabbit",
    phone: "+91 98203 44553",
    email: "sneha.j@petworld.co.in",
    address: "12 Cuffe Parade Chawl, Mumbai",
    branchId: "branch-1",
    branchName: "Pet World Downtown Flagship",
    designation: "Sales Staff",
    role: "SALES_STAFF",
    joiningDate: "2022-02-10",
    basicSalary: 22e3,
    status: "ACTIVE",
    username: "sneha_b1"
  },
  {
    id: "staff-04",
    staffCode: "STF-B01-04",
    name: "Rohan Naik",
    avatarType: "fish",
    phone: "+91 98204 55664",
    email: "rohan.n@petworld.co.in",
    address: "Near Fort Market, Mumbai",
    branchId: "branch-1",
    branchName: "Pet World Downtown Flagship",
    designation: "Sales Staff",
    role: "SALES_STAFF",
    joiningDate: "2022-08-15",
    basicSalary: 22e3,
    status: "ACTIVE",
    username: "rohan_b1"
  },
  // Branch 2 (Bandra)
  {
    id: "staff-05",
    staffCode: "STF-B02-01",
    name: "Priya Mehra",
    avatarType: "cat",
    phone: "+91 98331 11223",
    email: "priya.mehra@petworld.co.in",
    address: "Pali Hill View, Bandra West, Mumbai",
    branchId: "branch-2",
    branchName: "Pet World Westside Mall",
    designation: "Branch Manager",
    role: "BRANCH_MANAGER",
    joiningDate: "2021-09-10",
    basicSalary: 52e3,
    status: "ACTIVE",
    username: "priya_b2"
  },
  {
    id: "staff-06",
    staffCode: "STF-B02-02",
    name: "Kavita Menon",
    avatarType: "dog",
    phone: "+91 98332 22334",
    email: "kavita.m@petworld.co.in",
    address: "Hill Road, Bandra West, Mumbai",
    branchId: "branch-2",
    branchName: "Pet World Westside Mall",
    designation: "Cashier",
    role: "CASHIER",
    joiningDate: "2022-01-15",
    basicSalary: 28e3,
    status: "ACTIVE",
    username: "kavita_b2"
  },
  {
    id: "staff-07",
    staffCode: "STF-B02-03",
    name: "Gaurav Sawant",
    avatarType: "bird",
    phone: "+91 98333 33445",
    email: "gaurav.s@petworld.co.in",
    address: "Khar Danda, Mumbai",
    branchId: "branch-2",
    branchName: "Pet World Westside Mall",
    designation: "Sales Staff",
    role: "SALES_STAFF",
    joiningDate: "2023-03-01",
    basicSalary: 21e3,
    status: "ACTIVE",
    username: "gaurav_b2"
  },
  // Branch 3 (Andheri)
  {
    id: "staff-08",
    staffCode: "STF-B03-01",
    name: "Amit Verma",
    avatarType: "dog",
    phone: "+91 98111 66778",
    email: "amit.verma@petworld.co.in",
    address: "MIDC Cross Rd, Andheri East, Mumbai",
    branchId: "branch-3",
    branchName: "Pet World Suburban Plaza",
    designation: "Branch Manager",
    role: "BRANCH_MANAGER",
    joiningDate: "2022-04-01",
    basicSalary: 5e4,
    status: "ACTIVE",
    username: "amit_b3"
  },
  {
    id: "staff-09",
    staffCode: "STF-B03-02",
    name: "Suresh More",
    avatarType: "hamster",
    phone: "+91 98112 77889",
    email: "suresh.m@petworld.co.in",
    address: "Marol Pipeline, Andheri East, Mumbai",
    branchId: "branch-3",
    branchName: "Pet World Suburban Plaza",
    designation: "Cashier",
    role: "CASHIER",
    joiningDate: "2022-05-15",
    basicSalary: 27e3,
    status: "ACTIVE",
    username: "suresh_b3"
  },
  {
    id: "staff-10",
    staffCode: "STF-B03-03",
    name: "Pooja Chawla",
    avatarType: "cat",
    phone: "+91 98113 88990",
    email: "pooja.c@petworld.co.in",
    address: "Sahar Village, Andheri, Mumbai",
    branchId: "branch-3",
    branchName: "Pet World Suburban Plaza",
    designation: "Sales Staff",
    role: "SALES_STAFF",
    joiningDate: "2023-08-20",
    basicSalary: 21e3,
    status: "ACTIVE",
    username: "pooja_b3"
  },
  // Branch 4 (Powai)
  {
    id: "staff-11",
    staffCode: "STF-B04-01",
    name: "Neha Deshmukh",
    avatarType: "rabbit",
    phone: "+91 98220 33441",
    email: "neha.d@petworld.co.in",
    address: "Hiranandani Heritage, Powai, Mumbai",
    branchId: "branch-4",
    branchName: "Pet World Green Valley",
    designation: "Branch Manager",
    role: "BRANCH_MANAGER",
    joiningDate: "2022-11-20",
    basicSalary: 52e3,
    status: "ACTIVE",
    username: "neha_b4"
  },
  {
    id: "staff-12",
    staffCode: "STF-B04-02",
    name: "Vikas Rao",
    avatarType: "dog",
    phone: "+91 98221 44552",
    email: "vikas.r@petworld.co.in",
    address: "Chandivali Farm Rd, Powai, Mumbai",
    branchId: "branch-4",
    branchName: "Pet World Green Valley",
    designation: "Cashier",
    role: "CASHIER",
    joiningDate: "2023-01-10",
    basicSalary: 27e3,
    status: "ACTIVE",
    username: "vikas_b4"
  },
  {
    id: "staff-13",
    staffCode: "STF-B04-03",
    name: "Anjali Gupta",
    avatarType: "bird",
    phone: "+91 98222 55663",
    email: "anjali.g@petworld.co.in",
    address: "Kanjurmarg West, Mumbai",
    branchId: "branch-4",
    branchName: "Pet World Green Valley",
    designation: "Sales Staff",
    role: "SALES_STAFF",
    joiningDate: "2023-09-01",
    basicSalary: 21e3,
    status: "ACTIVE",
    username: "anjali_b4"
  },
  // Branch 5 (Juhu)
  {
    id: "staff-14",
    staffCode: "STF-B05-01",
    name: "Karan Malhotra",
    avatarType: "dog",
    phone: "+91 98450 11998",
    email: "karan.m@petworld.co.in",
    address: "Gulmohar Cross Rd 10, Juhu, Mumbai",
    branchId: "branch-5",
    branchName: "Pet World Coastal Bay",
    designation: "Branch Manager",
    role: "BRANCH_MANAGER",
    joiningDate: "2023-06-12",
    basicSalary: 54e3,
    status: "ACTIVE",
    username: "karan_b5"
  },
  {
    id: "staff-15",
    staffCode: "STF-B05-02",
    name: "Divya Shenoy",
    avatarType: "cat",
    phone: "+91 98451 22009",
    email: "divya.s@petworld.co.in",
    address: "Vile Parle West, Mumbai",
    branchId: "branch-5",
    branchName: "Pet World Coastal Bay",
    designation: "Cashier",
    role: "CASHIER",
    joiningDate: "2023-07-01",
    basicSalary: 28e3,
    status: "ACTIVE",
    username: "divya_b5"
  },
  {
    id: "staff-16",
    staffCode: "STF-B05-03",
    name: "Manish Pandey",
    avatarType: "fish",
    phone: "+91 98452 33110",
    email: "manish.p@petworld.co.in",
    address: "JVPD Scheme, Juhu, Mumbai",
    branchId: "branch-5",
    branchName: "Pet World Coastal Bay",
    designation: "Sales Staff",
    role: "SALES_STAFF",
    joiningDate: "2024-02-15",
    basicSalary: 21e3,
    status: "ACTIVE",
    username: "manish_b5"
  },
  // Branch 6 (Thane)
  {
    id: "staff-17",
    staffCode: "STF-B06-01",
    name: "Sunita Patil",
    avatarType: "bird",
    phone: "+91 98700 88771",
    email: "sunita.patil@petworld.co.in",
    address: "Majiwada Junction, Thane West",
    branchId: "branch-6",
    branchName: "Pet World Express Hub",
    designation: "Branch Manager",
    role: "BRANCH_MANAGER",
    joiningDate: "2024-01-18",
    basicSalary: 5e4,
    status: "ACTIVE",
    username: "sunita_b6"
  },
  {
    id: "staff-18",
    staffCode: "STF-B06-02",
    name: "Ramesh Sawant",
    avatarType: "dog",
    phone: "+91 98701 99882",
    email: "ramesh.s@petworld.co.in",
    address: "Ghodbunder Road, Thane West",
    branchId: "branch-6",
    branchName: "Pet World Express Hub",
    designation: "Cashier",
    role: "CASHIER",
    joiningDate: "2024-02-01",
    basicSalary: 26e3,
    status: "ACTIVE",
    username: "ramesh_b6"
  },
  {
    id: "staff-19",
    staffCode: "STF-B06-03",
    name: "Aditi Joshi",
    avatarType: "rabbit",
    phone: "+91 98702 11223",
    email: "aditi.j@petworld.co.in",
    address: "Naupada, Thane West",
    branchId: "branch-6",
    branchName: "Pet World Express Hub",
    designation: "Sales Staff",
    role: "SALES_STAFF",
    joiningDate: "2024-04-10",
    basicSalary: 2e4,
    status: "ACTIVE",
    username: "aditi_b6"
  },
  {
    id: "staff-20",
    staffCode: "STF-B06-04",
    name: "Tanmay Kulkarni",
    avatarType: "hamster",
    phone: "+91 98703 22334",
    email: "tanmay.k@petworld.co.in",
    address: "Wagle Estate, Thane West",
    branchId: "branch-6",
    branchName: "Pet World Express Hub",
    designation: "Sales Staff",
    role: "SALES_STAFF",
    joiningDate: "2024-06-01",
    basicSalary: 2e4,
    status: "ACTIVE",
    username: "tanmay_b6"
  }
];
var OWNER_USER = {
  id: "usr-owner-001",
  username: "owner",
  name: "Vikram Singhania",
  email: "owner@petworld.co.in",
  phone: "+91 98200 11000",
  role: "OWNER",
  avatarType: "dog",
  designation: "Founder & Super Admin",
  status: "ACTIVE"
};
var INITIAL_PURCHASES = [
  {
    id: "pur-001",
    purchaseNumber: "PUR-2026-00001",
    company: "Royal Canin",
    supplierId: "sup-1",
    supplierName: "Royal Canin India Pvt Ltd",
    supplierInvoiceNumber: "RC-INV-99214",
    purchaseDate: "2026-08-25",
    paymentStatus: "PAID",
    paymentMethod: "BANK_TRANSFER",
    items: [
      {
        productId: "prod-001",
        productName: "Royal Canin Maxi Adult Dog Food 15kg",
        sku: "DF-RC-001",
        company: "Royal Canin",
        brand: "Royal Canin",
        quantity: 100,
        purchasePrice: 6200,
        taxPercent: 18,
        discount: 0,
        total: 731600
      }
    ],
    subtotal: 62e4,
    taxAmount: 111600,
    discountAmount: 0,
    grandTotal: 731600,
    notes: "Central Bulk Monsoon Stock for all 6 Mumbai stores",
    allocatedStatus: "FULLY_ALLOCATED",
    createdAt: "2026-08-25T10:00:00Z"
  },
  {
    id: "pur-002",
    purchaseNumber: "PUR-2026-00002",
    company: "Pedigree (Mars Petcare)",
    supplierId: "sup-2",
    supplierName: "Mars Petcare India",
    supplierInvoiceNumber: "MARS-WRH-4412",
    purchaseDate: "2026-08-28",
    paymentStatus: "PAID",
    paymentMethod: "BANK_TRANSFER",
    items: [
      {
        productId: "prod-003",
        productName: "Pedigree Adult Chicken & Vegetables 10kg",
        sku: "DF-PED-003",
        company: "Pedigree (Mars Petcare)",
        brand: "Pedigree",
        quantity: 120,
        purchasePrice: 1650,
        taxPercent: 18,
        discount: 5e3,
        total: 227740
      },
      {
        productId: "prod-015",
        productName: "Whiskas Ocean Fish Adult Cat Food 7kg",
        sku: "CF-WHI-015",
        company: "Whiskas (Mars Petcare)",
        brand: "Whiskas",
        quantity: 80,
        purchasePrice: 1550,
        taxPercent: 18,
        discount: 3e3,
        total: 142780
      }
    ],
    subtotal: 322e3,
    taxAmount: 57960,
    discountAmount: 8e3,
    grandTotal: 371960,
    notes: "Commercial monthly pet food procurement",
    allocatedStatus: "FULLY_ALLOCATED",
    createdAt: "2026-08-28T11:30:00Z"
  },
  {
    id: "pur-003",
    purchaseNumber: "PUR-2026-00003",
    company: "Pet Passion Import & Distribution Hub",
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    supplierInvoiceNumber: "PPI-INV-7731",
    purchaseDate: "2026-09-02",
    paymentStatus: "PAID",
    paymentMethod: "BANK_TRANSFER",
    items: [
      {
        productId: "prod-047",
        productName: "KONG Classic Durable Natural Rubber Dog Toy (Large)",
        sku: "TY-KON-047",
        company: "KONG Company",
        brand: "KONG",
        quantity: 60,
        purchasePrice: 780,
        taxPercent: 18,
        discount: 0,
        total: 55224
      },
      {
        productId: "prod-063",
        productName: "Bedsure Orthopedic Memory Foam Dog Sofa Bed Large (Grey)",
        sku: "BM-BED-063",
        company: "Bedsure Pet",
        brand: "Bedsure",
        quantity: 30,
        purchasePrice: 2400,
        taxPercent: 18,
        discount: 2e3,
        total: 82600
      }
    ],
    subtotal: 118800,
    taxAmount: 21384,
    discountAmount: 2e3,
    grandTotal: 138184,
    notes: "Premium imported toys & orthopedic beds replenishment",
    allocatedStatus: "PARTIALLY_ALLOCATED",
    createdAt: "2026-09-02T14:15:00Z"
  }
];
var INITIAL_PURCHASE_BILLS = [
  {
    id: "bill-001",
    billNumber: "BILL-2026-001",
    purchaseId: "pur-001",
    supplierId: "sup-1",
    supplierName: "Royal Canin India Pvt Ltd",
    invoiceDate: "2026-08-25",
    invoiceAmount: 731600,
    paymentStatus: "PAID",
    fileName: "RC_TaxInvoice_99214.pdf",
    notes: "Original stamped invoice received with consignment at central hub."
  },
  {
    id: "bill-002",
    billNumber: "BILL-2026-002",
    purchaseId: "pur-002",
    supplierId: "sup-2",
    supplierName: "Mars Petcare India",
    invoiceDate: "2026-08-28",
    invoiceAmount: 371960,
    paymentStatus: "PAID",
    fileName: "MarsPet_TaxInvoice_4412.pdf",
    notes: "Paid via HDFC Bank NEFT ref #HDFC0098124."
  },
  {
    id: "bill-003",
    billNumber: "BILL-2026-003",
    purchaseId: "pur-003",
    supplierId: "sup-4",
    supplierName: "Pet Passion Import & Distribution Hub",
    invoiceDate: "2026-09-02",
    invoiceAmount: 138184,
    paymentStatus: "PAID",
    fileName: "PetPassion_Bill_7731.pdf",
    notes: "Partial stock allocated to B1 & B2, balance in central hub."
  }
];
var INITIAL_ALLOCATIONS = [
  {
    id: "alloc-001",
    purchaseId: "pur-001",
    purchaseNumber: "PUR-2026-00001",
    productId: "prod-001",
    productName: "Royal Canin Maxi Adult Dog Food 15kg",
    sku: "DF-RC-001",
    totalPurchased: 100,
    allocations: [
      { branchId: "branch-1", branchName: "Pet World Downtown Flagship", allocatedQuantity: 20, previousStock: 5, newStock: 25 },
      { branchId: "branch-2", branchName: "Pet World Westside Mall", allocatedQuantity: 15, previousStock: 3, newStock: 18 },
      { branchId: "branch-3", branchName: "Pet World Suburban Plaza", allocatedQuantity: 25, previousStock: 15, newStock: 40 },
      { branchId: "branch-4", branchName: "Pet World Green Valley", allocatedQuantity: 10, previousStock: 2, newStock: 12 },
      { branchId: "branch-5", branchName: "Pet World Coastal Bay", allocatedQuantity: 20, previousStock: 11, newStock: 31 },
      { branchId: "branch-6", branchName: "Pet World Express Hub", allocatedQuantity: 10, previousStock: 10, newStock: 20 }
    ],
    allocatedBy: "Vikram Singhania (Owner)",
    date: "2026-08-25",
    time: "11:45:00 AM",
    timestamp: 17876583e5,
    notes: "Distributed to all 6 branches based on footfall analysis"
  }
];
var INITIAL_STOCK_MOVEMENTS = [
  {
    id: "sm-001",
    productId: "prod-001",
    productName: "Royal Canin Maxi Adult Dog Food 15kg",
    sku: "DF-RC-001",
    branchId: "branch-1",
    branchName: "Pet World Downtown Flagship",
    previousQuantity: 5,
    quantityAdded: 20,
    quantityRemoved: 0,
    newQuantity: 25,
    operationType: "STOCK ADDED",
    reason: "Central purchase stock allocation",
    referenceNumber: "PUR-2026-00001",
    purchaseBillNumber: "BILL-2026-001",
    userName: "Vikram Singhania",
    userRole: "OWNER",
    date: "2026-08-25",
    time: "11:45:10 AM",
    timestamp: 178765831e4
  },
  {
    id: "sm-002",
    productId: "prod-001",
    productName: "Royal Canin Maxi Adult Dog Food 15kg",
    sku: "DF-RC-001",
    branchId: "branch-3",
    branchName: "Pet World Suburban Plaza",
    previousQuantity: 15,
    quantityAdded: 25,
    quantityRemoved: 0,
    newQuantity: 40,
    operationType: "STOCK ADDED",
    reason: "Central purchase stock allocation",
    referenceNumber: "PUR-2026-00001",
    purchaseBillNumber: "BILL-2026-001",
    userName: "Vikram Singhania",
    userRole: "OWNER",
    date: "2026-08-25",
    time: "11:45:25 AM",
    timestamp: 1787658325e3
  },
  {
    id: "sm-003",
    productId: "prod-001",
    productName: "Royal Canin Maxi Adult Dog Food 15kg",
    sku: "DF-RC-001",
    branchId: "branch-2",
    branchName: "Pet World Westside Mall",
    previousQuantity: 20,
    quantityAdded: 0,
    quantityRemoved: 2,
    newQuantity: 18,
    operationType: "STOCK SOLD",
    reason: "Retail Counter Sale",
    referenceNumber: "PW-SAL-2026-00012",
    userName: "Kavita Menon",
    userRole: "CASHIER",
    date: "2026-09-05",
    time: "03:15:40 PM",
    timestamp: 178862134e4
  }
];
var INITIAL_SALES = [
  {
    id: "sal-001",
    invoiceNumber: "PW-SAL-2026-00012",
    branchId: "branch-2",
    branchName: "Pet World Westside Mall",
    branchAddress: "Ground Floor, Galleria Arcade, Linking Road, Bandra West",
    branchPhone: "+91 22 2640 8822",
    staffId: "staff-06",
    staffName: "Kavita Menon",
    customerName: "Aditya Kapoor",
    customerPhone: "+91 98200 45451",
    items: [
      {
        productId: "prod-001",
        productName: "Royal Canin Maxi Adult Dog Food 15kg",
        sku: "DF-RC-001",
        unit: "packet",
        quantity: 2,
        unitPrice: 7990,
        discount: 200,
        taxPercent: 18,
        taxAmount: 2404.78,
        lineTotal: 15780
      },
      {
        productId: "prod-039",
        productName: "JerHigh Milky Dog Sticks Real Chicken 70g",
        sku: "TR-JER-039",
        unit: "packet",
        quantity: 3,
        unitPrice: 165,
        discount: 0,
        taxPercent: 18,
        taxAmount: 75.5,
        lineTotal: 495
      }
    ],
    subtotal: 13794.72,
    discountTotal: 200,
    taxTotal: 2480.28,
    grandTotal: 16275,
    paymentMethod: "UPI",
    status: "COMPLETED",
    date: "2026-09-05",
    time: "03:15:40 PM",
    timestamp: 178862134e4
  },
  {
    id: "sal-002",
    invoiceNumber: "PW-SAL-2026-00013",
    branchId: "branch-1",
    branchName: "Pet World Downtown Flagship",
    branchAddress: "14/B, Colaba Causeway, Near Regal Cinema",
    branchPhone: "+91 22 2202 1144",
    staffId: "staff-02",
    staffName: "Deepak Kamble",
    customerName: "Zoya Merchant",
    customerPhone: "+91 98211 77889",
    items: [
      {
        productId: "prod-013",
        productName: "Royal Canin Kitten Second Age 4kg",
        sku: "CF-RC-013",
        unit: "packet",
        quantity: 1,
        unitPrice: 3350,
        discount: 50,
        taxPercent: 18,
        taxAmount: 503.39,
        lineTotal: 3300
      },
      {
        productId: "prod-041",
        productName: "Temptations Tasty Chicken Crunchy Cat Treats 85g",
        sku: "TR-TEM-041",
        unit: "packet",
        quantity: 2,
        unitPrice: 180,
        discount: 0,
        taxPercent: 18,
        taxAmount: 54.91,
        lineTotal: 360
      },
      {
        productId: "prod-088",
        productName: "Hooded Enclosed Cat Litter Box with Carbon Filter & Scoop",
        sku: "AC-LIT-088",
        unit: "piece",
        quantity: 1,
        unitPrice: 1890,
        discount: 90,
        taxPercent: 18,
        taxAmount: 274.58,
        lineTotal: 1800
      }
    ],
    subtotal: 4627.12,
    discountTotal: 140,
    taxTotal: 832.88,
    grandTotal: 5460,
    paymentMethod: "CARD",
    status: "COMPLETED",
    date: "2026-09-05",
    time: "05:40:12 PM",
    timestamp: 1788630012e3
  }
];
var INITIAL_NOTIFICATIONS = [
  {
    id: "notif-03",
    type: "LARGE_PURCHASE",
    title: "New Bulk Purchase Inward",
    message: "Purchase PUR-2026-00003 registered with Pet Passion Hub for \u20B91,38,184.",
    timestamp: Date.now() - 36e5 * 24,
    date: "2026-09-05",
    time: "11:00 AM",
    isRead: true,
    referenceId: "pur-003"
  },
  {
    id: "notif-04",
    type: "ATTENDANCE_ALERT",
    title: "Late Check-in Logged",
    message: "Rohan Naik (Branch 1 - Colaba) checked in at 10:45 AM (Shift began at 10:00 AM).",
    branchId: "branch-1",
    branchName: "Pet World Downtown Flagship",
    timestamp: Date.now() - 36e5 * 2,
    date: "2026-09-06",
    time: "10:45 AM",
    isRead: false
  }
];

// api/server/productImages.ts
var SERVER_PRODUCT_IMAGES = {
  "royal-canin": "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&auto=format&fit=crop&q=80",
  "royal-canin-wet": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=80",
  "pedigree": "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500&auto=format&fit=crop&q=80",
  "pedigree-wet": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=80",
  "drools": "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&auto=format&fit=crop&q=80",
  "farmina": "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&auto=format&fit=crop&q=80",
  "whiskas": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80",
  "whiskas-wet": "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=500&auto=format&fit=crop&q=80",
  "sheba": "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=500&auto=format&fit=crop&q=80",
  "me-o": "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&auto=format&fit=crop&q=80",
  "hills": "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=500&auto=format&fit=crop&q=80",
  "bird": "https://images.unsplash.com/photo-1522858547137-f1dcec554f55?w=500&auto=format&fit=crop&q=80",
  "fish": "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=80"
};
function resolveProductImageUrl(p) {
  if (p.imageUrl && typeof p.imageUrl === "string" && p.imageUrl.startsWith("http")) {
    return p.imageUrl;
  }
  const brand = (p.brand || "").toLowerCase();
  const company = (p.company || "").toLowerCase();
  const name = (p.name || "").toLowerCase();
  const isWet = p.productForm === "WET" || name.includes("gravy") || name.includes("can") || name.includes("pouch") || name.includes("wet");
  if (brand.includes("royal") || company.includes("royal")) {
    return isWet ? SERVER_PRODUCT_IMAGES["royal-canin-wet"] : SERVER_PRODUCT_IMAGES["royal-canin"];
  }
  if (brand.includes("pedigree") || company.includes("pedigree")) {
    return isWet ? SERVER_PRODUCT_IMAGES["pedigree-wet"] : SERVER_PRODUCT_IMAGES["pedigree"];
  }
  if (brand.includes("drools") || company.includes("drools")) {
    return SERVER_PRODUCT_IMAGES["drools"];
  }
  if (brand.includes("farmina") || company.includes("farmina") || brand.includes("n&d")) {
    return SERVER_PRODUCT_IMAGES["farmina"];
  }
  if (brand.includes("whiskas") || company.includes("whiskas")) {
    return isWet ? SERVER_PRODUCT_IMAGES["whiskas-wet"] : SERVER_PRODUCT_IMAGES["whiskas"];
  }
  if (brand.includes("sheba") || company.includes("sheba")) {
    return SERVER_PRODUCT_IMAGES["sheba"];
  }
  if (brand.includes("me-o") || brand.includes("meo")) {
    return SERVER_PRODUCT_IMAGES["me-o"];
  }
  if (brand.includes("hill")) {
    return SERVER_PRODUCT_IMAGES["hills"];
  }
  if (p.avatarType === "bird" || (p.category || "").toLowerCase().includes("bird")) {
    return SERVER_PRODUCT_IMAGES["bird"];
  }
  if (p.avatarType === "fish" || (p.category || "").toLowerCase().includes("fish")) {
    return SERVER_PRODUCT_IMAGES["fish"];
  }
  if (p.avatarType === "cat" || (p.category || "").toLowerCase().includes("cat")) {
    return SERVER_PRODUCT_IMAGES["whiskas"];
  }
  return SERVER_PRODUCT_IMAGES["royal-canin"];
}

// api/server/db.ts
var isVercelEnv = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV) || Boolean(process.env.VERCEL_REGION) || Boolean(process.env.NOW_REGION) || Boolean(process.env.LAMBDA_TASK_ROOT) || process.cwd().startsWith("/var/task");
var DB_DIR = process.env.DATA_DIR || (isVercelEnv ? "/tmp" : path.join(process.cwd(), "data"));
var DB_FILE = path.join(DB_DIR, "petworld_db.json");
var READONLY_DB_FILE = path.join(process.cwd(), "data", "petworld_db.json");
var PetWorldDatabase = class {
  constructor() {
    this.transactionSnapshot = null;
    this.isProcessing = false;
    this.barcodeIndex = /* @__PURE__ */ new Map();
    try {
      this.data = this.loadInitialData();
    } catch (err) {
      console.error("Error during loadInitialData:", err);
      this.data = {
        branches: INITIAL_BRANCHES,
        products: INITIAL_PRODUCTS.map((p) => ({
          ...p,
          imageUrl: p.imageUrl || resolveProductImageUrl(p)
        })),
        inventory: generateInitialInventory(),
        suppliers: INITIAL_SUPPLIERS,
        staff: INITIAL_STAFF,
        purchases: INITIAL_PURCHASES,
        purchaseBills: INITIAL_PURCHASE_BILLS,
        purchaseAllocations: INITIAL_ALLOCATIONS,
        sales: INITIAL_SALES,
        stockMovements: INITIAL_STOCK_MOVEMENTS,
        attendance: [],
        salaries: [],
        salaryAdvances: [],
        notifications: INITIAL_NOTIFICATIONS,
        settings: INITIAL_SETTINGS
      };
    }
    try {
      this.rebuildBarcodeIndex();
    } catch (err) {
      console.error("Error during rebuildBarcodeIndex:", err);
    }
  }
  rebuildBarcodeIndex() {
    this.barcodeIndex.clear();
    for (const p of this.data.products) {
      if (p.barcode) {
        this.barcodeIndex.set(p.barcode.trim().toLowerCase(), p);
      }
    }
  }
  generateInitialAttendance() {
    const records = [];
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 864e5).toISOString().split("T")[0];
    INITIAL_STAFF.forEach((stf, index) => {
      const isLate = index % 7 === 2;
      const isAbsent = index % 11 === 0;
      const isHalfDay = index % 13 === 0;
      if (!isAbsent) {
        records.push({
          id: `att-today-${stf.id}`,
          date: today,
          staffId: stf.id,
          staffName: stf.name,
          branchId: stf.branchId,
          branchName: stf.branchName,
          loginTime: isLate ? "10:45 AM" : "09:55 AM",
          logoutTime: void 0,
          status: isLate ? "LATE" : isHalfDay ? "HALF_DAY" : "PRESENT",
          remarks: isLate ? "Traffic congestion on Western Express" : void 0
        });
      } else {
        records.push({
          id: `att-today-${stf.id}`,
          date: today,
          staffId: stf.id,
          staffName: stf.name,
          branchId: stf.branchId,
          branchName: stf.branchName,
          loginTime: "-",
          logoutTime: "-",
          status: "LEAVE",
          remarks: "Approved sick leave"
        });
      }
      records.push({
        id: `att-yest-${stf.id}`,
        date: yesterday,
        staffId: stf.id,
        staffName: stf.name,
        branchId: stf.branchId,
        branchName: stf.branchName,
        loginTime: "09:58 AM",
        logoutTime: "08:05 PM",
        status: "PRESENT"
      });
    });
    return records;
  }
  generateInitialSalaries() {
    const salaries = [];
    INITIAL_STAFF.forEach((stf) => {
      const isManager = stf.role === "BRANCH_MANAGER";
      const isCashierFlagship = stf.id === "staff-02";
      const isPaid = isManager || isCashierFlagship;
      const allowances = Math.round(stf.basicSalary * 0.15);
      const deductions = Math.round(stf.basicSalary * 0.05);
      const bonus = isManager ? 3500 : stf.role === "CASHIER" ? 1200 : 800;
      const overtime = stf.role === "SALES_STAFF" ? 900 : 0;
      const advance = 0;
      const netSalary = stf.basicSalary + allowances - deductions + bonus + overtime - advance;
      salaries.push({
        id: `sal-sep-${stf.id}`,
        staffId: stf.id,
        staffName: stf.name,
        branchId: stf.branchId,
        branchName: stf.branchName,
        month: "September 2026",
        basicSalary: stf.basicSalary,
        allowances,
        deductions,
        overtime,
        bonus,
        advance,
        netSalary,
        status: isPaid ? "PAID" : "PENDING",
        paymentStatus: isPaid ? "PAID" : "PENDING",
        paymentDate: isPaid ? isManager ? "2026-09-05" : "2026-09-06" : void 0,
        paymentMode: isPaid ? isManager ? "Bank Transfer" : "UPI" : void 0,
        paymentMethod: isPaid ? isManager ? "BANK_TRANSFER" : "UPI" : void 0
      });
    });
    INITIAL_STAFF.forEach((stf) => {
      const allowances = Math.round(stf.basicSalary * 0.15);
      const deductions = Math.round(stf.basicSalary * 0.05);
      const bonus = stf.role === "BRANCH_MANAGER" ? 3e3 : 1500;
      const overtime = 1200;
      const advance = 0;
      const netSalary = stf.basicSalary + allowances - deductions + bonus + overtime - advance;
      salaries.push({
        id: `sal-aug-${stf.id}`,
        staffId: stf.id,
        staffName: stf.name,
        branchId: stf.branchId,
        branchName: stf.branchName,
        month: "August 2026",
        basicSalary: stf.basicSalary,
        allowances,
        deductions,
        overtime,
        bonus,
        advance,
        netSalary,
        status: "PAID",
        paymentStatus: "PAID",
        paymentDate: "2026-08-31",
        paymentMode: stf.role === "BRANCH_MANAGER" ? "Bank Transfer" : "UPI",
        paymentMethod: "BANK_TRANSFER"
      });
    });
    INITIAL_STAFF.forEach((stf) => {
      const allowances = Math.round(stf.basicSalary * 0.15);
      const deductions = Math.round(stf.basicSalary * 0.05);
      const bonus = stf.role === "BRANCH_MANAGER" ? 2500 : 1e3;
      const overtime = 800;
      const advance = 0;
      const netSalary = stf.basicSalary + allowances - deductions + bonus + overtime - advance;
      salaries.push({
        id: `sal-jul-${stf.id}`,
        staffId: stf.id,
        staffName: stf.name,
        branchId: stf.branchId,
        branchName: stf.branchName,
        month: "July 2026",
        basicSalary: stf.basicSalary,
        allowances,
        deductions,
        overtime,
        bonus,
        advance,
        netSalary,
        status: "PAID",
        paymentStatus: "PAID",
        paymentDate: "2026-07-31",
        paymentMode: "Bank Transfer",
        paymentMethod: "BANK_TRANSFER"
      });
    });
    return salaries;
  }
  generateInitialSalaryAdvances() {
    return [
      {
        id: "adv-sep-01",
        staffId: "staff-03",
        staffName: "Sneha Jadhav",
        branchId: "branch-1",
        branchName: "Pet World Downtown Flagship",
        month: "September 2026",
        date: "2026-09-04",
        amount: 2e3,
        reason: "Medical Emergency",
        notes: "Urgent prescription medicines for mother",
        paymentMode: "Cash",
        approvedBy: "Rajesh Sharma (Store Manager)",
        receiptNumber: "ADV-SEP-001",
        createdAt: "2026-09-04T11:30:00.000Z"
      },
      {
        id: "adv-sep-02",
        staffId: "staff-03",
        staffName: "Sneha Jadhav",
        branchId: "branch-1",
        branchName: "Pet World Downtown Flagship",
        month: "September 2026",
        date: "2026-09-09",
        amount: 1500,
        reason: "Commute & Travel Pass",
        notes: "Monthly local train quarterly renewal & petrol",
        paymentMode: "UPI",
        approvedBy: "Rajesh Sharma (Store Manager)",
        receiptNumber: "ADV-SEP-002",
        createdAt: "2026-09-09T14:15:00.000Z"
      },
      {
        id: "adv-sep-03",
        staffId: "staff-04",
        staffName: "Rohan Naik",
        branchId: "branch-1",
        branchName: "Pet World Downtown Flagship",
        month: "September 2026",
        date: "2026-09-02",
        amount: 2e3,
        reason: "Vehicle Repair",
        notes: "Motorcycle clutch plate replacement & brake servicing",
        paymentMode: "Cash",
        approvedBy: "Rajesh Sharma (Store Manager)",
        receiptNumber: "ADV-SEP-003",
        createdAt: "2026-09-02T10:00:00.000Z"
      },
      {
        id: "adv-sep-04",
        staffId: "staff-04",
        staffName: "Rohan Naik",
        branchId: "branch-1",
        branchName: "Pet World Downtown Flagship",
        month: "September 2026",
        date: "2026-09-07",
        amount: 1500,
        reason: "Apartment Utility Bill",
        notes: "Electricity bill and building maintenance dues",
        paymentMode: "UPI",
        approvedBy: "Rajesh Sharma (Store Manager)",
        receiptNumber: "ADV-SEP-004",
        createdAt: "2026-09-07T16:20:00.000Z"
      },
      {
        id: "adv-sep-05",
        staffId: "staff-04",
        staffName: "Rohan Naik",
        branchId: "branch-1",
        branchName: "Pet World Downtown Flagship",
        month: "September 2026",
        date: "2026-09-11",
        amount: 1e3,
        reason: "Personal Emergency Cash",
        notes: "Urgent household cash requirement",
        paymentMode: "Cash",
        approvedBy: "Rajesh Sharma (Store Manager)",
        receiptNumber: "ADV-SEP-005",
        createdAt: "2026-09-11T12:00:00.000Z"
      },
      {
        id: "adv-sep-06",
        staffId: "staff-07",
        staffName: "Gaurav Sawant",
        branchId: "branch-2",
        branchName: "Pet World Westside Mall",
        month: "September 2026",
        date: "2026-09-05",
        amount: 2500,
        reason: "Home Rent Advance",
        notes: "Advance part payment for rental deposit",
        paymentMode: "Bank Transfer",
        approvedBy: "Priya Mehra (Store Manager)",
        receiptNumber: "ADV-SEP-006",
        createdAt: "2026-09-05T09:45:00.000Z"
      },
      {
        id: "adv-sep-07",
        staffId: "staff-07",
        staffName: "Gaurav Sawant",
        branchId: "branch-2",
        branchName: "Pet World Westside Mall",
        month: "September 2026",
        date: "2026-09-10",
        amount: 1200,
        reason: "Medical Emergency",
        notes: "Dental root canal treatment part payment",
        paymentMode: "UPI",
        approvedBy: "Priya Mehra (Store Manager)",
        receiptNumber: "ADV-SEP-007",
        createdAt: "2026-09-10T15:30:00.000Z"
      },
      {
        id: "adv-sep-08",
        staffId: "staff-10",
        staffName: "Pooja Chawla",
        branchId: "branch-3",
        branchName: "Pet World Suburban Plaza",
        month: "September 2026",
        date: "2026-09-06",
        amount: 2e3,
        reason: "Family Function & Travel",
        notes: "Bus ticket booking for hometown visit",
        paymentMode: "Cash",
        approvedBy: "Amit Verma (Store Manager)",
        receiptNumber: "ADV-SEP-008",
        createdAt: "2026-09-06T18:10:00.000Z"
      },
      {
        id: "adv-sep-09",
        staffId: "staff-16",
        staffName: "Manish Pandey",
        branchId: "branch-5",
        branchName: "Pet World Coastal Bay",
        month: "September 2026",
        date: "2026-09-04",
        amount: 2e3,
        reason: "Tuition & Training Fees",
        notes: "Veterinary assistant certification exam fee",
        paymentMode: "Bank Transfer",
        approvedBy: "Karan Malhotra (Store Manager)",
        receiptNumber: "ADV-SEP-009",
        createdAt: "2026-09-04T13:00:00.000Z"
      },
      {
        id: "adv-sep-10",
        staffId: "staff-16",
        staffName: "Manish Pandey",
        branchId: "branch-5",
        branchName: "Pet World Coastal Bay",
        month: "September 2026",
        date: "2026-09-09",
        amount: 1500,
        reason: "Emergency Cash",
        notes: "Personal family emergency expense",
        paymentMode: "Cash",
        approvedBy: "Karan Malhotra (Store Manager)",
        receiptNumber: "ADV-SEP-010",
        createdAt: "2026-09-09T17:40:00.000Z"
      },
      // August historical advances
      {
        id: "adv-aug-01",
        staffId: "staff-03",
        staffName: "Sneha Jadhav",
        branchId: "branch-1",
        branchName: "Pet World Downtown Flagship",
        month: "August 2026",
        date: "2026-08-14",
        amount: 2e3,
        reason: "Festival Advance",
        notes: "Raksha Bandhan festival family shopping",
        paymentMode: "Cash",
        approvedBy: "Rajesh Sharma (Store Manager)",
        receiptNumber: "ADV-AUG-001",
        createdAt: "2026-08-14T11:00:00.000Z"
      },
      {
        id: "adv-aug-02",
        staffId: "staff-04",
        staffName: "Rohan Naik",
        branchId: "branch-1",
        branchName: "Pet World Downtown Flagship",
        month: "August 2026",
        date: "2026-08-18",
        amount: 2500,
        reason: "Medical Emergency",
        notes: "Doctor consultation and medicine bills",
        paymentMode: "UPI",
        approvedBy: "Rajesh Sharma (Store Manager)",
        receiptNumber: "ADV-AUG-002",
        createdAt: "2026-08-18T14:30:00.000Z"
      }
    ];
  }
  loadInitialData() {
    try {
      let fileToRead = DB_FILE;
      if (!fs.existsSync(fileToRead) && fs.existsSync(READONLY_DB_FILE)) {
        fileToRead = READONLY_DB_FILE;
      }
      if (fs.existsSync(fileToRead)) {
        const raw = fs.readFileSync(fileToRead, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed.salaries || parsed.salaries.length < 50 || parsed.salaries.some((s) => s.month === "2026-09")) {
          parsed.salaries = this.generateInitialSalaries();
        }
        if (!parsed.salaryAdvances || parsed.salaryAdvances.length === 0) {
          parsed.salaryAdvances = this.generateInitialSalaryAdvances();
        }
        if (parsed.salaryAdvances && parsed.salaries) {
          const advList = parsed.salaryAdvances;
          parsed.salaries.forEach((s) => {
            const cleanMonth = (s.month || "").toLowerCase();
            const staffAdvances = advList.filter(
              (a) => a.staffId === s.staffId && (a.month === s.month || cleanMonth.includes("sep") && a.month.toLowerCase().includes("sep") || cleanMonth.includes("aug") && a.month.toLowerCase().includes("aug"))
            );
            s.advances = staffAdvances;
            s.advance = staffAdvances.reduce((sum, a) => sum + a.amount, 0);
            s.netSalary = Math.max(0, s.basicSalary + s.allowances - s.deductions + s.bonus + s.overtime - s.advance);
          });
        }
        if (parsed.purchases && parsed.products) {
          const prodMap = new Map(parsed.products.map((p) => [p.id, p]));
          parsed.purchases.forEach((pur) => {
            if (pur.items) {
              pur.items.forEach((it) => {
                const pr = prodMap.get(it.productId);
                if (!it.company) {
                  it.company = pr?.company || pr?.brand || pur.company || "General";
                }
                if (!it.brand) {
                  it.brand = pr?.brand || it.company;
                }
              });
            }
            if (!pur.company) {
              const firstItemCompany = pur.items?.find((i) => i.company && i.company !== "General")?.company;
              if (firstItemCompany) {
                pur.company = firstItemCompany;
              } else if (pur.supplierName?.toLowerCase().includes("royal canin")) {
                pur.company = "Royal Canin";
              } else if (pur.supplierName?.toLowerCase().includes("mars")) {
                pur.company = "Pedigree (Mars Petcare)";
              } else if (pur.supplierName?.toLowerCase().includes("drools")) {
                pur.company = "Drools Pet Food";
              } else {
                pur.company = "General / Multi-Brand";
              }
            }
          });
        }
        if (parsed.products && Array.isArray(parsed.products)) {
          parsed.products.forEach((p) => {
            if (!p.imageUrl || !p.imageUrl.startsWith("http")) {
              p.imageUrl = resolveProductImageUrl(p);
            }
          });
        }
        if (parsed.sales && Array.isArray(parsed.sales)) {
          parsed.sales.forEach((s) => {
            if (s.items && Array.isArray(s.items)) {
              s.items.forEach((it) => {
                if (!it.totalPrice || it.totalPrice === 0) {
                  it.totalPrice = it.lineTotal || Math.round((it.unitPrice || 0) * (it.quantity || 1));
                }
                if (!it.lineTotal || it.lineTotal === 0) {
                  it.lineTotal = it.totalPrice;
                }
              });
            }
          });
        }
        if (!parsed.settings) {
          parsed.settings = { ...INITIAL_SETTINGS };
        } else {
          parsed.settings = { ...INITIAL_SETTINGS, ...parsed.settings };
        }
        this.persist(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn("Could not read saved database, loading defaults:", e);
    }
    const defaultData = {
      branches: INITIAL_BRANCHES,
      products: INITIAL_PRODUCTS.map((p) => ({
        ...p,
        imageUrl: p.imageUrl || resolveProductImageUrl(p)
      })),
      inventory: generateInitialInventory(),
      suppliers: INITIAL_SUPPLIERS,
      staff: INITIAL_STAFF,
      purchases: INITIAL_PURCHASES,
      purchaseBills: INITIAL_PURCHASE_BILLS,
      purchaseAllocations: INITIAL_ALLOCATIONS,
      sales: INITIAL_SALES,
      stockMovements: INITIAL_STOCK_MOVEMENTS,
      attendance: this.generateInitialAttendance(),
      salaries: this.generateInitialSalaries(),
      salaryAdvances: this.generateInitialSalaryAdvances(),
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_SETTINGS
    };
    this.persist(defaultData);
    return defaultData;
  }
  persist(dataToPersist = this.data) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToPersist, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write database file:", e);
    }
  }
  // ACID Transaction Methods
  beginTransaction() {
    if (this.transactionSnapshot !== null) {
      throw new Error("A transaction is already active.");
    }
    this.transactionSnapshot = JSON.stringify(this.data);
  }
  commit() {
    if (this.transactionSnapshot === null) {
      throw new Error("No active transaction to commit.");
    }
    this.transactionSnapshot = null;
    this.persist();
  }
  rollback() {
    if (this.transactionSnapshot === null) {
      return;
    }
    this.data = JSON.parse(this.transactionSnapshot);
    this.transactionSnapshot = null;
  }
  // Branch Queries
  getBranches() {
    return this.data.branches;
  }
  getBranchById(id) {
    return this.data.branches.find((b) => b.id === id);
  }
  createBranch(branchData) {
    const newId = branchData.id || `branch-${Date.now()}`;
    const newBranch = {
      id: newId,
      code: branchData.code || `BR-${this.data.branches.length + 1}`,
      name: branchData.name || "New Branch",
      address: branchData.address || "",
      city: branchData.city || "Bengaluru",
      phone: branchData.phone || "",
      email: branchData.email || "",
      managerName: branchData.managerName || "Store Manager",
      status: branchData.status || "ACTIVE",
      openingDate: branchData.openingDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      taxRate: branchData.taxRate ?? 18,
      gstin: branchData.gstin || ""
    };
    this.data.branches.push(newBranch);
    this.persist();
    return newBranch;
  }
  updateBranch(id, updates) {
    const branch = this.data.branches.find((b) => b.id === id);
    if (!branch) throw new Error("Branch not found");
    Object.assign(branch, updates);
    this.persist();
    return branch;
  }
  // Product Queries
  getProducts() {
    return this.data.products;
  }
  getProductById(id) {
    return this.data.products.find((p) => p.id === id);
  }
  getProductByBarcode(barcode) {
    if (!barcode) return void 0;
    const clean = barcode.trim().toLowerCase();
    const cached = this.barcodeIndex.get(clean);
    if (cached) return cached;
    const found = this.data.products.find(
      (p) => p.barcode && p.barcode.trim().toLowerCase() === clean || p.sku && p.sku.trim().toLowerCase() === clean
    );
    if (found && found.barcode) {
      this.barcodeIndex.set(found.barcode.trim().toLowerCase(), found);
    }
    return found;
  }
  createProduct(productData) {
    if (productData.barcode && productData.barcode.trim()) {
      const existing = this.getProductByBarcode(productData.barcode.trim());
      if (existing) {
        throw new Error(`A product with barcode "${productData.barcode}" already exists: "${existing.name}". Please use the existing product or provide a unique barcode.`);
      }
    }
    const id = `prod-${String(this.data.products.length + 1).padStart(3, "0")}`;
    const initialStock = Math.max(0, Number(productData.initialStock) || 0);
    const initialBranchId = productData.initialBranchId || this.data.branches[0]?.id || "branch-1";
    const { initialStock: _is, initialBranchId: _ibi, ...cleanProductData } = productData;
    const newProduct = {
      ...cleanProductData,
      id,
      sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: (productData.barcode || "").trim(),
      status: productData.status || "ACTIVE"
    };
    this.data.products.push(newProduct);
    if (newProduct.barcode) {
      this.barcodeIndex.set(newProduct.barcode.toLowerCase(), newProduct);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.data.branches.forEach((branch) => {
      const isTargetBranch = branch.id === initialBranchId;
      const qty = isTargetBranch ? initialStock : 0;
      this.data.inventory.push({
        branchId: branch.id,
        productId: id,
        quantity: qty,
        batchNumber: productData.batchNumber,
        expiryDate: productData.expiryDate,
        lastUpdated: now
      });
    });
    if (initialStock > 0) {
      const branch = this.getBranchById(initialBranchId) || this.data.branches[0];
      const movement = {
        id: `sm-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        branchId: branch.id,
        branchName: branch.name,
        previousQuantity: 0,
        quantityAdded: initialStock,
        quantityRemoved: 0,
        newQuantity: initialStock,
        operationType: "STOCK ADDED",
        reason: "Initial stock on product creation",
        referenceNumber: `INIT-${Date.now().toString().slice(-6)}`,
        purchaseBillNumber: productData.batchNumber ? `Batch: ${productData.batchNumber}` : void 0,
        batchNumber: productData.batchNumber,
        expiryDate: productData.expiryDate,
        userName: "Stock Manager",
        userRole: "OWNER",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        timestamp: Date.now()
      };
      this.data.stockMovements.unshift(movement);
    }
    this.persist();
    return newProduct;
  }
  updateProduct(id, updates) {
    const product = this.data.products.find((p) => p.id === id);
    if (!product) throw new Error("Product not found");
    if (updates.barcode && updates.barcode.trim() !== product.barcode) {
      const existing = this.getProductByBarcode(updates.barcode.trim());
      if (existing && existing.id !== id) {
        throw new Error(`Barcode "${updates.barcode}" is already assigned to "${existing.name}".`);
      }
      if (product.barcode) {
        this.barcodeIndex.delete(product.barcode.trim().toLowerCase());
      }
    }
    Object.assign(product, updates);
    if (product.barcode) {
      this.barcodeIndex.set(product.barcode.trim().toLowerCase(), product);
    }
    this.persist();
    return product;
  }
  // Inventory Queries
  getInventory() {
    return this.data.inventory;
  }
  getBranchInventory(branchId) {
    return this.data.products.map((p) => {
      const inv = this.data.inventory.find((i) => i.branchId === branchId && i.productId === p.id);
      return {
        ...p,
        quantity: inv ? inv.quantity : 0,
        lastUpdated: inv ? inv.lastUpdated : (/* @__PURE__ */ new Date()).toISOString()
      };
    });
  }
  getBranchStock(branchId, productId) {
    const inv = this.data.inventory.find((i) => i.branchId === branchId && i.productId === productId);
    return inv ? inv.quantity : 0;
  }
  getProductCompanyStock(productId) {
    const byBranch = {};
    let total = 0;
    this.data.branches.forEach((b) => {
      const inv = this.data.inventory.find((i) => i.branchId === b.id && i.productId === productId);
      const q = inv ? inv.quantity : 0;
      byBranch[b.id] = q;
      total += q;
    });
    return { total, byBranch };
  }
  // STOCK ADDITION (Owner / Stock Manager)
  addStock(params) {
    if (params.quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }
    this.beginTransaction();
    try {
      const product = this.getProductById(params.productId);
      if (!product) throw new Error("Product not found");
      const branch = this.getBranchById(params.branchId);
      if (!branch) throw new Error("Branch not found");
      let inv = this.data.inventory.find((i) => i.branchId === params.branchId && i.productId === params.productId);
      const oldStock = inv ? inv.quantity : 0;
      const newStock = oldStock + params.quantity;
      const now = /* @__PURE__ */ new Date();
      if (inv) {
        inv.quantity = newStock;
        inv.lastUpdated = now.toISOString();
        if (params.batchNumber) inv.batchNumber = params.batchNumber;
        if (params.expiryDate) inv.expiryDate = params.expiryDate;
      } else {
        inv = {
          branchId: params.branchId,
          productId: params.productId,
          quantity: newStock,
          batchNumber: params.batchNumber,
          expiryDate: params.expiryDate,
          lastUpdated: now.toISOString()
        };
        this.data.inventory.push(inv);
      }
      if (params.purchasePrice && params.purchasePrice > 0) {
        product.purchasePrice = params.purchasePrice;
        product.costPrice = params.purchasePrice;
      }
      if (params.sellingPrice && params.sellingPrice > 0) {
        product.sellingPrice = params.sellingPrice;
        if (params.sellingPrice > product.mrp) {
          product.mrp = params.sellingPrice;
        }
      }
      if (params.supplierName && params.supplierName.trim()) {
        product.supplierName = params.supplierName.trim();
      }
      if (params.batchNumber) {
        product.batchNumber = params.batchNumber;
      }
      if (params.expiryDate) {
        product.expiryDate = params.expiryDate;
      }
      const movement = {
        id: `sm-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        branchId: branch.id,
        branchName: branch.name,
        previousQuantity: oldStock,
        quantityAdded: params.quantity,
        quantityRemoved: 0,
        newQuantity: newStock,
        operationType: "STOCK ADDED",
        reason: params.notes || (params.purchaseBillNumber ? `Stock received from invoice #${params.purchaseBillNumber}` : "Direct stock inward by stock manager"),
        referenceNumber: params.purchaseBillNumber ? `INV-${params.purchaseBillNumber}` : `STK-IN-${Date.now().toString().slice(-6)}`,
        purchaseBillNumber: params.purchaseBillNumber,
        batchNumber: params.batchNumber,
        expiryDate: params.expiryDate,
        userName: params.user?.name || "Stock Manager",
        userRole: params.user?.role || "OWNER",
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString(),
        timestamp: now.getTime()
      };
      this.data.stockMovements.unshift(movement);
      this.commit();
      return { oldStock, addedStock: params.quantity, newStock, movement };
    } catch (err) {
      this.rollback();
      throw err;
    }
  }
  // STOCK ADDITION BY BARCODE (Key requirement for Stock Manager)
  addStockByBarcode(params) {
    if (!params.barcode || !params.barcode.trim()) {
      throw new Error("Barcode is required.");
    }
    const product = this.getProductByBarcode(params.barcode.trim());
    if (!product) {
      throw new Error(`Product not found for barcode: ${params.barcode}`);
    }
    const branchId = params.branchId || (params.user?.branchId ? params.user.branchId : this.data.branches[0].id);
    const result = this.addStock({
      productId: product.id,
      branchId,
      quantity: params.quantity,
      purchasePrice: params.purchasePrice,
      sellingPrice: params.sellingPrice,
      supplierName: params.supplierName,
      purchaseBillNumber: params.purchaseBillNumber,
      batchNumber: params.batchNumber,
      expiryDate: params.expiryDate,
      notes: params.notes,
      user: params.user
    });
    return {
      product,
      ...result
    };
  }
  // CSV / EXCEL BULK INVENTORY IMPORT
  bulkImportInventoryCsv(params) {
    const branch = this.getBranchById(params.branchId) || this.data.branches[0];
    let updatedProductsCount = 0;
    let createdProductsCount = 0;
    let totalUnitsAdded = 0;
    const results = [];
    this.beginTransaction();
    try {
      for (const item of params.items) {
        const cleanBarcode = (item.barcode || "").trim();
        const qty = Math.max(0, Number(item.quantity) || 0);
        if (!cleanBarcode && !item.productName) continue;
        let product = cleanBarcode ? this.getProductByBarcode(cleanBarcode) : void 0;
        if (product) {
          const inv = this.data.inventory.find((i) => i.branchId === branch.id && i.productId === product.id);
          const oldStock = inv ? inv.quantity : 0;
          const newStock = oldStock + qty;
          if (inv) {
            inv.quantity = newStock;
            inv.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
          } else {
            this.data.inventory.push({
              branchId: branch.id,
              productId: product.id,
              quantity: newStock,
              lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          if (item.purchasePrice && item.purchasePrice > 0) {
            product.purchasePrice = item.purchasePrice;
            product.costPrice = item.purchasePrice;
          }
          if (item.sellingPrice && item.sellingPrice > 0) {
            product.sellingPrice = item.sellingPrice;
            if (item.sellingPrice > product.mrp) product.mrp = item.sellingPrice;
          }
          if (item.company && !product.company) product.company = item.company;
          if (item.animal && !product.animal) product.animal = item.animal;
          if (item.size && !product.size) product.size = item.size;
          if (qty > 0) {
            this.data.stockMovements.unshift({
              id: `sm-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              branchId: branch.id,
              branchName: branch.name,
              previousQuantity: oldStock,
              quantityAdded: qty,
              quantityRemoved: 0,
              newQuantity: newStock,
              operationType: "STOCK ADDED",
              reason: item.invoiceNumber ? `CSV Import - Invoice #${item.invoiceNumber}` : "CSV Bulk Inventory Import",
              referenceNumber: item.invoiceNumber ? `INV-${item.invoiceNumber}` : `CSV-IMP-${Date.now().toString().slice(-6)}`,
              userName: params.user?.name || "Stock Manager",
              userRole: params.user?.role || "OWNER",
              date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
              time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
              timestamp: Date.now()
            });
          }
          updatedProductsCount++;
          totalUnitsAdded += qty;
          results.push({
            barcode: cleanBarcode,
            productName: product.name,
            status: "UPDATED",
            oldStock,
            newStock
          });
        } else {
          const id = `prod-${String(this.data.products.length + 1).padStart(3, "0")}`;
          const pForm = item.type && (item.type.toLowerCase().includes("wet") || item.type.toLowerCase().includes("can")) ? "WET" : "DRIED";
          const newProd = {
            id,
            sku: `SKU-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
            barcode: cleanBarcode || `${Date.now()}`,
            name: item.productName || "Imported Product",
            category: item.animal === "Cat" ? "Cat Food" : "Dog Food",
            brand: item.company || "Generic",
            company: item.company || "Generic",
            productForm: pForm,
            animal: item.animal || "Dog",
            lifeStage: item.age || "Adult",
            size: item.size || "Standard",
            unit: "packet",
            purchasePrice: Number(item.purchasePrice) || 500,
            costPrice: Number(item.purchasePrice) || 500,
            sellingPrice: Number(item.sellingPrice) || (Number(item.purchasePrice) ? Math.round(Number(item.purchasePrice) * 1.3) : 650),
            mrp: Number(item.sellingPrice) || 700,
            taxPercent: 18,
            minStockLevel: 5,
            reorderLevel: 10,
            supplierId: "sup-001",
            supplierName: item.supplierName || "Default Supplier",
            avatarType: item.animal && item.animal.toLowerCase() === "cat" ? "cat" : "dog",
            status: "ACTIVE"
          };
          this.data.products.push(newProd);
          if (newProd.barcode) {
            this.barcodeIndex.set(newProd.barcode.toLowerCase(), newProd);
          }
          this.data.branches.forEach((b) => {
            const isTarget = b.id === branch.id;
            this.data.inventory.push({
              branchId: b.id,
              productId: id,
              quantity: isTarget ? qty : 0,
              lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
            });
          });
          if (qty > 0) {
            this.data.stockMovements.unshift({
              id: `sm-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
              productId: newProd.id,
              productName: newProd.name,
              sku: newProd.sku,
              branchId: branch.id,
              branchName: branch.name,
              previousQuantity: 0,
              quantityAdded: qty,
              quantityRemoved: 0,
              newQuantity: qty,
              operationType: "STOCK ADDED",
              reason: "New product created via CSV Import",
              referenceNumber: `CSV-NEW-${Date.now().toString().slice(-6)}`,
              userName: params.user?.name || "Stock Manager",
              userRole: params.user?.role || "OWNER",
              date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
              time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
              timestamp: Date.now()
            });
          }
          createdProductsCount++;
          totalUnitsAdded += qty;
          results.push({
            barcode: cleanBarcode,
            productName: newProd.name,
            status: "CREATED",
            oldStock: 0,
            newStock: qty
          });
        }
      }
      this.commit();
      return {
        updatedProductsCount,
        createdProductsCount,
        totalUnitsAdded,
        results
      };
    } catch (err) {
      this.rollback();
      throw err;
    }
  }
  // STOCK ADJUSTMENT (Owner only)
  adjustStock(params) {
    if (params.user.role !== "OWNER") {
      throw new Error("Unauthorized: Only Owner / Admin can adjust stock.");
    }
    if (!params.reason || params.reason.trim().length < 3) {
      throw new Error("A detailed reason is required for any manual stock adjustment.");
    }
    if (params.newQuantity < 0) {
      throw new Error("Stock quantity cannot be negative.");
    }
    this.beginTransaction();
    try {
      const product = this.getProductById(params.productId);
      if (!product) throw new Error("Product not found");
      const branch = this.getBranchById(params.branchId);
      if (!branch) throw new Error("Branch not found");
      let inv = this.data.inventory.find((i) => i.branchId === params.branchId && i.productId === params.productId);
      const oldStock = inv ? inv.quantity : 0;
      const diff = params.newQuantity - oldStock;
      const now = /* @__PURE__ */ new Date();
      if (inv) {
        inv.quantity = params.newQuantity;
        inv.lastUpdated = now.toISOString();
      } else {
        inv = {
          branchId: params.branchId,
          productId: params.productId,
          quantity: params.newQuantity,
          lastUpdated: now.toISOString()
        };
        this.data.inventory.push(inv);
      }
      const movement = {
        id: `sm-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        branchId: branch.id,
        branchName: branch.name,
        previousQuantity: oldStock,
        quantityAdded: diff > 0 ? diff : 0,
        quantityRemoved: diff < 0 ? Math.abs(diff) : 0,
        newQuantity: params.newQuantity,
        operationType: "STOCK ADJUSTED",
        reason: params.reason,
        referenceNumber: `ADJ-${Date.now().toString().slice(-6)}`,
        userName: params.user.name,
        userRole: params.user.role,
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString(),
        timestamp: now.getTime()
      };
      this.data.stockMovements.unshift(movement);
      this.commit();
      return { oldStock, newStock: params.newQuantity, movement };
    } catch (err) {
      this.rollback();
      throw err;
    }
  }
  // INTER-BRANCH STOCK TRANSFER (Owner only)
  transferStock(params) {
    if (params.user.role !== "OWNER") {
      throw new Error("Unauthorized: Only Owner / Admin can transfer stock between branches.");
    }
    if (params.fromBranchId === params.toBranchId) {
      throw new Error("Source and destination branches cannot be the same.");
    }
    if (params.quantity <= 0) {
      throw new Error("Transfer quantity must be greater than zero.");
    }
    this.beginTransaction();
    try {
      const product = this.getProductById(params.productId);
      if (!product) throw new Error("Product not found");
      const fromBranch = this.getBranchById(params.fromBranchId);
      const toBranch = this.getBranchById(params.toBranchId);
      if (!fromBranch || !toBranch) throw new Error("Invalid branch specified");
      const sourceInv = this.data.inventory.find((i) => i.branchId === params.fromBranchId && i.productId === params.productId);
      const sourceStock = sourceInv ? sourceInv.quantity : 0;
      if (sourceStock < params.quantity) {
        throw new Error(`Insufficient stock in ${fromBranch.name}. Available: ${sourceStock}, Requested: ${params.quantity}`);
      }
      let destInv = this.data.inventory.find((i) => i.branchId === params.toBranchId && i.productId === params.productId);
      const destOldStock = destInv ? destInv.quantity : 0;
      const now = /* @__PURE__ */ new Date();
      const transferRef = `TRF-${Date.now().toString().slice(-6)}`;
      sourceInv.quantity = sourceStock - params.quantity;
      sourceInv.lastUpdated = now.toISOString();
      if (destInv) {
        destInv.quantity = destOldStock + params.quantity;
        destInv.lastUpdated = now.toISOString();
      } else {
        destInv = {
          branchId: params.toBranchId,
          productId: params.productId,
          quantity: destOldStock + params.quantity,
          lastUpdated: now.toISOString()
        };
        this.data.inventory.push(destInv);
      }
      this.data.stockMovements.unshift({
        id: `sm-${Date.now()}-out`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        branchId: fromBranch.id,
        branchName: fromBranch.name,
        previousQuantity: sourceStock,
        quantityAdded: 0,
        quantityRemoved: params.quantity,
        newQuantity: sourceInv.quantity,
        operationType: "STOCK TRANSFERRED",
        reason: `Transfer out to ${toBranch.name}. Note: ${params.reason || "Inventory rebalance"}`,
        referenceNumber: transferRef,
        userName: params.user.name,
        userRole: params.user.role,
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString(),
        timestamp: now.getTime()
      });
      this.data.stockMovements.unshift({
        id: `sm-${Date.now()}-in`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        branchId: toBranch.id,
        branchName: toBranch.name,
        previousQuantity: destOldStock,
        quantityAdded: params.quantity,
        quantityRemoved: 0,
        newQuantity: destInv.quantity,
        operationType: "STOCK TRANSFERRED",
        reason: `Transfer in from ${fromBranch.name}. Note: ${params.reason || "Inventory rebalance"}`,
        referenceNumber: transferRef,
        userName: params.user.name,
        userRole: params.user.role,
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString(),
        timestamp: now.getTime() + 1
      });
      this.commit();
      return {
        transferId: transferRef,
        sourceStock: sourceInv.quantity,
        destinationStock: destInv.quantity
      };
    } catch (err) {
      this.rollback();
      throw err;
    }
  }
  // PURCHASE ALLOCATION (Major Feature)
  allocatePurchaseStock(params) {
    if (params.user.role !== "OWNER") {
      throw new Error("Unauthorized: Only Owner can allocate purchase stock.");
    }
    this.beginTransaction();
    try {
      const purchase = this.data.purchases.find((p) => p.id === params.purchaseId);
      if (!purchase) throw new Error("Purchase record not found");
      const item = purchase.items.find((i) => i.productId === params.productId);
      if (!item) throw new Error("Product not found in this purchase record");
      const totalAllocated = params.allocations.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
      if (totalAllocated > item.quantity) {
        throw new Error(
          `Allocation error: Total allocated quantity (${totalAllocated}) cannot exceed purchased quantity (${item.quantity}). Remaining unallocated: ${Math.max(0, item.quantity - totalAllocated)}`
        );
      }
      const now = /* @__PURE__ */ new Date();
      const allocationBranchItems = [];
      params.allocations.forEach((alloc) => {
        const qty = Number(alloc.quantity) || 0;
        if (qty <= 0) return;
        const branch = this.getBranchById(alloc.branchId);
        if (!branch) throw new Error(`Invalid branch: ${alloc.branchId}`);
        let inv = this.data.inventory.find((i) => i.branchId === alloc.branchId && i.productId === params.productId);
        const oldStock = inv ? inv.quantity : 0;
        const newStock = oldStock + qty;
        if (inv) {
          inv.quantity = newStock;
          inv.lastUpdated = now.toISOString();
        } else {
          inv = {
            branchId: alloc.branchId,
            productId: params.productId,
            quantity: newStock,
            lastUpdated: now.toISOString()
          };
          this.data.inventory.push(inv);
        }
        allocationBranchItems.push({
          branchId: branch.id,
          branchName: branch.name,
          allocatedQuantity: qty,
          previousStock: oldStock,
          newStock
        });
        this.data.stockMovements.unshift({
          id: `sm-${Date.now()}-${branch.id}`,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          branchId: branch.id,
          branchName: branch.name,
          previousQuantity: oldStock,
          quantityAdded: qty,
          quantityRemoved: 0,
          newQuantity: newStock,
          operationType: "STOCK ADDED",
          reason: `Purchase allocation from ${purchase.purchaseNumber}`,
          referenceNumber: purchase.purchaseNumber,
          userName: params.user.name,
          userRole: params.user.role,
          date: now.toISOString().split("T")[0],
          time: now.toLocaleTimeString(),
          timestamp: now.getTime()
        });
      });
      const allocRecord = {
        id: `alloc-${Date.now()}`,
        purchaseId: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        totalPurchased: item.quantity,
        allocations: allocationBranchItems,
        allocatedBy: params.user.name,
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString(),
        timestamp: now.getTime(),
        notes: params.notes
      };
      this.data.purchaseAllocations.unshift(allocRecord);
      if (totalAllocated >= item.quantity) {
        purchase.allocatedStatus = "FULLY_ALLOCATED";
      } else {
        purchase.allocatedStatus = "PARTIALLY_ALLOCATED";
      }
      this.commit();
      return allocRecord;
    } catch (err) {
      this.rollback();
      throw err;
    }
  }
  // REAL-TIME POS SALE (Transactional)
  createSale(params) {
    if (params.staffUser.role !== "OWNER" && params.staffUser.branchId !== params.branchId) {
      throw new Error(`Access denied. You are not authorized to process sales for branch ${params.branchId}.`);
    }
    if (!params.items || params.items.length === 0) {
      throw new Error("Cart is empty. Please add products to complete sale.");
    }
    this.beginTransaction();
    try {
      const branch = this.getBranchById(params.branchId);
      if (!branch) throw new Error("Branch not found");
      const saleItems = [];
      let subtotal = 0;
      let discountTotal = 0;
      let taxTotal = 0;
      for (const item of params.items) {
        if (item.quantity <= 0) {
          throw new Error("Item quantity must be greater than zero.");
        }
        const product = this.getProductById(item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found.`);
        const inv = this.data.inventory.find((i) => i.branchId === params.branchId && i.productId === item.productId);
        const availableStock = inv ? inv.quantity : 0;
        if (availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock available for "${product.name}". Required: ${item.quantity}, Current Available: ${availableStock}. Transaction cancelled; no stock was deducted.`
          );
        }
        const unitPrice = product.sellingPrice;
        const discount = item.discount || 0;
        const netUnitPrice = Math.max(0, unitPrice - discount);
        const lineTotal = netUnitPrice * item.quantity;
        const taxPercent = product.taxPercent || 18;
        const basePrice = lineTotal / (1 + taxPercent / 100);
        const lineTax = lineTotal - basePrice;
        subtotal += basePrice;
        discountTotal += discount * item.quantity;
        taxTotal += lineTax;
        saleItems.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unit: product.unit,
          quantity: item.quantity,
          unitPrice,
          discount,
          taxPercent,
          taxAmount: Number(lineTax.toFixed(2)),
          lineTotal: Number(lineTotal.toFixed(2)),
          totalPrice: Number(lineTotal.toFixed(2))
        });
      }
      const grandTotal = Math.round(saleItems.reduce((acc, item) => acc + item.lineTotal, 0));
      const now = /* @__PURE__ */ new Date();
      const invoiceNumber = `${this.data.settings.invoicePrefix || "PW-SAL-"}${Date.now().toString().slice(-8)}`;
      for (const item of saleItems) {
        const inv = this.data.inventory.find((i) => i.branchId === params.branchId && i.productId === item.productId);
        const previousQuantity = inv.quantity;
        const newQuantity = previousQuantity - item.quantity;
        inv.quantity = newQuantity;
        inv.lastUpdated = now.toISOString();
        this.data.stockMovements.unshift({
          id: `sm-${Date.now()}-${item.productId}`,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          branchId: branch.id,
          branchName: branch.name,
          previousQuantity,
          quantityAdded: 0,
          quantityRemoved: item.quantity,
          newQuantity,
          operationType: "STOCK SOLD",
          reason: `POS retail sale invoice #${invoiceNumber}`,
          referenceNumber: invoiceNumber,
          userName: params.staffUser.name,
          userRole: params.staffUser.role,
          date: now.toISOString().split("T")[0],
          time: now.toLocaleTimeString(),
          timestamp: now.getTime()
        });
      }
      const changeDue = params.cashReceived && params.cashReceived > grandTotal ? params.cashReceived - grandTotal : 0;
      const sale = {
        id: `sal-${Date.now()}`,
        invoiceNumber,
        branchId: branch.id,
        branchName: branch.name,
        branchAddress: branch.address,
        branchPhone: branch.phone,
        staffId: params.staffUser.id,
        staffName: params.staffUser.name,
        customerName: params.customerName || "Walk-in Customer",
        customerPhone: params.customerPhone,
        items: saleItems,
        subtotal: Number(subtotal.toFixed(2)),
        discountTotal: Number(discountTotal.toFixed(2)),
        taxTotal: Number(taxTotal.toFixed(2)),
        grandTotal,
        paymentMethod: params.paymentMethod,
        cashReceived: params.cashReceived,
        changeDue,
        status: "COMPLETED",
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString(),
        timestamp: now.getTime()
      };
      this.data.sales.unshift(sale);
      this.commit();
      return sale;
    } catch (err) {
      this.rollback();
      throw err;
    }
  }
  // SALE CANCELLATION (Reverses stock with audit history)
  cancelSale(saleId, reason, user) {
    this.beginTransaction();
    try {
      const sale = this.data.sales.find((s) => s.id === saleId);
      if (!sale) throw new Error("Sale not found");
      if (sale.status === "CANCELLED") throw new Error("Sale is already cancelled");
      if (user.role !== "OWNER" && (user.role !== "BRANCH_MANAGER" || user.branchId !== sale.branchId)) {
        throw new Error("Only the Owner or Branch Manager can cancel completed sales.");
      }
      const now = /* @__PURE__ */ new Date();
      sale.status = "CANCELLED";
      sale.cancelReason = reason;
      for (const item of sale.items) {
        let inv = this.data.inventory.find((i) => i.branchId === sale.branchId && i.productId === item.productId);
        const oldStock = inv ? inv.quantity : 0;
        const newStock = oldStock + item.quantity;
        if (inv) {
          inv.quantity = newStock;
          inv.lastUpdated = now.toISOString();
        } else {
          inv = {
            branchId: sale.branchId,
            productId: item.productId,
            quantity: newStock,
            lastUpdated: now.toISOString()
          };
          this.data.inventory.push(inv);
        }
        this.data.stockMovements.unshift({
          id: `sm-${Date.now()}-rev-${item.productId}`,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          branchId: sale.branchId,
          branchName: sale.branchName,
          previousQuantity: oldStock,
          quantityAdded: item.quantity,
          quantityRemoved: 0,
          newQuantity: newStock,
          operationType: "SALE CANCELLED",
          reason: `Cancelled invoice #${sale.invoiceNumber}. Reason: ${reason}`,
          referenceNumber: sale.invoiceNumber,
          userName: user.name,
          userRole: user.role,
          date: now.toISOString().split("T")[0],
          time: now.toLocaleTimeString(),
          timestamp: now.getTime()
        });
      }
      this.commit();
      return sale;
    } catch (err) {
      this.rollback();
      throw err;
    }
  }
  // Purchases & Bills
  getPurchases() {
    return this.data.purchases;
  }
  createPurchase(purchaseData) {
    const count = this.data.purchases.length + 1;
    const purchaseNumber = `PUR-2026-${String(count).padStart(5, "0")}`;
    const itemsWithCompany = (purchaseData.items || []).map((it) => {
      const prod = this.getProductById(it.productId);
      const itemCompany = it.company?.trim() || prod?.company || prod?.brand || purchaseData.company?.trim() || "General";
      if (prod && !prod.company && itemCompany && itemCompany !== "General") {
        prod.company = itemCompany;
      }
      return {
        ...it,
        company: itemCompany,
        brand: it.brand || prod?.brand || itemCompany
      };
    });
    const primaryCompany = purchaseData.company?.trim() || itemsWithCompany.find((i) => i.company && i.company !== "General")?.company || itemsWithCompany[0]?.company || "General";
    const newPurchase = {
      ...purchaseData,
      id: `pur-${Date.now()}`,
      purchaseNumber,
      company: primaryCompany,
      items: itemsWithCompany,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.purchases.unshift(newPurchase);
    this.persist();
    return newPurchase;
  }
  getPurchaseBills() {
    return this.data.purchaseBills;
  }
  createPurchaseBill(billData) {
    const newBill = {
      ...billData,
      id: `bill-${Date.now()}`
    };
    this.data.purchaseBills.unshift(newBill);
    this.persist();
    return newBill;
  }
  getPurchaseAllocations() {
    return this.data.purchaseAllocations;
  }
  // Stock Movements / Audit History
  getStockMovements(filters) {
    let list = this.data.stockMovements;
    if (!filters) return list;
    if (filters.branchId && filters.branchId !== "all") {
      list = list.filter((m) => m.branchId === filters.branchId);
    }
    if (filters.productId && filters.productId !== "all") {
      list = list.filter((m) => m.productId === filters.productId);
    }
    if (filters.operationType && filters.operationType !== "all") {
      list = list.filter((m) => m.operationType === filters.operationType);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (m) => m.productName.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q) || m.referenceNumber.toLowerCase().includes(q) || m.branchName.toLowerCase().includes(q) || m.userName.toLowerCase().includes(q)
      );
    }
    return list;
  }
  // Sales
  getSales(filters) {
    let list = this.data.sales;
    if (!filters) return list;
    if (filters.branchId && filters.branchId !== "all") {
      list = list.filter((s) => s.branchId === filters.branchId);
    }
    if (filters.staffId && filters.staffId !== "all") {
      list = list.filter((s) => s.staffId === filters.staffId);
    }
    if (filters.date) {
      list = list.filter((s) => s.date === filters.date);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) => s.invoiceNumber.toLowerCase().includes(q) || s.branchName.toLowerCase().includes(q) || s.customerName && s.customerName.toLowerCase().includes(q) || s.customerPhone && s.customerPhone.includes(q)
      );
    }
    return list;
  }
  // Staff
  getStaff() {
    return this.data.staff;
  }
  createStaff(staffData) {
    const branch = this.getBranchById(staffData.branchId);
    const code = `STF-${branch ? branch.code : "HQ"}-${String(this.data.staff.length + 1).padStart(2, "0")}`;
    const newStaff = {
      ...staffData,
      id: `staff-${Date.now()}`,
      staffCode: code,
      branchName: branch ? branch.name : ""
    };
    this.data.staff.push(newStaff);
    this.persist();
    return newStaff;
  }
  updateStaff(id, updates) {
    const staff = this.data.staff.find((s) => s.id === id);
    if (!staff) throw new Error("Staff not found");
    Object.assign(staff, updates);
    if (updates.branchId) {
      const b = this.getBranchById(updates.branchId);
      if (b) staff.branchName = b.name;
    }
    this.persist();
    return staff;
  }
  deleteStaff(id) {
    const index = this.data.staff.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Staff member not found");
    this.data.staff.splice(index, 1);
    this.persist();
  }
  // Attendance
  getAttendance(filters) {
    let list = this.data.attendance;
    if (!filters) return list;
    if (filters.branchId && filters.branchId !== "all") {
      list = list.filter((a) => a.branchId === filters.branchId);
    }
    if (filters.date) {
      list = list.filter((a) => a.date === filters.date);
    }
    return list;
  }
  checkIn(staffUser, remarks) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const existing = this.data.attendance.find((a) => a.staffId === staffUser.id && a.date === today);
    if (existing) {
      throw new Error(`You have already checked in today at ${existing.loginTime}`);
    }
    const staffMember = this.data.staff.find((s) => s.id === staffUser.id);
    const branch = staffUser.branchId ? this.getBranchById(staffUser.branchId) : void 0;
    const now = /* @__PURE__ */ new Date();
    const record = {
      id: `att-${Date.now()}`,
      date: today,
      staffId: staffUser.id,
      staffName: staffUser.name,
      branchId: staffUser.branchId || "",
      branchName: branch ? branch.name : "Head Office",
      loginTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "PRESENT",
      remarks
    };
    this.data.attendance.unshift(record);
    this.persist();
    return record;
  }
  checkOut(staffUser) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const existing = this.data.attendance.find((a) => a.staffId === staffUser.id && a.date === today);
    if (!existing) {
      throw new Error("No active check-in found for today.");
    }
    const now = /* @__PURE__ */ new Date();
    existing.logoutTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    this.persist();
    return existing;
  }
  updateAttendanceRecord(id, updates, correctedBy) {
    const record = this.data.attendance.find((a) => a.id === id);
    if (!record) throw new Error("Attendance record not found");
    Object.assign(record, updates);
    record.correctedBy = correctedBy;
    this.persist();
    return record;
  }
  upsertAttendanceRecord(params) {
    let record = this.data.attendance.find((a) => a.staffId === params.staffId && a.date === params.date);
    if (record) {
      if (params.status) record.status = params.status;
      if (params.checkInTime !== void 0) {
        record.checkInTime = params.checkInTime;
        record.loginTime = params.checkInTime || "-";
      }
      if (params.checkOutTime !== void 0) {
        record.checkOutTime = params.checkOutTime;
        record.logoutTime = params.checkOutTime || "-";
      }
      if (params.remarks !== void 0) record.remarks = params.remarks;
      if (params.correctedBy) record.correctedBy = params.correctedBy;
      if (params.branchId) record.branchId = params.branchId;
      if (params.branchName) record.branchName = params.branchName;
      this.persist();
      return record;
    }
    const staffMember = this.data.staff.find((s) => s.id === params.staffId);
    const branch = params.branchId || staffMember?.branchId ? this.getBranchById(params.branchId || staffMember.branchId) : void 0;
    const newRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: params.date,
      staffId: params.staffId,
      staffName: params.staffName || staffMember?.name || "Staff Member",
      branchId: params.branchId || staffMember?.branchId || "",
      branchName: params.branchName || branch?.name || staffMember?.branchName || "Headquarters",
      loginTime: params.checkInTime || (params.status === "PRESENT" ? "09:30 AM" : "-"),
      logoutTime: params.checkOutTime || (params.status === "PRESENT" ? "06:30 PM" : "-"),
      checkInTime: params.checkInTime,
      checkOutTime: params.checkOutTime,
      status: params.status || "PRESENT",
      remarks: params.remarks || "",
      correctedBy: params.correctedBy
    };
    this.data.attendance.unshift(newRecord);
    this.persist();
    return newRecord;
  }
  deleteAttendanceRecord(id) {
    const idx = this.data.attendance.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.data.attendance.splice(idx, 1);
      this.persist();
    }
  }
  // Salary & Mid-Month Advances
  getSalaries(month) {
    const advances = this.data.salaryAdvances || [];
    this.data.salaries.forEach((s) => {
      const sMonthClean = (s.month || "").toLowerCase();
      const staffAdvances = advances.filter(
        (a) => a.staffId === s.staffId && (a.month === s.month || sMonthClean.includes("sep") && a.month.toLowerCase().includes("sep") || sMonthClean.includes("aug") && a.month.toLowerCase().includes("aug") || sMonthClean.includes("jul") && a.month.toLowerCase().includes("jul"))
      );
      s.advances = staffAdvances;
      s.advance = staffAdvances.reduce((sum, a) => sum + a.amount, 0);
      s.netSalary = Math.max(0, s.basicSalary + s.allowances - s.deductions + s.bonus + s.overtime - s.advance);
    });
    if (month) {
      const cleanTarget = month.trim().toLowerCase();
      return this.data.salaries.filter((s) => {
        const sm = (s.month || "").trim().toLowerCase();
        return sm === cleanTarget || cleanTarget.includes("sep") && sm.includes("sep") || cleanTarget.includes("aug") && sm.includes("aug") || cleanTarget.includes("jul") && sm.includes("jul");
      });
    }
    return this.data.salaries;
  }
  getSalaryAdvances(filter) {
    let list = this.data.salaryAdvances || [];
    if (filter?.month) {
      const cleanMonth = filter.month.trim().toLowerCase();
      list = list.filter((a) => {
        const am = (a.month || "").trim().toLowerCase();
        return am === cleanMonth || cleanMonth.includes("sep") && am.includes("sep") || cleanMonth.includes("aug") && am.includes("aug") || cleanMonth.includes("jul") && am.includes("jul");
      });
    }
    if (filter?.staffId) {
      list = list.filter((a) => a.staffId === filter.staffId);
    }
    if (filter?.branchId && filter.branchId !== "ALL") {
      list = list.filter((a) => a.branchId === filter.branchId);
    }
    return list.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  addSalaryAdvance(data) {
    if (!this.data.salaryAdvances) {
      this.data.salaryAdvances = [];
    }
    const newAdvance = {
      ...data,
      id: `adv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      receiptNumber: data.receiptNumber || `ADV-${Date.now().toString().slice(-6)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.salaryAdvances.push(newAdvance);
    const targetMonth = newAdvance.month;
    const cleanMonth = targetMonth.toLowerCase();
    let salaryRec = this.data.salaries.find(
      (s) => s.staffId === newAdvance.staffId && (s.month === targetMonth || cleanMonth.includes("sep") && s.month.toLowerCase().includes("sep") || cleanMonth.includes("aug") && s.month.toLowerCase().includes("aug"))
    );
    if (!salaryRec) {
      const staffMember = this.data.staff.find((st) => st.id === newAdvance.staffId);
      const basicSalary = staffMember?.basicSalary || 25e3;
      const allowances = Math.round(basicSalary * 0.15);
      const deductions = Math.round(basicSalary * 0.05);
      salaryRec = {
        id: `sal-${Date.now().toString().slice(-4)}-${newAdvance.staffId}`,
        staffId: newAdvance.staffId,
        staffName: newAdvance.staffName,
        branchId: newAdvance.branchId,
        branchName: newAdvance.branchName,
        month: targetMonth,
        basicSalary,
        allowances,
        deductions,
        overtime: 0,
        bonus: 0,
        advance: 0,
        netSalary: basicSalary + allowances - deductions,
        paymentStatus: "PENDING",
        status: "PENDING"
      };
      this.data.salaries.push(salaryRec);
    }
    const staffAdvances = this.data.salaryAdvances.filter(
      (a) => a.staffId === salaryRec.staffId && (a.month === salaryRec.month || salaryRec.month.toLowerCase().includes("sep") && a.month.toLowerCase().includes("sep") || salaryRec.month.toLowerCase().includes("aug") && a.month.toLowerCase().includes("aug"))
    );
    salaryRec.advances = staffAdvances;
    salaryRec.advance = staffAdvances.reduce((sum, a) => sum + a.amount, 0);
    salaryRec.netSalary = Math.max(0, salaryRec.basicSalary + salaryRec.allowances - salaryRec.deductions + salaryRec.bonus + salaryRec.overtime - salaryRec.advance);
    this.persist();
    return { advance: newAdvance, updatedSalary: salaryRec };
  }
  deleteSalaryAdvance(id) {
    if (!this.data.salaryAdvances) return { success: false };
    const idx = this.data.salaryAdvances.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Salary advance record not found");
    const removed = this.data.salaryAdvances[idx];
    this.data.salaryAdvances.splice(idx, 1);
    const cleanMonth = removed.month.toLowerCase();
    const salaryRec = this.data.salaries.find(
      (s) => s.staffId === removed.staffId && (s.month === removed.month || cleanMonth.includes("sep") && s.month.toLowerCase().includes("sep") || cleanMonth.includes("aug") && s.month.toLowerCase().includes("aug"))
    );
    if (salaryRec) {
      const staffAdvances = this.data.salaryAdvances.filter(
        (a) => a.staffId === salaryRec.staffId && (a.month === salaryRec.month || salaryRec.month.toLowerCase().includes("sep") && a.month.toLowerCase().includes("sep") || salaryRec.month.toLowerCase().includes("aug") && a.month.toLowerCase().includes("aug"))
      );
      salaryRec.advances = staffAdvances;
      salaryRec.advance = staffAdvances.reduce((sum, a) => sum + a.amount, 0);
      salaryRec.netSalary = Math.max(0, salaryRec.basicSalary + salaryRec.allowances - salaryRec.deductions + salaryRec.bonus + salaryRec.overtime - salaryRec.advance);
    }
    this.persist();
    return { success: true, updatedSalary: salaryRec };
  }
  updateSalaryRecord(id, updates) {
    const record = this.data.salaries.find((s) => s.id === id);
    if (!record) throw new Error("Salary record not found");
    Object.assign(record, updates);
    record.netSalary = Math.max(0, record.basicSalary + record.allowances - record.deductions + record.bonus + record.overtime - record.advance);
    this.persist();
    return record;
  }
  paySalary(id, paymentMode) {
    const record = this.data.salaries.find((s) => s.id === id);
    if (!record) throw new Error("Salary record not found");
    record.status = "PAID";
    record.paymentStatus = "PAID";
    record.paymentDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    record.paymentMode = paymentMode || "Bank Transfer";
    this.persist();
    return record;
  }
  // Suppliers
  getSuppliers() {
    return this.data.suppliers;
  }
  createSupplier(supplierData) {
    const newSupplier = {
      ...supplierData,
      id: `sup-${Date.now()}`
    };
    this.data.suppliers.push(newSupplier);
    this.persist();
    return newSupplier;
  }
  // Notifications
  getNotifications() {
    return this.data.notifications;
  }
  markNotificationAsRead(id) {
    const n = this.data.notifications.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      this.persist();
    }
  }
  markAllNotificationsAsRead() {
    this.data.notifications.forEach((n) => n.isRead = true);
    this.persist();
  }
  // Settings
  getSettings() {
    if (!this.data.settings) {
      this.data.settings = { ...INITIAL_SETTINGS };
      this.persist();
    }
    return this.data.settings;
  }
  updateSettings(updates) {
    if (!this.data.settings) {
      this.data.settings = { ...INITIAL_SETTINGS };
    }
    Object.assign(this.data.settings, updates);
    this.persist();
    return this.data.settings;
  }
  deleteSale(id) {
    this.data.sales = this.data.sales.filter((s) => s.id !== id);
    this.persist();
  }
  deleteSalaryRecord(id) {
    this.data.salaries = this.data.salaries.filter((s) => s.id !== id);
    this.persist();
  }
  deletePurchaseAllocation(id) {
    this.data.purchaseAllocations = (this.data.purchaseAllocations || []).filter((a) => a.id !== id);
    this.persist();
  }
  deletePurchase(id) {
    this.data.purchases = this.data.purchases.filter((p) => p.id !== id);
    this.persist();
  }
  // Consolidated Analytics & Reports
  getCompanyReport() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const branchSummaries = this.data.branches.map((b) => {
      const branchSales = this.data.sales.filter((s) => s.branchId === b.id && s.status === "COMPLETED");
      const todaySales = branchSales.filter((s) => s.date === today);
      const totalSalesRevenue = branchSales.reduce((acc, s) => acc + s.grandTotal, 0);
      const todaySalesRevenue = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);
      let branchStockValue = 0;
      let totalStockUnits = 0;
      let lowStockCount = 0;
      this.data.products.forEach((p) => {
        const inv = this.data.inventory.find((i) => i.branchId === b.id && i.productId === p.id);
        const qty = inv ? inv.quantity : 0;
        totalStockUnits += qty;
        branchStockValue += qty * p.sellingPrice;
        if (qty <= p.reorderLevel) lowStockCount++;
      });
      const staffCount = this.data.staff.filter((s) => s.branchId === b.id && s.status === "ACTIVE").length;
      return {
        branch: b,
        stockValue: branchStockValue,
        totalStockUnits,
        todaySales: todaySalesRevenue,
        todayTransactions: todaySales.length,
        totalSales: totalSalesRevenue,
        lowStockCount,
        staffCount
      };
    });
    const totalCompanyStockUnits = branchSummaries.reduce((acc, b) => acc + b.totalStockUnits, 0);
    const totalCompanyStockValue = branchSummaries.reduce((acc, b) => acc + b.stockValue, 0);
    const todayCompanySales = branchSummaries.reduce((acc, b) => acc + b.todaySales, 0);
    const totalCompanySales = branchSummaries.reduce((acc, b) => acc + b.totalSales, 0);
    const totalPurchasesAmount = this.data.purchases.reduce((acc, p) => acc + p.grandTotal, 0);
    return {
      totalCompanyStockUnits,
      totalCompanyStockValue,
      todayCompanySales,
      totalCompanySales,
      totalPurchasesAmount,
      totalStaffCount: this.data.staff.length,
      branchSummaries,
      recentMovements: this.data.stockMovements.slice(0, 10),
      recentSales: this.data.sales.slice(0, 10),
      recentPurchases: this.data.purchases.slice(0, 5)
    };
  }
};
var db = new PetWorldDatabase();

// api/expressServer.ts
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var isVercelEnv2 = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV) || Boolean(process.env.VERCEL_REGION) || Boolean(process.env.NOW_REGION) || Boolean(process.env.LAMBDA_TASK_ROOT) || process.cwd().startsWith("/var/task");
var baseDataDir = process.env.DATA_DIR || (isVercelEnv2 ? "/tmp" : process.cwd());
var uploadsDir = path2.join(baseDataDir, "uploads");
try {
  if (!fs2.existsSync(uploadsDir)) {
    fs2.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.warn("Uploads directory initialization skipped:", err);
}
app.use("/uploads", express.static(uploadsDir));
app.use((req, res, next) => {
  const originalUrl = req.headers["x-forwarded-uri"] || req.headers["x-rewrite-url"];
  if (originalUrl) {
    req.url = originalUrl;
  }
  next();
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id, x-user-role, x-user-branch-id");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
function getRequestUser(req) {
  const userId = req.headers["x-user-id"];
  const userRole = req.headers["x-user-role"];
  const userBranchId = req.headers["x-user-branch-id"];
  if (userId === OWNER_USER.id || userRole === "OWNER" || !userId && !userRole) {
    return OWNER_USER;
  }
  const staff = db.getStaff().find((s) => s.id === userId || s.username === userId);
  if (staff) {
    return {
      id: staff.id,
      username: staff.username,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      branchId: staff.branchId,
      avatarType: staff.avatarType,
      designation: staff.designation,
      status: staff.status
    };
  }
  return OWNER_USER;
}
var sseClients = [];
function notifyClients(eventType = "DATA_UPDATED") {
  const payload = `data: ${JSON.stringify({ type: eventType, timestamp: (/* @__PURE__ */ new Date()).toISOString() })}

`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
    }
  });
}
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (res.flushHeaders) res.flushHeaders();
  res.write(": connected\n\n");
  const isVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
  if (isVercel) {
    return res.end();
  }
  sseClients.push(res);
  req.on("close", () => {
    sseClients = sseClients.filter((c) => c !== res);
  });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/bootstrap", (req, res) => {
  try {
    const user = getRequestUser(req);
    const branches = db.getBranches();
    const products = db.getProducts();
    const rawInventory = db.getInventory();
    const branchMap = new Map(branches.map((b) => [b.id, b.name]));
    const productMap = new Map(products.map((p) => [p.id, p]));
    const inventory = rawInventory.map((inv) => {
      const prod = productMap.get(inv.productId);
      return {
        ...inv,
        id: `inv-${inv.branchId}-${inv.productId}`,
        branchName: branchMap.get(inv.branchId) || inv.branchId,
        productName: prod ? prod.name : "Unknown Product",
        sku: prod ? prod.sku : "",
        company: prod ? prod.company || prod.brand : "",
        brand: prod ? prod.brand : "",
        productForm: prod ? prod.productForm : "OTHER",
        imageUrl: prod ? prod.imageUrl : void 0
      };
    });
    const isOwner = user.role === "OWNER";
    const filterBranchId = isOwner ? void 0 : user.branchId;
    const sales = db.getSales(filterBranchId ? { branchId: filterBranchId } : void 0);
    const purchases = db.getPurchases();
    const purchaseBills = db.getPurchaseBills();
    const staff = db.getStaff();
    const attendance = db.getAttendance(filterBranchId ? { branchId: filterBranchId } : void 0);
    const salaries = db.getSalaries();
    const salaryAdvances = db.getSalaryAdvances();
    const stockHistory = db.getStockMovements(filterBranchId ? { branchId: filterBranchId } : void 0);
    const purchaseAllocations = db.getPurchaseAllocations();
    const suppliers = db.getSuppliers();
    const notifications = db.getNotifications();
    const settings = db.getSettings();
    res.json({
      branches,
      products,
      inventory,
      sales,
      purchases,
      purchaseBills,
      purchaseAllocations,
      staff,
      attendance,
      salaries,
      salaryAdvances,
      stockHistory,
      suppliers,
      notifications,
      settings
    });
  } catch (err) {
    console.error("Error in bootstrap:", err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/login", (req, res) => {
  const { username, password, scope, branchId, staffId } = req.body || {};
  if (scope === "OWNER" || branchId === "OWNER" || !username && !staffId && scope === "owner") {
    return res.json({ user: OWNER_USER, token: "token-owner-001" });
  }
  if (branchId && branchId !== "OWNER") {
    const branchStaff = db.getStaff().filter((s) => s.branchId === branchId);
    let staff2 = staffId ? branchStaff.find((s) => s.id === staffId || s.username === staffId) : null;
    if (!staff2) {
      staff2 = branchStaff.find((s) => s.role === "CASHIER") || branchStaff[0];
    }
    if (staff2) {
      const user = {
        id: staff2.id,
        username: staff2.username,
        name: staff2.name,
        email: staff2.email,
        phone: staff2.phone,
        role: staff2.role,
        branchId: staff2.branchId,
        avatarType: staff2.avatarType,
        designation: staff2.designation,
        status: staff2.status
      };
      return res.json({ user, token: `token-staff-${staff2.id}` });
    }
  }
  if (!username) {
    return res.status(400).json({ error: "Please select a branch or enter your username" });
  }
  const cleanUser = String(username).trim().toLowerCase();
  if (cleanUser === "owner" || cleanUser === "admin") {
    return res.json({ user: OWNER_USER, token: "token-owner-001" });
  }
  const staff = db.getStaff().find((s) => s.username.toLowerCase() === cleanUser);
  if (staff) {
    const user = {
      id: staff.id,
      username: staff.username,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      branchId: staff.branchId,
      avatarType: staff.avatarType,
      designation: staff.designation,
      status: staff.status
    };
    return res.json({ user, token: `token-staff-${staff.id}` });
  }
  return res.status(401).json({ error: "Invalid credentials. Select a branch/owner or use a valid username." });
});
app.get("/api/auth/demo-users", (req, res) => {
  const allStaff = db.getStaff();
  const demoUsers = [
    {
      id: OWNER_USER.id,
      name: OWNER_USER.name,
      username: OWNER_USER.username,
      role: "OWNER",
      designation: OWNER_USER.designation,
      branchName: "All Branches (Super Admin)",
      avatarType: OWNER_USER.avatarType
    },
    ...allStaff.map((s) => ({
      id: s.id,
      name: s.name,
      username: s.username,
      role: s.role,
      designation: s.designation,
      branchId: s.branchId,
      branchName: s.branchName,
      avatarType: s.avatarType
    }))
  ];
  res.json(demoUsers);
});
app.get("/api/branches", (req, res) => {
  res.json(db.getBranches());
});
app.post("/api/branches", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can create branches." });
    }
    const created = db.createBranch(req.body);
    notifyClients("BRANCH_CREATED");
    res.json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.put("/api/branches/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can update branch settings." });
    }
    const updated = db.updateBranch(req.params.id, req.body);
    notifyClients("BRANCH_UPDATED");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var UPLOADS_DIR = path2.join(process.cwd(), "uploads");
if (!fs2.existsSync(UPLOADS_DIR)) {
  fs2.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));
app.post("/api/upload-image", (req, res) => {
  try {
    const { image, fileName } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }
    if (image.startsWith("data:image/")) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
        const base64Data = matches[2];
        const safeName = (fileName || "product").toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 30);
        const savedFileName = `${Date.now()}-${safeName}.${ext}`;
        const filePath = path2.join(UPLOADS_DIR, savedFileName);
        fs2.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
        return res.json({ url: `/uploads/${savedFileName}` });
      }
    }
    return res.json({ url: image });
  } catch (err) {
    console.error("Upload image error:", err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/products", (req, res) => {
  res.json(db.getProducts());
});
app.get("/api/products/barcode/:barcode", (req, res) => {
  try {
    const { barcode } = req.params;
    const product = db.getProductByBarcode(barcode);
    if (!product) {
      return res.status(404).json({ error: "Product not found", barcode });
    }
    const companyStock = db.getProductCompanyStock(product.id);
    res.json({
      product,
      totalStock: companyStock.total,
      branchStock: companyStock.byBranch
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/products", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER" && user.role !== "BRANCH_MANAGER") {
      return res.status(403).json({ error: "Only Owner / Stock Manager can add new products." });
    }
    const created = db.createProduct(req.body);
    notifyClients("PRODUCT_CREATED");
    res.json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.put("/api/products/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER" && user.role !== "BRANCH_MANAGER") {
      return res.status(403).json({ error: "Only Owner / Stock Manager can update products." });
    }
    const updated = db.updateProduct(req.params.id, req.body);
    notifyClients("PRODUCT_UPDATED");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/inventory", (req, res) => {
  res.json(db.getInventory());
});
app.get("/api/inventory/branch/:branchId", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER" && user.branchId && user.branchId !== req.params.branchId) {
      return res.status(403).json({ error: "Access denied: You can only view your assigned branch inventory." });
    }
    const branchStock = db.getBranchInventory(req.params.branchId);
    res.json(branchStock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var handleInwardStock = (req, res) => {
  try {
    const user = getRequestUser(req);
    const {
      productId,
      barcode,
      branchId,
      quantity,
      purchasePrice,
      sellingPrice,
      supplierName,
      purchaseBillNumber,
      invoiceNumber,
      batchNumber,
      expiryDate,
      notes
    } = req.body;
    const effectiveInvoice = invoiceNumber || purchaseBillNumber;
    const effectiveBranch = branchId || (user.branchId ? user.branchId : db.getBranches()[0]?.id || "branch-1");
    if (barcode && !productId) {
      const result2 = db.addStockByBarcode({
        barcode,
        branchId: effectiveBranch,
        quantity: Number(quantity),
        purchasePrice: purchasePrice ? Number(purchasePrice) : void 0,
        sellingPrice: sellingPrice ? Number(sellingPrice) : void 0,
        supplierName,
        purchaseBillNumber: effectiveInvoice,
        batchNumber,
        expiryDate,
        notes,
        user
      });
      notifyClients("STOCK_UPDATED");
      return res.json(result2);
    }
    if (!productId) {
      return res.status(400).json({ error: "Either productId or barcode must be provided." });
    }
    const result = db.addStock({
      productId,
      branchId: effectiveBranch,
      quantity: Number(quantity),
      purchasePrice: purchasePrice ? Number(purchasePrice) : void 0,
      sellingPrice: sellingPrice ? Number(sellingPrice) : void 0,
      supplierName,
      purchaseBillNumber: effectiveInvoice,
      batchNumber,
      expiryDate,
      notes,
      user
    });
    notifyClients("STOCK_UPDATED");
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
app.post("/api/inventory/add-stock", handleInwardStock);
app.post("/api/stock/inward", handleInwardStock);
app.post("/api/inventory/inward-by-barcode", handleInwardStock);
app.post("/api/inventory/import-csv", (req, res) => {
  try {
    const user = getRequestUser(req);
    const { items, branchId } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided for import." });
    }
    const targetBranch = branchId || (user.branchId ? user.branchId : db.getBranches()[0]?.id || "branch-1");
    const result = db.bulkImportInventoryCsv({
      items,
      branchId: targetBranch,
      user
    });
    notifyClients("STOCK_UPDATED");
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var handleStockAdjustment = (req, res) => {
  try {
    const user = getRequestUser(req);
    const { productId, branchId, newQuantity, reason } = req.body;
    const result = db.adjustStock({
      productId,
      branchId,
      newQuantity: Number(newQuantity),
      reason,
      user
    });
    notifyClients("STOCK_UPDATED");
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
app.post("/api/inventory/adjust-stock", handleStockAdjustment);
app.post("/api/stock/adjust", handleStockAdjustment);
var handleStockTransfer = (req, res) => {
  try {
    const user = getRequestUser(req);
    const { productId, fromBranchId, toBranchId, quantity, reason } = req.body;
    const result = db.transferStock({
      productId,
      fromBranchId,
      toBranchId,
      quantity: Number(quantity),
      reason,
      user
    });
    notifyClients("STOCK_UPDATED");
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
app.post("/api/inventory/transfer-stock", handleStockTransfer);
app.post("/api/stock/transfer", handleStockTransfer);
app.get("/api/stock-movements", (req, res) => {
  const { branchId, productId, operationType, search } = req.query;
  const user = getRequestUser(req);
  const effectiveBranch = user.role !== "OWNER" && user.branchId ? user.branchId : branchId;
  const movements = db.getStockMovements({
    branchId: effectiveBranch,
    productId,
    operationType,
    search
  });
  res.json(movements);
});
app.get("/api/purchases", (req, res) => {
  res.json(db.getPurchases());
});
app.post("/api/purchases", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can create purchase records." });
    }
    const purchase = db.createPurchase(req.body);
    if (req.body.supplierInvoiceNumber || req.body.billNumber) {
      try {
        db.createPurchaseBill({
          billNumber: req.body.supplierInvoiceNumber || req.body.billNumber,
          purchaseId: purchase.id,
          purchaseReference: purchase.purchaseNumber,
          supplierId: purchase.supplierId,
          supplierName: purchase.supplierName,
          invoiceDate: purchase.purchaseDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          invoiceAmount: purchase.grandTotal || 0,
          paymentStatus: purchase.paymentStatus || "PENDING",
          fileName: req.body.fileName,
          fileUrl: req.body.fileUrl,
          notes: req.body.notes
        });
      } catch (billErr) {
        console.warn("Failed to auto-create linked purchase bill:", billErr);
      }
    }
    notifyClients("PURCHASE_CREATED");
    res.json(purchase);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete("/api/purchases/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can delete purchase records." });
    }
    db.deletePurchase(req.params.id);
    notifyClients("PURCHASE_DELETED");
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/purchase-bills", (req, res) => {
  res.json(db.getPurchaseBills());
});
app.post("/api/purchase-bills", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can add purchase bills." });
    }
    const bill = db.createPurchaseBill(req.body);
    notifyClients("PURCHASE_BILL_CREATED");
    res.json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var handleStockAllocationRoute = (req, res) => {
  try {
    const user = getRequestUser(req);
    let { purchaseId, productId, allocations, notes } = req.body;
    if (allocations && !Array.isArray(allocations) && typeof allocations === "object") {
      allocations = Object.entries(allocations).map(([branchId, quantity]) => ({
        branchId,
        quantity: Number(quantity) || 0
      }));
    }
    const record = db.allocatePurchaseStock({
      purchaseId,
      productId,
      allocations,
      user,
      notes
    });
    notifyClients("STOCK_ALLOCATED");
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
app.post("/api/purchases/allocate", handleStockAllocationRoute);
app.post("/api/stock/allocate", handleStockAllocationRoute);
app.get("/api/purchase-allocations", (req, res) => {
  res.json(db.getPurchaseAllocations());
});
app.delete("/api/purchase-allocations/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can delete stock allocation records." });
    }
    db.deletePurchaseAllocation(req.params.id);
    notifyClients("STOCK_ALLOCATED");
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/sales", (req, res) => {
  const { branchId, staffId, date, search } = req.query;
  const user = getRequestUser(req);
  const effectiveBranch = user.role !== "OWNER" && user.branchId ? user.branchId : branchId;
  const sales = db.getSales({
    branchId: effectiveBranch,
    staffId,
    date,
    search
  });
  res.json(sales);
});
app.post("/api/sales", (req, res) => {
  try {
    const user = getRequestUser(req);
    const { branchId, customerName, customerPhone, items, paymentMethod, cashReceived } = req.body;
    const targetBranch = branchId || user.branchId;
    if (user.role !== "OWNER" && user.branchId && user.branchId !== targetBranch) {
      return res.status(403).json({ error: "Access denied: You cannot checkout sales for another branch." });
    }
    const sale = db.createSale({
      branchId: targetBranch,
      staffUser: user,
      customerName,
      customerPhone,
      items,
      paymentMethod,
      cashReceived: cashReceived ? Number(cashReceived) : void 0
    });
    notifyClients("SALE_COMPLETED");
    res.json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.post("/api/sales/:id/cancel", (req, res) => {
  try {
    const user = getRequestUser(req);
    const { reason } = req.body;
    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ error: "A valid cancellation reason is required." });
    }
    const cancelledSale = db.cancelSale(req.params.id, reason, user);
    notifyClients("SALE_CANCELLED");
    res.json(cancelledSale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete("/api/sales/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can delete sales records." });
    }
    db.deleteSale(req.params.id);
    notifyClients("SALE_DELETED");
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/staff", (req, res) => {
  res.json(db.getStaff());
});
app.post("/api/staff", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can register new staff." });
    }
    const staff = db.createStaff(req.body);
    notifyClients("STAFF_UPDATED");
    res.json(staff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.put("/api/staff/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can update staff profiles." });
    }
    const staff = db.updateStaff(req.params.id, req.body);
    notifyClients("STAFF_UPDATED");
    res.json(staff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete("/api/staff/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can delete staff members." });
    }
    db.deleteStaff(req.params.id);
    notifyClients("STAFF_UPDATED");
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/attendance", (req, res) => {
  const { branchId, date } = req.query;
  const user = getRequestUser(req);
  const effectiveBranch = user.role !== "OWNER" && user.branchId ? user.branchId : branchId;
  res.json(db.getAttendance({ branchId: effectiveBranch, date }));
});
app.post("/api/attendance/check-in", (req, res) => {
  try {
    const user = getRequestUser(req);
    const record = db.checkIn(user, req.body.remarks);
    notifyClients("ATTENDANCE_UPDATED");
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.post("/api/attendance/check-out", (req, res) => {
  try {
    const user = getRequestUser(req);
    const record = db.checkOut(user);
    notifyClients("ATTENDANCE_UPDATED");
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.put("/api/attendance/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can correct attendance records." });
    }
    const record = db.updateAttendanceRecord(req.params.id, req.body, user.name);
    notifyClients("ATTENDANCE_UPDATED");
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.put("/api/attendance/:id/correct", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can correct attendance records." });
    }
    const record = db.updateAttendanceRecord(req.params.id, req.body, user.name);
    notifyClients("ATTENDANCE_UPDATED");
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.post("/api/attendance/upsert", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can log or modify attendance records." });
    }
    const record = db.upsertAttendanceRecord({
      ...req.body,
      correctedBy: user.name
    });
    notifyClients("ATTENDANCE_UPDATED");
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete("/api/attendance/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can delete attendance records." });
    }
    db.deleteAttendanceRecord(req.params.id);
    notifyClients("ATTENDANCE_UPDATED");
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/salaries", (req, res) => {
  const { month } = req.query;
  const user = getRequestUser(req);
  if (user.role !== "OWNER") {
    const all = db.getSalaries(month);
    return res.json(all.filter((s) => s.staffId === user.id));
  }
  res.json(db.getSalaries(month));
});
app.put("/api/salaries/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can update salary records." });
    }
    const updated = db.updateSalaryRecord(req.params.id, req.body);
    notifyClients("SALARY_UPDATED");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.post("/api/salaries/:id/pay", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can disburse salary payments." });
    }
    const { paymentMode } = req.body;
    const paid = db.paySalary(req.params.id, paymentMode);
    notifyClients("SALARY_UPDATED");
    res.json(paid);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete("/api/salaries/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can delete salary records." });
    }
    db.deleteSalaryRecord(req.params.id);
    notifyClients("SALARY_UPDATED");
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/salaries/advances", (req, res) => {
  try {
    const user = getRequestUser(req);
    const { month, staffId, branchId } = req.query;
    if (user.role !== "OWNER") {
      return res.json(db.getSalaryAdvances({ month, staffId: user.id, branchId }));
    }
    res.json(db.getSalaryAdvances({ month, staffId, branchId }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.post("/api/salaries/advances", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner or Store Manager can record salary advances." });
    }
    const { staffId, staffName, branchId, branchName, month, date, amount, reason, notes, paymentMode, receiptNumber } = req.body;
    if (!staffId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Staff member and valid positive amount are required." });
    }
    const result = db.addSalaryAdvance({
      staffId,
      staffName: staffName || "Staff Member",
      branchId: branchId || "branch-1",
      branchName: branchName || "Main Store",
      month: month || "September 2026",
      date: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      amount: Number(amount),
      reason: reason || "Personal Expense",
      notes: notes || "",
      paymentMode: paymentMode || "Cash",
      approvedBy: user.name || "Owner",
      receiptNumber
    });
    notifyClients("SALARY_UPDATED");
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete("/api/salaries/advances/:id", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can delete salary advance entries." });
    }
    const result = db.deleteSalaryAdvance(req.params.id);
    notifyClients("SALARY_UPDATED");
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/suppliers", (req, res) => {
  res.json(db.getSuppliers());
});
app.post("/api/suppliers", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can add suppliers." });
    }
    const supplier = db.createSupplier(req.body);
    notifyClients("SUPPLIER_UPDATED");
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/notifications", (req, res) => {
  res.json(db.getNotifications());
});
app.post("/api/notifications/:id/read", (req, res) => {
  db.markNotificationAsRead(req.params.id);
  notifyClients("NOTIFICATION_UPDATED");
  res.json({ success: true });
});
app.post("/api/notifications/read-all", (req, res) => {
  db.markAllNotificationsAsRead();
  notifyClients("NOTIFICATION_UPDATED");
  res.json({ success: true });
});
app.get("/api/reports/company", (req, res) => {
  const user = getRequestUser(req);
  if (user.role !== "OWNER") {
    return res.status(403).json({ error: "Only Owner can view company consolidated analytics." });
  }
  res.json(db.getCompanyReport());
});
app.get("/api/settings", (req, res) => {
  res.json(db.getSettings());
});
app.put("/api/settings", (req, res) => {
  try {
    const user = getRequestUser(req);
    if (user.role !== "OWNER") {
      return res.status(403).json({ error: "Only Owner can edit company settings." });
    }
    const updated = db.updateSettings(req.body);
    notifyClients("SETTINGS_UPDATED");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.use("/api", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.originalUrl || req.url}` });
});
async function startServer() {
  const isVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV) || Boolean(process.env.VERCEL_REGION) || Boolean(process.env.NOW_REGION);
  if (isVercel) {
    return;
  }
  const distPath = path2.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || fs2.existsSync(distPath) && fs2.existsSync(path2.join(distPath, "index.html"));
  if (isProduction) {
    console.log("\u{1F4E6} Serving production build from dist/");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        return next();
      }
      res.sendFile(path2.join(distPath, "index.html"));
    });
  } else {
    console.log("\u26A1 Starting Vite development server middleware");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F43E} PET WORLD Server running on port ${PORT}`);
  });
}
var isVercelEnvironment = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV) || Boolean(process.env.VERCEL_REGION) || Boolean(process.env.NOW_REGION);
if (!isVercelEnvironment) {
  startServer();
}
function handler(req, res) {
  return app(req, res);
}
export {
  handler as default,
  notifyClients
};
//# sourceMappingURL=index.js.map
