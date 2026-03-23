import { createAlbumService } from "./viewerReadServices/albumService";

export type ReadServices = {
  albumService: ReturnType<typeof createAlbumService>;
};
