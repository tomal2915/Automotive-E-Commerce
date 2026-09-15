import { api } from "../../lib/api";

export interface MediaFolder {
  _id: string;
  name: string;
  parentFolder: string | null;
}

export interface FoldersResponse {
  folders: MediaFolder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BreadcrumbItem {
  _id: string;
  name: string;
}

export const fetchFolders = async (
  parentId?: string,
  params: { page?: number; limit?: number } = {},
): Promise<FoldersResponse> => {
  const res = await api.get("/media/folders", {
    params: { ...(parentId ? { parentId } : {}), ...params },
  });
  return res.data;
};

export const fetchFolderBreadcrumb = async (
  id: string,
): Promise<BreadcrumbItem[]> => {
  const res = await api.get(`/media/folders/${id}/breadcrumb`);
  return res.data.breadcrumb;
};

export const createFolderRequest = async (data: {
  name: string;
  parentFolder?: string | null;
}): Promise<MediaFolder> => {
  const res = await api.post("/media/folders", data);
  return res.data.folder;
};

export const renameFolderRequest = async (
  id: string,
  name: string,
): Promise<MediaFolder> => {
  const res = await api.put(`/media/folders/${id}`, { name });
  return res.data.folder;
};

export const deleteFolderRequest = async (id: string) => {
  const res = await api.delete(`/media/folders/${id}`);
  return res.data;
};
