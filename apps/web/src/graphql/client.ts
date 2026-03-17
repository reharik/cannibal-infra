import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { config } from "../config";
import { SetContextLink } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: `${config.apiBaseUrl}/graphql`,
});

const authLink = new SetContextLink((prevContext) => {
  const token = localStorage.getItem("authToken");

  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
