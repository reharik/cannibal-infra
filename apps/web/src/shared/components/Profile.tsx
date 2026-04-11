import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

export type ProfileProps = {
  displayName: string;
};

export const Profile = ({ displayName }: ProfileProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <StyledProfile>
      <StyledUserInfo>{displayName}</StyledUserInfo>
      <StyledLogoutButton onClick={handleLogout}>Sign Out</StyledLogoutButton>
    </StyledProfile>
  );
};

const StyledProfile = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;
const StyledUserInfo = styled.div`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 14px;
`;

const StyledLogoutButton = styled.button`
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
