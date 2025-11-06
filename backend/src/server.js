import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { tenantContextMiddleware } from './middleware/tenantContext.js';
import resourcesRouter from './routes/resources.js';
import tenantsRouter from './routes/tenants.js';
import themesRouter from './routes/themes.js';

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
	origin: (origin, cb) => {
		const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
		if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
		return cb(new Error('Not allowed by CORS'));
	},
	credentials: true
}));

app.get('/', (req, res) => {
	res.json({
		message: 'Multi-tenant SaaS API',
		version: '1.0.0',
		endpoints: {
			health: '/api/health',
			tenants: '/api/tenants',
			'tenant-me': '/api/tenants/me',
			resources: '/api/resources',
			theme: '/api/themes/current.css'
		},
		usage: 'Use the frontend at http://localhost:5173 or access API endpoints directly'
	});
});

app.use(tenantContextMiddleware);

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', tenant: req.tenant?.slug || null });
});

app.use('/api/resources', resourcesRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/themes', themesRouter);

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/multitenant_saas';

async function start() {
	try {
		await mongoose.connect(mongoUri);
		app.listen(port, host, () => {
			const url = `http://${host}:${port}`;
			console.log(`API listening at ${url}`);
		});
	} catch (err) {
		console.error('Failed to start server', err);
		process.exit(1);
	}
}

if (process.env.NODE_ENV !== 'test') {
	start();
}

export default app;

