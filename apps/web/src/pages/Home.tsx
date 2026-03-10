import React from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";

const Page = styled.main`
  padding: ${({ theme }) => theme.spacing(3)};
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.font.body};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 1.1rem;
`;

export const Home = () => {
  const { user } = useAuth();

  return (
    <Page>
      <Title>Photo App</Title>
      <Subtitle>
        {user ? `Welcome, ${user.name ?? user.email}.` : "Loading…"}
      </Subtitle>
    </Page>
  );
};
