import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
	tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true, required: true },
	email: { type: String, required: true, index: true },
	name: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;

