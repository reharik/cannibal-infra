import { Outlet, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";

interface AppShellProps {
  viewer: { id: string; displayName: string };
}

export const AppShell = ({ viewer }: AppShellProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <ShellContainer>
      <Navigation>
        <NavContent>
          <NavLeft>
            <AppTitle to="/">Family Photos</AppTitle>
            <NavLinks>
              <NavLink to="/">Photos</NavLink>
              <NavLink to="/albums">Albums</NavLink>
            </NavLinks>
          </NavLeft>
          <NavRight>
            <UserInfo>{viewer.displayName}</UserInfo>
            <LogoutButton onClick={handleLogout}>Sign Out</LogoutButton>
          </NavRight>
        </NavContent>
      </Navigation>
      <MainContent>
        <Outlet />
      </MainContent>
    </ShellContainer>
  );
};

const ShellContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${({ theme }) => theme.colors.bg};
`;

const Navigation = styled.nav`
  background: ${({ theme }) => theme.colors.panel};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 ${({ theme }) => theme.spacing(3)};
  flex-shrink: 0;
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const AppTitle = styled(Link)`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  letter-spacing: -0.5px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const NavLink = styled(Link)`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 14px;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.radius.md};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bg};
  }

  &.active {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bg};
  }
`;

const UserInfo = styled.div`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 14px;
`;

const LogoutButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.bg};
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;
