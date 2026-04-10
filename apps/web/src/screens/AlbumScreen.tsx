import { useApolloClient, useQuery } from '@apollo/client/react';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { mediaItemDetailPath } from '../app/paths';
import type { AppError } from '../application/errors/types';
import { executeMutation } from '../application/graphql/executeMutation';
import {
  AddMediaItemToAlbumDocument,
  ViewerAlbumDetailDocument,
  ViewerMediaPickerDocument,
  type AddMediaItemToAlbumMutation,
} from '../graphql/generated/types';

export const AlbumScreen = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const client = useApolloClient();
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [appErrors, setAppErrors] = useState<AppError[]>([]);
  const [addingMediaId, setAddingMediaId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(ViewerAlbumDetailDocument, {
    variables: { albumId: albumId ?? '' },
    skip: !albumId,
  });

  const { data: pickerData, loading: pickerLoading } = useQuery(ViewerMediaPickerDocument, {
    skip: !addItemOpen,
    fetchPolicy: 'network-only',
  });

  const album = data?.viewer?.album;
  const itemNodes = album?.items.nodes ?? [];

  const formatCreatedAt = (value: unknown): string => {
    if (typeof value === 'string') {
      const dt = DateTime.fromISO(value);
      if (dt.isValid) {
        return dt.toLocaleString(DateTime.DATE_MED);
      }
    }
    return '—';
  };

  const kindLabel = (kind: string): string => {
    if (kind === 'VIDEO') {
      return 'Video';
    }
    if (kind === 'PHOTO') {
      return 'Photo';
    }
    return 'Media';
  };

  const closePicker = () => {
    setAddItemOpen(false);
    setAppErrors([]);
    setAddingMediaId(null);
  };

  const addMediaToAlbum = async (mediaItemId: string) => {
    if (!albumId) {
      return;
    }

    setAddingMediaId(mediaItemId);
    setAppErrors([]);

    const result = await executeMutation(
      client,
      {
        mutation: AddMediaItemToAlbumDocument,
        variables: { input: { albumId, mediaItemId } },
      },
      (mutationData: AddMediaItemToAlbumMutation) => mutationData.AddMediaItemToAlbum,
    );

    setAddingMediaId(null);

    if (!result.success) {
      setAppErrors(result.errors);
      return;
    }

    closePicker();
    await refetch();
  };

  if (!albumId) {
    return (
      <Container>
        <StatusMessage role="alert">Missing album id.</StatusMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackLink to="/albums">← Albums</BackLink>
        <Title>{loading ? 'Album' : album?.title ?? 'Album'}</Title>
        <HeaderActions>
          <PrimaryButton type="button" onClick={() => setAddItemOpen(true)} disabled={!album}>
            Add album item
          </PrimaryButton>
        </HeaderActions>
      </Header>

      {appErrors.length > 0
        ? appErrors.map((err) => (
            <InlineNotice key={`${err.code}-${err.message}`} role="alert">
              {err.message}
            </InlineNotice>
          ))
        : null}

      <Content>
        {loading ? (
          <StatusMessage>Loading album…</StatusMessage>
        ) : error ? (
          <StatusMessage role="alert">Could not load album. {error.message}</StatusMessage>
        ) : !album ? (
          <StatusMessage>
            This album was not found or you do not have access.{' '}
            <BackLink to="/albums">Back to albums</BackLink>
          </StatusMessage>
        ) : (
          <>
            <AlbumMeta>
              <AlbumCover>
                {album.coverMedia ? (
                  album.coverMedia.asset?.url ? (
                    <CoverImage src={album.coverMedia.asset.url} alt={album.title} />
                  ) : (
                    <CoverIcon aria-hidden>
                      {album.coverMedia.kind === 'VIDEO' ? '🎬' : '🖼️'}
                    </CoverIcon>
                  )
                ) : (
                  <CoverPlaceholder aria-hidden>📷</CoverPlaceholder>
                )}
              </AlbumCover>
              <AlbumInfo>
                <AlbumTitle>{album.title}</AlbumTitle>
                <AlbumStats>
                  <Stat>{itemNodes.length} media items</Stat>
                </AlbumStats>
                <AlbumDescription>
                  Updated {formatCreatedAt(album.updatedAt)}
                </AlbumDescription>
              </AlbumInfo>
            </AlbumMeta>

            {itemNodes.length > 0 ? (
              <PhotoGrid>
                {itemNodes.map((node) => (
                  <PhotoItem key={node.id}>
                    <PhotoButton to={mediaItemDetailPath(node.mediaItem.id)}>
                      <PhotoThumb>
                        {node.mediaItem.asset?.url ? (
                          <ThumbImage
                            src={node.mediaItem.asset.url}
                            alt={node.mediaItem.title?.trim() || kindLabel(node.mediaItem.kind)}
                          />
                        ) : (
                          <ThumbIcon aria-hidden>
                            {node.mediaItem.kind === 'VIDEO' ? '🎬' : '🖼️'}
                          </ThumbIcon>
                        )}
                        {node.mediaItem.status === 'PENDING' ? (
                          <StatusPill>Processing</StatusPill>
                        ) : null}
                        {node.mediaItem.status === 'FAILED' ? (
                          <StatusPill $fail>Failed</StatusPill>
                        ) : null}
                      </PhotoThumb>
                      <PhotoCaption>
                        {node.mediaItem.title?.trim() || kindLabel(node.mediaItem.kind)}
                      </PhotoCaption>
                      <PhotoMeta>{formatCreatedAt(node.mediaItem.createdAt)}</PhotoMeta>
                    </PhotoButton>
                  </PhotoItem>
                ))}
              </PhotoGrid>
            ) : (
              <EmptyAlbum>
                <EmptyText>No items in this album yet.</EmptyText>
                <SecondaryButton type="button" onClick={() => setAddItemOpen(true)}>
                  Add album item
                </SecondaryButton>
              </EmptyAlbum>
            )}
          </>
        )}
      </Content>

      {addItemOpen ? (
        <ModalBackdrop role="presentation" onClick={() => !addingMediaId && closePicker()}>
          <Modal
            role="dialog"
            aria-labelledby="add-item-title"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalTitle id="add-item-title">Add media to album</ModalTitle>
            <ModalHint>Only finished uploads can be added.</ModalHint>
            {pickerLoading ? (
              <ModalStatus>Loading your media…</ModalStatus>
            ) : (
              <PickerList>
                {(pickerData?.viewer?.mediaItems.nodes ?? []).map((m) => {
                  const canAdd = m.status === 'READY' || m.status === 'UPLOADED';
                  const busy = addingMediaId === m.id;
                  return (
                    <PickerRow key={m.id}>
                      <PickerButton
                        type="button"
                        disabled={!canAdd || busy}
                        onClick={() => void addMediaToAlbum(m.id)}
                      >
                        <span>
                          {m.title?.trim() || kindLabel(m.kind)}
                          {!canAdd ? ` · ${m.status === 'PENDING' ? 'Processing' : m.status}` : ''}
                        </span>
                        {busy ? <span>Adding…</span> : null}
                      </PickerButton>
                    </PickerRow>
                  );
                })}
              </PickerList>
            )}
            {(pickerData?.viewer?.mediaItems.nodes ?? []).length === 0 && !pickerLoading ? (
              <ModalStatus>No media yet. Upload from the Media tab first.</ModalStatus>
            ) : null}
            <ModalActions>
              <SecondaryButton type="button" onClick={closePicker} disabled={!!addingMediaId}>
                Close
              </SecondaryButton>
            </ModalActions>
          </Modal>
        </ModalBackdrop>
      ) : null}
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
    flex-wrap: wrap;
  }
`;

const BackLink = styled(Link)`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.subtext};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  text-decoration: none;
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

const PrimaryButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 500;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const InlineNotice = styled.div`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(6)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(6)};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing(3)};
  }
`;

const StatusMessage = styled.div`
  max-width: 560px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 15px;
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

const CoverIcon = styled.div`
  font-size: 64px;
  opacity: 0.35;
`;

const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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

const PhotoItem = styled.div``;

const PhotoButton = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;
  text-align: left;
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  color: inherit;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PhotoThumb = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ThumbIcon = styled.div`
  font-size: 48px;
  opacity: 0.35;
`;

const ThumbImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StatusPill = styled.span<{ $fail?: boolean }>`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing(1)};
  right: ${({ theme }) => theme.spacing(1)};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme, $fail }) =>
    $fail ? 'rgba(217, 140, 126, 0.25)' : 'rgba(0, 0, 0, 0.55)'};
  color: ${({ theme }) => theme.colors.bg};
`;

const PhotoCaption = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  padding: 0 ${({ theme }) => theme.spacing(0.5)};
`;

const PhotoMeta = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.subtext};
  padding: 0 ${({ theme }) => theme.spacing(0.5)};
`;

const EmptyAlbum = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 1400px;
  margin: 0 auto;
`;

const EmptyText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 15px;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const Modal = styled.div`
  width: 100%;
  max-width: 440px;
  max-height: min(80vh, 560px);
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing(1)};
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const ModalHint = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const ModalStatus = styled.p`
  margin: ${({ theme }) => theme.spacing(2)} 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const PickerList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 120px;
`;

const PickerRow = styled.li`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const PickerButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  text-align: left;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(3)};
`;
