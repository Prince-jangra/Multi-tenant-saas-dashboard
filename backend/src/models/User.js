import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
	tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true, required: true },
	email: { type: String, required: true, index: true, lowercase: true, trim: true },
	name: { type: String, required: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;

