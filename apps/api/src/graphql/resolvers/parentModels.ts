export type ViewerParent = {
  id: string;
  firstName?: string;
  lastName?: string;
  isAuthenticated: boolean;
  displayName: string;
};

export type MediaItemParent = {
  id: string;
  kind: string;
  status: string;
  storageKey: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  title?: string;
  description?: string;
  takenAt?: Date;
};

export type AlbumParent = {
  id: string;
  title: string;
  description?: string;
  coverMediaId?: string;
  coverMedia?: MediaItemParent;
};

export type AlbumItemParent = {
  id: string;
  mediaItem: MediaItemParent;
};
