import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
};

/** Implemented by all entities that have an id. */
export type Node = {
  id: Scalars['ID']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  shareLink?: Maybe<ShareLinkAccess>;
  viewer?: Maybe<Viewer>;
};


export type QueryShareLinkArgs = {
  token: Scalars['String']['input'];
};

export type ShareLinkAccess = {
  __typename?: 'ShareLinkAccess';
  target: ShareLinkTarget;
  token: Scalars['ID']['output'];
  viewerRelationship: ShareViewerRelationship;
};

export type ShareLinkTarget = SharedAlbum | SharedMediaItem;

export type ShareViewerRelationship =
  | 'ANONYMOUS'
  | 'AUTHENTICATED'
  | 'MEMBER'
  | 'OWNER';

export type SharedAlbum = Node & {
  __typename?: 'SharedAlbum';
  id: Scalars['ID']['output'];
  items: SharedAlbumItemConnection;
  title: Scalars['String']['output'];
};


export type SharedAlbumItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type SharedAlbumItem = Node & {
  __typename?: 'SharedAlbumItem';
  id: Scalars['ID']['output'];
  media: SharedMediaItem;
};

export type SharedAlbumItemConnection = {
  __typename?: 'SharedAlbumItemConnection';
  nodes: Array<SharedAlbumItem>;
  pageInfo: PageInfo;
};

export type SharedMediaItem = Node & {
  __typename?: 'SharedMediaItem';
  displayUrl: Scalars['String']['output'];
  height?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};

export type SortDir =
  | 'ASC'
  | 'DESC';

export type Viewer = {
  __typename?: 'Viewer';
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type ViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type ViewerQuery = { __typename?: 'Query', viewer?: { __typename?: 'Viewer', id: string, displayName: string } | null };


export const ViewerDocument = gql`
    query Viewer {
  viewer {
    id
    displayName
  }
}
    `;

/**
 * __useViewerQuery__
 *
 * To run a query within a React component, call `useViewerQuery` and pass it any options that fit your needs.
 * When your component renders, `useViewerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useViewerQuery({
 *   variables: {
 *   },
 * });
 */
export function useViewerQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ViewerQuery, ViewerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ViewerQuery, ViewerQueryVariables>(ViewerDocument, options);
      }
export function useViewerLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ViewerQuery, ViewerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ViewerQuery, ViewerQueryVariables>(ViewerDocument, options);
        }
// Suspense query removed due to type compatibility issues
// Use useViewerQuery instead
export type ViewerQueryHookResult = ReturnType<typeof useViewerQuery>;
export type ViewerLazyQueryHookResult = ReturnType<typeof useViewerLazyQuery>;