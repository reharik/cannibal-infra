import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root { 
    color-scheme: dark;
  }

  * { 
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root { 
    height: 100%;
    width: 100%;
  }

  body {
    margin: 0;
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.font.body};
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a { 
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: none;
    transition: color 0.2s ease;
  }

  a:hover { 
    color: ${({ theme }) => theme.colors.accentHover};
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 500;
    line-height: 1.3;
    color: ${({ theme }) => theme.colors.text};
  }

  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  h4 { font-size: 1.125rem; }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.bg};
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.bg};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.sm};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.subtext};
  }
`;
