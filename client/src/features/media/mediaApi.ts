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
}

export const fetchMediaLibrary = async (params: {
  page?: number;
  type?: string;
  search?: string;
}) => {
  const res = await api.get("/media", { params });
  return res.data as { media: MediaItem[]; pagination: any };
};

export const uploadMediaRequest = async (
  files: File[],
): Promise<MediaItem[]> => {
  const formData = new FormData();
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
