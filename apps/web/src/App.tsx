import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './app/providers/AppProviders';
import { AppRouter } from './app/router/AppRouter';
import { ViewerBootstrap } from './app/ViewerBootstrap';
import { AuthProvider } from './contexts/AuthContext';
import { LoggedOutScreen } from './screens/LoggedOutScreen';

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
