import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./app/providers/AppProviders";
import { ViewerBootstrap } from "./app/ViewerBootstrap";
import { AppRouter } from "./app/router/AppRouter";
import { LoggedOutScreen } from "./screens/LoggedOutScreen";
import { AuthProvider } from "./contexts/AuthContext";

export const App = () => {
  return (
    <AppProviders>
      <AuthProvider>
        <BrowserRouter>
          <ViewerBootstrap>
            {(viewer) => (viewer ? <AppRouter viewer={viewer} /> : <LoggedOutScreen />)}
          </ViewerBootstrap>
        </BrowserRouter>
      </AuthProvider>
    </AppProviders>
  );
};
