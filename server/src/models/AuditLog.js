import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true }, // denormalized — survives even if the user account is later deleted
    action: { type: String, required: true }, // e.g. "product:delete", "role:update"
    targetModel: { type: String }, // e.g. "Product", "Order"
    targetId: { type: String },
    changes: { type: mongoose.Schema.Types.Mixed }, // optional before/after snapshot
    ipAddress: { type: String },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
