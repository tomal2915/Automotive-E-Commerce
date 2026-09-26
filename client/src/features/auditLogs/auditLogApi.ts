import { api } from "../../lib/api";

export interface AuditLog {
  _id: string;
  userEmail: string;
  action: string;
  targetModel: string;
  targetId: string;
  changes: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export const fetchAuditLogs = async (
  page = 1,
): Promise<{
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const res = await api.get("/audit-logs", { params: { page, limit: 30 } });
  return res.data;
};
