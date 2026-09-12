import { api } from "../../lib/api";

export interface MediaItem {
  _id: string;
  fileName: string;
  url: string;
  thumbnailUrl: string;
  type: "image" | "video" | "other";
  altText: string;
  title: string;
  usageCount: number;
  folder: string | null;
}

export const fetchMediaLibrary = async (params: {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  folderId?: string; // "root" = top-level only; omit = no folder filter
}) => {
  const res = await api.get("/media", { params });
  return res.data as { media: MediaItem[]; pagination: any };
};

export const uploadMediaRequest = async (
  files: File[],
  folderId?: string | null,
): Promise<MediaItem[]> => {
  const formData = new FormData();
  // IMPORTANT: folderId must be appended BEFORE files — multer parses
  // multipart fields in stream order, and the backend's dynamic Cloudinary
  // folder resolver reads req.body.folderId while the files are streaming
  if (folderId) formData.append("folderId", folderId);
  files.forEach((f) => formData.append("files", f));
  const res = await api.post("/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.media;
};

export const updateMediaRequest = async (
  id: string,
  data: { altText?: string; title?: string },
) => {
  const res = await api.put(`/media/${id}`, data);
  return res.data.media;
};

export const deleteMediaRequest = async (id: string) => {
  const res = await api.delete(`/media/${id}`);
  return res.data;
};

export const moveMediaRequest = async (
  id: string,
  folderId: string | null,
): Promise<MediaItem> => {
  const res = await api.put(`/media/${id}/move`, { folderId });
  return res.data.media;
};
