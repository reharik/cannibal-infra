import { useQuery } from '@apollo/client/react';
import { DateTime } from 'luxon';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ViewerMediaItemDetailDocument } from '../graphql/generated/types';
import { MediaViewer } from '../shared/components/media/MediaViewer';

const kindLabel = (kind: string): string => {
  if (kind === 'VIDEO') {
    return 'Video';
  }
  if (kind === 'PHOTO') {
    return 'Photo';
  }
  return 'Media';
};

const formatCreatedAt = (value: unknown): string => {
  if (typeof value === 'string') {
    const dt = DateTime.fromISO(value);
    if (dt.isValid) {
      return dt.toLocaleString(DateTime.DATE_MED);
    }
  }
  return '—';
};

const isNonEmptyDisplayUrl = (url: string | undefined): url is string => {
  return typeof url === 'string' && url.trim().length > 0;
};

const displayNameForPanel = (input: {
  title?: string | null;
  originalFileName?: string | null;
}): string => {
  const t = input.title?.trim();
  if (t) {
    return t;
  }
  const f = input.originalFileName?.trim();
  if (f) {
    return f;
  }
  return 'Untitled';
};

export const MediaItemScreen = () => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const { data, loading, error } = useQuery(ViewerMediaItemDetailDocument, {
    variables: { mediaItemId: mediaId ?? '' },
    skip: !mediaId,
  });

  const mediaItem = data?.viewer?.mediaItem ?? null;
  const displayAsset = mediaItem?.displayAsset ?? null;
  const originalAsset = mediaItem?.originalAsset ?? null;

  const displayUrl =
    displayAsset != null && isNonEmptyDisplayUrl(displayAsset.url)
      ? displayAsset.url.trim()
      : null;

  const mimeForViewer =
    originalAsset?.mimeType != null && originalAsset.mimeType.trim().length > 0
      ? originalAsset.mimeType.trim()
      : (mediaItem?.mimeType ?? '');

  const viewerChrome = (children: ReactNode) => (
    <ViewerShell>
      <ViewerCard>{children}</ViewerCard>
    </ViewerShell>
  );

  const viewerPane = (() => {
    if (!mediaId) {
      return viewerChrome(<StateText role="alert">Missing media id.</StateText>);
    }
    if (loading) {
      return viewerChrome(<StateText>Loading media…</StateText>);
    }
    if (error) {
      return viewerChrome(
        <StateText role="alert">Could not load media. {error.message}</StateText>,
      );
    }
    if (mediaItem == null) {
      return viewerChrome(
        <StateText>This media was not found or you do not have access.</StateText>,
      );
    }
    if (displayAsset === null || displayUrl === null) {
      return viewerChrome(
        <>
          <PlaceholderIcon aria-hidden>🖼️</PlaceholderIcon>
          <StateText>No display asset is available for this item yet.</StateText>
          <HintText>Check back after processing finishes.</HintText>
        </>,
      );
    }
    return (
      <MediaViewer
        kind={mediaItem.kind}
        mimeType={mimeForViewer}
        displayUrl={displayUrl}
        imageAlt={
          mediaItem.title?.trim() ||
          mediaItem.originalFileName?.trim() ||
          kindLabel(mediaItem.kind)
        }
      />
    );
  })();

  const sizeLabel =
    originalAsset?.fileSizeBytes != null ? `${originalAsset.fileSizeBytes} bytes` : '—';
  const dimensionsLabel =
    originalAsset?.width != null && originalAsset?.height != null
      ? `${originalAsset.width} × ${originalAsset.height}`
      : '—';

  return (
    <Container>
      <CloseButton type="button" onClick={() => window.history.back()} aria-label="Close">
        ✕
      </CloseButton>

      {viewerPane}

      <MetadataPanel>
        <MetadataSection>
          <SectionTitle>Details</SectionTitle>
          <MetadataItem>
            <MetadataLabel>Name</MetadataLabel>
            <MetadataValue>
              {mediaItem != null
                ? displayNameForPanel({
                    title: mediaItem.title,
                    originalFileName: mediaItem.originalFileName,
                  })
                : '—'}
            </MetadataValue>
          </MetadataItem>
          {mediaItem?.description?.trim() ? (
            <MetadataItem>
              <MetadataLabel>Description</MetadataLabel>
              <MetadataValue>{mediaItem.description.trim()}</MetadataValue>
            </MetadataItem>
          ) : null}
          <MetadataItem>
            <MetadataLabel>Date</MetadataLabel>
            <MetadataValue>{formatCreatedAt(mediaItem?.createdAt)}</MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Taken</MetadataLabel>
            <MetadataValue>{formatCreatedAt(mediaItem?.takenAt)}</MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Size</MetadataLabel>
            <MetadataValue>{sizeLabel}</MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Dimensions</MetadataLabel>
            <MetadataValue>{dimensionsLabel}</MetadataValue>
          </MetadataItem>
        </MetadataSection>
      </MetadataPanel>
    </Container>
  );
};

const ViewerShell = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const ViewerCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(8)};
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  max-width: min(600px, 100%);
  width: 100%;
  min-height: 200px;
`;

const PlaceholderIcon = styled.div`
  font-size: 80px;
  opacity: 0.3;
`;

const StateText = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.subtext};
  text-align: center;
`;

const HintText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.subtext};
  text-align: center;
  opacity: 0.9;
`;

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
