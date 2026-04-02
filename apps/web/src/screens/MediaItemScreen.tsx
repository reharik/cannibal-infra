import { useParams } from 'react-router-dom';
import styled from 'styled-components';

export const MediaItemScreen = () => {
  const { mediaId } = useParams<{ mediaId: string }>();

  return (
    <Container>
      <CloseButton onClick={() => window.history.back()}>✕</CloseButton>

      <MediaViewer>
        <MediaPlaceholder>
          <PlaceholderIcon>🖼️</PlaceholderIcon>
          <PlaceholderText>Media viewer will appear here</PlaceholderText>
        </MediaPlaceholder>
      </MediaViewer>

      <MetadataPanel>
        <MetadataSection>
          <SectionTitle>Details</SectionTitle>
          <MetadataItem>
            <MetadataLabel>Filename</MetadataLabel>
            <MetadataValue>photo-{mediaId}.jpg</MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Date</MetadataLabel>
            <MetadataValue>March 17, 2026</MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Size</MetadataLabel>
            <MetadataValue>2.4 MB</MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Dimensions</MetadataLabel>
            <MetadataValue>1920 × 1080</MetadataValue>
          </MetadataItem>
        </MetadataSection>

        <MetadataSection>
          <SectionTitle>Actions</SectionTitle>
          <ActionButton>Download</ActionButton>
          <ActionButton>Share</ActionButton>
          <ActionButton danger>Delete</ActionButton>
        </MetadataSection>
      </MetadataPanel>
    </Container>
  );
};

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.bg};
  display: flex;
  z-index: 100;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.subtext};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.bg};
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const MediaViewer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const MediaPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(8)};
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  max-width: 600px;
  width: 100%;
`;

const PlaceholderIcon = styled.div`
  font-size: 80px;
  opacity: 0.3;
`;

const PlaceholderText = styled.div`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const MetadataPanel = styled.aside`
  width: 320px;
  background: ${({ theme }) => theme.colors.panel};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(4)};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};

  @media (max-width: 968px) {
    display: none;
  }
`;

const MetadataSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing(1)} 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetadataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
`;

const MetadataLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetadataValue = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
  background: transparent;
  border: 1px solid ${({ theme, danger }) => (danger ? theme.colors.danger : theme.colors.border)};
  color: ${({ theme, danger }) => (danger ? theme.colors.danger : theme.colors.subtext)};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, danger }) => (danger ? 'rgba(217, 140, 126, 0.1)' : theme.colors.bg)};
    color: ${({ theme, danger }) => (danger ? theme.colors.danger : theme.colors.text)};
  }
`;
