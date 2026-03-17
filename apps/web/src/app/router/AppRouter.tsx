import { Routes, Route } from "react-router-dom";
import { AppShell } from "../../shared/components/AppShell";
import { HomeScreen } from "../../screens/HomeScreen";
import { AlbumScreen } from "../../screens/AlbumScreen";
import { MediaItemScreen } from "../../screens/MediaItemScreen";

interface AppRouterProps {
  viewer: { id: string; displayName: string };
}

export const AppRouter = ({ viewer }: AppRouterProps) => {
  return (
    <Routes>
      <Route element={<AppShell viewer={viewer} />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/albums" element={<HomeScreen />} />
        <Route path="/albums/:albumId" element={<AlbumScreen />} />
      </Route>
      <Route path="/media/:mediaId" element={<MediaItemScreen />} />
    </Routes>
  );
};
