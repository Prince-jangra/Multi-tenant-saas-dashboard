import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
	tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true, required: true },
	title: { type: String, required: true },
	content: { type: String }
}, { timestamps: true });

// Ensure we always filter by tenant in queries when provided via context
ResourceSchema.pre(/^find/, function (next) {
	// Expect req.tenant injected via context; in Mongoose middleware we don't have req.
	// We'll enforce isolation at route/service layer.
	return next();
});

const Resource = mongoose.model('Resource', ResourceSchema);
export default Resource;

