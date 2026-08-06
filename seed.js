"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/marketplace';
const UserSchema = new mongoose_1.default.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },
    role: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Role' },
    status: { type: String, default: 'active' },
    companyName: String,
}, { timestamps: true });
const RoleSchema = new mongoose_1.default.Schema({
    name: String,
    permissions: [String],
});
const ProductSchema = new mongoose_1.default.Schema({
    name: String,
    category: String,
    fabricType: String,
    description: String,
    pricePerMeter: Number,
    moq: Number,
    stock: Number,
    colors: [{ name: String, hex: String, image: String }],
    swatch: String,
    image: String,
    supplier: String,
    featured: Boolean,
}, { timestamps: true });
const mockProducts = [
    {
        name: "Premium Combed Cotton",
        category: "Woven Cotton",
        fabricType: "Woven",
        description: "Soft, breathable 100% combed cotton ideal for shirting and premium apparel. Consistent weave and colorfast dyeing.",
        pricePerMeter: 4.5,
        moq: 200,
        stock: 8600,
        colors: [
            { name: "Pink", hex: "#fbcfe8", image: "/images/cotton_pink.png" },
            { name: "Lavender", hex: "#e9d5ff", image: "/images/cotton_lavender.png" },
            { name: "Green", hex: "#bbf7d0", image: "/images/cotton_green.png" },
        ],
        swatch: "#c7d2fe",
        image: "/images/cotton_lavender.png",
        supplier: "Diya Mendpara",
        featured: true,
    },
    {
        name: "Mulberry Silk Charmeuse",
        category: "Fine Silk",
        fabricType: "Woven",
        description: "Lustrous mulberry silk with a fluid drape and satin finish. Perfect for luxury garments and linings.",
        pricePerMeter: 18.0,
        moq: 100,
        stock: 1200,
        colors: [
            { name: "Pink", hex: "#fbcfe8", image: "/images/silk_pink.jpg" },
            { name: "Purple", hex: "#d8b4fe", image: "/images/silk_purple.jpg" },
            { name: "Gray", hex: "#d1d5db", image: "/images/silk_gray.jpg" },
        ],
        swatch: "#fbcfe8",
        image: "/images/silk.png",
        supplier: "Diya Mendpara",
        featured: true,
    },
    {
        name: "Heavyweight Selvedge Denim",
        category: "Raw Denim",
        fabricType: "Woven",
        description: "14oz selvedge denim with authentic slubby texture. Rope-dyed indigo for rich fades over time.",
        pricePerMeter: 9.75,
        moq: 300,
        stock: 5400,
        colors: [
            { name: "Raw Indigo", hex: "#3b4a6b", image: "/images/denim.png" },
            { name: "Sky", hex: "#bfdbfe", image: "/images/denim_sky.png" },
            { name: "Gray", hex: "#d1d5db", image: "/images/denim_gray.png" },
        ],
        swatch: "#93c5fd",
        image: "/images/denim.png",
        supplier: "Diya Mendpara",
        featured: true,
    },
    {
        name: "Belgian Washed Linen",
        category: "Premium Linen",
        fabricType: "Woven",
        description: "Pre-washed European flax linen with a relaxed hand-feel and natural slub. Breathable and durable.",
        pricePerMeter: 11.2,
        moq: 150,
        stock: 3100,
        colors: [
            { name: "Blue", hex: "#bfdbfe", image: "/images/linen_blue.png" },
            { name: "Green", hex: "#bbf7d0", image: "/images/linen_green.png" },
            { name: "Lavender", hex: "#e9d5ff", image: "/images/linen_lavender.png" },
        ],
        swatch: "#d9f99d",
        image: "/images/linen_green.png",
        supplier: "Diya Mendpara",
        featured: true,
    },
    {
        name: "Merino Wool Suiting",
        category: "Merino Wool",
        fabricType: "Woven",
        description: "Fine super 120s merino wool suiting with a smooth finish and excellent recovery. Mid-weight.",
        pricePerMeter: 22.5,
        moq: 80,
        stock: 900,
        colors: [
            { name: "Brown", hex: "#78350f", image: "/images/wool_brown.jpg" },
            { name: "Gray", hex: "#9ca3af", image: "/images/wool_gray.jpg" },
            { name: "Red", hex: "#ef4444", image: "/images/wool_red.jpg" },
        ],
        swatch: "#e5e7eb",
        image: "/images/wool_gray.jpg",
        supplier: "Diya Mendpara",
    },
    {
        name: "Soft Viscose Rayon",
        category: "Viscose Rayon",
        fabricType: "Woven",
        description: "Lightweight, breathable viscose rayon with a silky drape. Perfect for summer dresses and blouses.",
        pricePerMeter: 3.2,
        moq: 400,
        stock: 12000,
        colors: [
            { name: "Sky", hex: "#bfdbfe", image: "/images/rayon_sky.jpg" },
            { name: "Green", hex: "#bbf7d0", image: "/images/rayon_green.jpg" },
            { name: "Brown", hex: "#78350f", image: "/images/rayon_brown.jpg" },
        ],
        swatch: "#fef3c7",
        image: "/images/rayon_sky.jpg",
        supplier: "Diya Mendpara",
    },
    {
        name: "Crushed Cotton Velvet",
        category: "Crushed Velvet",
        fabricType: "Woven",
        description: "Plush cotton velvet with a deep pile and soft sheen. Ideal for upholstery and statement apparel.",
        pricePerMeter: 14.0,
        moq: 120,
        stock: 640,
        colors: [
            { name: "Brown", hex: "#78350f", image: "/images/velvet_brown.jpg" },
            { name: "Dark Green", hex: "#064e3b", image: "/images/velvet_dark_green.jpg" },
            { name: "White", hex: "#ffffff", image: "/images/velvet_white.jpg" },
        ],
        swatch: "#ede9fe",
        image: "/images/velvet_white.jpg",
        supplier: "Diya Mendpara",
    },
    {
        name: "Recycled Polyester Twill",
        category: "Recycled Polyester",
        fabricType: "Woven",
        description: "Durable rPET twill made from recycled bottles. Water-resistant finish, great for bags and outerwear.",
        pricePerMeter: 5.6,
        moq: 500,
        stock: 5000,
        colors: [
            { name: "Black", hex: "#000000", image: "/images/polyester_black.jpg" },
            { name: "Green", hex: "#166534", image: "/images/polyester_green.jpg" },
            { name: "Navy", hex: "#1e3a8a", image: "/images/polyester_navy.jpg" },
        ],
        swatch: "#c7d2fe",
        image: "/images/polyester_green.jpg",
        supplier: "Diya Mendpara",
    },
];
async function seed() {
    await mongoose_1.default.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    const Role = mongoose_1.default.models.Role || mongoose_1.default.model('Role', RoleSchema);
    const User = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
    const Product = mongoose_1.default.models.Product || mongoose_1.default.model('Product', ProductSchema);
    const supplierRole = await Role.findOne({ name: 'supplier' });
    const buyerRole = await Role.findOne({ name: 'buyer' });
    if (!supplierRole || !buyerRole) {
        console.error('Roles not found! Run role seeder first or restart backend.');
        process.exit(1);
    }
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.findOneAndUpdate({ email: 'diya.mendpara31@gmail.com' }, {
        name: 'Diya Mendpara',
        email: 'diya.mendpara31@gmail.com',
        password: hashedPassword,
        role: supplierRole._id,
        companyName: 'Diya Mendpara',
        status: 'active'
    }, { upsert: true, new: true });
    console.log('Supplier Diya seeded');
    await User.findOneAndUpdate({ email: 'prachetsamal@gmail.com' }, {
        name: 'Prachet Samal',
        email: 'prachetsamal@gmail.com',
        password: hashedPassword,
        role: buyerRole._id,
        companyName: 'Prachet Buyer Co.',
        status: 'active'
    }, { upsert: true, new: true });
    console.log('Buyer Prachet seeded');
    await Product.deleteMany({});
    await Product.insertMany(mockProducts);
    console.log(`Seeded ${mockProducts.length} products by supplier Diya Mendpara`);
    await mongoose_1.default.disconnect();
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map