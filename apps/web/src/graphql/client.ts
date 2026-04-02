import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { config } from '../config';

const httpLink = new HttpLink({
  uri: `${config.apiBaseUrl}/graphql`,
});

const authLink = new SetContextLink((prevContext) => {
  const token = localStorage.getItem('authToken');

  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
