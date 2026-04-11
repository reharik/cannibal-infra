import styled from 'styled-components';
import type { MediaKind } from '../../../graphql/generated/types';
import { MediaRenderer } from './MediaRenderer';

export type MediaViewerProps = {
  kind: MediaKind;
  mimeType: string;
  displayUrl: string;
  imageAlt: string;
};

export const MediaViewer = ({ kind, mimeType, displayUrl, imageAlt }: MediaViewerProps) => {
  return (
    <ViewerShell>
      <ViewerCard>
        <MediaRenderer
          kind={kind}
          mimeType={mimeType}
          displayUrl={displayUrl}
          imageAlt={imageAlt}
        />
      </ViewerCard>
    </ViewerShell>
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
