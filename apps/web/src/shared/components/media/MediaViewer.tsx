import styled from 'styled-components';
import type { MediaKind } from '../../../graphql/generated/types';
import { MediaRenderer } from './MediaRenderer';
import type { NavigateDirection } from './mediaViewerTypes';

export type { NavigateDirection } from './mediaViewerTypes';

export type MediaViewerProps = {
  kind: MediaKind;
  mimeType: string;
  displayUrl: string;
  imageAlt: string;
  /** Called when the user dismisses the viewer (close control). */
  onClose: () => void;
  onNavigate?: (direction: NavigateDirection) => void;
  canNavigatePrevious?: boolean;
  canNavigateNext?: boolean;
};

export const MediaViewer = (props: MediaViewerProps) => {
  const {
    kind,
    mimeType,
    displayUrl,
    imageAlt,
    onClose,
    onNavigate,
    canNavigatePrevious = false,
    canNavigateNext = false,
  } = props;

  const showNavControls = canNavigatePrevious || canNavigateNext;

  const media = (
    <MediaRenderer kind={kind} mimeType={mimeType} displayUrl={displayUrl} imageAlt={imageAlt} />
  );

  return (
    <ViewerRoot>
      <ViewerCloseButton type="button" onClick={onClose} aria-label="Close">
        ✕
      </ViewerCloseButton>
      <ViewerShell>
        {showNavControls ? (
          <ViewerNavRow>
            <NavArrowButton
              type="button"
              aria-label="Previous image"
              disabled={!canNavigatePrevious}
              onClick={() => {
                if (canNavigatePrevious) {
                  onNavigate?.('previous');
                }
              }}
            >
              ‹
            </NavArrowButton>
            <ViewerCardInNavRow>{media}</ViewerCardInNavRow>
            <NavArrowButton
              type="button"
              aria-label="Next image"
              disabled={!canNavigateNext}
              onClick={() => {
                if (canNavigateNext) {
                  onNavigate?.('next');
                }
              }}
            >
              ›
            </NavArrowButton>
          </ViewerNavRow>
        ) : (
          <ViewerCard>{media}</ViewerCard>
        )}
      </ViewerShell>
    </ViewerRoot>
  );
};

/** Same control as the fixed close inside {@link MediaViewer}, for loading/error chrome. */
export const ViewerCloseButton = styled.button`
  position: fixed;
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
  z-index: 110;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.bg};
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const ViewerRoot = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

const ViewerShell = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  overflow: auto;
`;

const ViewerNavRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  max-width: min(680px, 100%);
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

const ViewerCardInNavRow = styled(ViewerCard)`
  flex: 1;
  min-width: 0;
`;

const NavArrowButton = styled.button`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.subtext};
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bg};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;
