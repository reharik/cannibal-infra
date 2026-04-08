import { useParams } from 'react-router-dom';
import styled from 'styled-components';

export const AlbumScreen = () => {
  const { albumId } = useParams<{ albumId: string }>();

  return (
    <Container>
      <Header>
        <BackButton onClick={() => window.history.back()}>← Back</BackButton>
        <Title>Album Title</Title>
        <HeaderActions>
          <ActionButton>Share</ActionButton>
          <ActionButton>Edit</ActionButton>
        </HeaderActions>
      </Header>

      <Content>
        <AlbumMeta>
          <AlbumCover>
            <CoverPlaceholder>📷</CoverPlaceholder>
          </AlbumCover>
          <AlbumInfo>
            <AlbumTitle>Album Title</AlbumTitle>
            <AlbumStats>
              <Stat>12 media items</Stat>
              <StatDivider>•</StatDivider>
              <Stat>Shared with 3 members</Stat>
            </AlbumStats>
            <AlbumDescription>Album description and metadata will appear here</AlbumDescription>
          </AlbumInfo>
        </AlbumMeta>

        <PhotoGrid>
          {Array.from({ length: 8 }).map((_, i) => (
            <PhotoItem key={i}>
              <PhotoPlaceholder>
                <PlaceholderIcon>📸</PlaceholderIcon>
              </PhotoPlaceholder>
            </PhotoItem>
          ))}
        </PhotoGrid>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(6)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  }
`;

const BackButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.subtext};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.panel};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.subtext};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.panel};
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text};
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

const AlbumMeta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AlbumCover = styled.div`
  flex-shrink: 0;
  width: 240px;
  aspect-ratio: 4 / 3;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CoverPlaceholder = styled.div`
  font-size: 64px;
  opacity: 0.3;
`;

const AlbumInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const AlbumTitle = styled.h2`
  font-size: 28px;
  font-weight: 500;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const AlbumStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const Stat = styled.span``;

const StatDivider = styled.span`
  opacity: 0.5;
`;

const AlbumDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.subtext};
  line-height: 1.6;
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

const PhotoItem = styled.div`
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
`;

const PlaceholderIcon = styled.div`
  font-size: 48px;
  opacity: 0.3;
`;
