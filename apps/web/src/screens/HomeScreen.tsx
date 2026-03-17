import styled from "styled-components";

export const HomeScreen = () => {
  return (
    <Container>
      <Header>
        <Title>Recent Photos</Title>
        <HeaderActions>
          <UploadButton>Upload Photos</UploadButton>
        </HeaderActions>
      </Header>

      <Content>
        <PhotoGrid>
          {/* Placeholder grid items */}
          {Array.from({ length: 12 }).map((_, i) => (
            <PhotoGridItem key={i}>
              <PhotoPlaceholder>
                <PlaceholderIcon>📸</PlaceholderIcon>
              </PhotoPlaceholder>
              <PhotoInfo>
                <PhotoDate>Photo {i + 1}</PhotoDate>
              </PhotoInfo>
            </PhotoGridItem>
          ))}
        </PhotoGrid>
      </Content>

      <EmptyState>
        <EmptyIcon>📷</EmptyIcon>
        <EmptyTitle>No photos yet</EmptyTitle>
        <EmptyText>Upload your first photos to start building your family gallery</EmptyText>
        <EmptyButton>Upload Photos</EmptyButton>
      </EmptyState>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(6)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing(3)};
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(2)};
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 500;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const UploadButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(6)};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing(3)};
  }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: ${({ theme }) => theme.spacing(2)};
  }
`;

const PhotoGridItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PhotoPlaceholder = styled.div`
  aspect-ratio: 4 / 3;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const PlaceholderIcon = styled.div`
  font-size: 48px;
  opacity: 0.3;
`;

const PhotoInfo = styled.div`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(0.5)};
`;

const PhotoDate = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const EmptyState = styled.div`
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  opacity: 0.3;
`;

const EmptyTitle = styled.h2`
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0;
  max-width: 400px;
`;

const EmptyButton = styled.button`
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }
`;
