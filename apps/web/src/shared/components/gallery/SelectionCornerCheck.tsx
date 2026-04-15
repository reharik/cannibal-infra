import styled from 'styled-components';

type SelectionThumbOverlayProps = {
  visible: boolean;
};

/** Dim overlay on selected tiles (Google Photos–style). */
export const SelectionThumbOverlay = ({ visible }: SelectionThumbOverlayProps) => {
  if (!visible) {
    return null;
  }
  return <ThumbDim aria-hidden />;
};

const ThumbDim = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
  pointer-events: none;
  z-index: 1;
`;
