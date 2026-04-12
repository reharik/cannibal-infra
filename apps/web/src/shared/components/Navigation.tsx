import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const Navigation = ({ links }: { links: { label: string; to: string }[] }) => {
  return (
    <StyledNavigation>
      <StyledNavLinks>
        {links.map((x) => (
          <StyledNavLink to={x.to} key={x.label}>
            {x.label}
          </StyledNavLink>
        ))}
      </StyledNavLinks>
    </StyledNavigation>
  );
};

const StyledNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const StyledNavLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledNavLink = styled(Link)`
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
