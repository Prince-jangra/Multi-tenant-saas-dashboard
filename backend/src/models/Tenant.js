import mongoose from 'mongoose';

const ThemeSchema = new mongoose.Schema({
	primary: { type: String, default: process.env.DEFAULT_THEME_PRIMARY || '#2d6cdf' },
	background: { type: String, default: process.env.DEFAULT_THEME_BACKGROUND || '#ffffff' },
	text: { type: String, default: process.env.DEFAULT_THEME_TEXT || '#111111' }
}, { _id: false });

const TenantSchema = new mongoose.Schema({
	name: { type: String, required: true },
	slug: { type: String, required: true, unique: true, index: true },
	brand: {
		logoUrl: { type: String },
		tagline: { type: String }
	},
	theme: { type: ThemeSchema, default: () => ({}) }
}, { timestamps: true });

const Tenant = mongoose.model('Tenant', TenantSchema);
export default Tenant;

