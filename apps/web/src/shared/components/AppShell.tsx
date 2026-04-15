import { Link, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { Navigation } from './Navigation';
import { Profile } from './Profile';

interface AppShellProps {
  viewer: { id: string; displayName: string };
}

export const AppShell = ({ viewer }: AppShellProps) => {
  return (
    <SCShellContainer>
      <SCNavigation>
        <SCNavContent>
          <SCAppNavigation>
            <SCAppTitle to="/">Family Media</SCAppTitle>
            <Navigation
              links={[
                { label: 'Media', to: '/media' },
                { label: 'Albums', to: '/albums' },
              ]}
            />
          </SCAppNavigation>
          <Profile displayName={viewer.displayName} />
        </SCNavContent>
      </SCNavigation>
      <MainContent>
        <Outlet />
      </MainContent>
    </SCShellContainer>
  );
};

const SCShellContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${({ theme }) => theme.colors.bg};
`;

const SCNavigation = styled.nav`
  background: ${({ theme }) => theme.colors.panel};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 ${({ theme }) => theme.spacing(3)};
  flex-shrink: 0;
`;

const SCNavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SCAppNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const SCAppTitle = styled(Link)`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  letter-spacing: -0.5px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const MainContent = styled.main`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
