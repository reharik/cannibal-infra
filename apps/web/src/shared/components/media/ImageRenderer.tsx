import styled from 'styled-components';

export type ImageRendererProps = {
  src: string;
  alt: string;
};

export const ImageRenderer = ({ src, alt }: ImageRendererProps) => {
  return <StyledImg src={src} alt={alt} />;
};

const StyledImg = styled.img`
  width: 100%;
  max-height: calc(100vh - 120px);
  object-fit: contain;
`;
