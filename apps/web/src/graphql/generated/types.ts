import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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

export type AddMediaItemToAlbumInput = {
  albumId: Scalars['ID']['input'];
  mediaItemId: Scalars['ID']['input'];
};

export type AddMediaItemToAlbumPayload = {
  __typename?: 'AddMediaItemToAlbumPayload';
  albumId: Scalars['ID']['output'];
  albumItemId: Scalars['ID']['output'];
};

export type Album = Node & {
  __typename?: 'Album';
  coverMedia?: Maybe<MediaItem>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  items: AlbumItemCollectionPayload;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};


export type AlbumItemsArgs = {
  input: ViewerAlbumItemsInput;
};

export type AlbumCollectionInput = {
  pageInfo: PageInfoInput;
  sortBy: AlbumSortBy;
  sortDir: SortDir;
};

export type AlbumCollectionPayload = {
  __typename?: 'AlbumCollectionPayload';
  nodes: Array<Album>;
  pageInfo: PageInfo;
};

export type AlbumItem = Node & {
  __typename?: 'AlbumItem';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  mediaItem: MediaItem;
  updatedAt: Scalars['DateTime']['output'];
};

export type AlbumItemCollectionInput = {
  pageInfo: PageInfoInput;
  sortBy: AlbumItemSortBy;
  sortDir: SortDir;
};

export type AlbumItemCollectionPayload = {
  __typename?: 'AlbumItemCollectionPayload';
  nodes: Array<AlbumItem>;
  pageInfo: PageInfo;
};

export type AlbumItemSortBy =
  | 'CREATED_AT';

export type AlbumSortBy =
  | 'CREATED_AT'
  | 'TITLE';

export type CreateAlbumInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateAlbumPayload = {
  __typename?: 'CreateAlbumPayload';
  albumId: Scalars['ID']['output'];
};

export type CreateMediaUploadInput = {
  kind: MediaKind;
  mimeType: Scalars['String']['input'];
};

export type CreateMediaUploadPayload = {
  __typename?: 'CreateMediaUploadPayload';
  mediaItemId: Scalars['ID']['output'];
  status: MediaItemStatus;
  uploadInstructions: UploadInstructions;
};

/** Optional metadata on enum values for SmartEnum / codegen (e.g. DB column names). */
export type EnumMetaPropInput = {
  name: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type FinalizeMediaUploadInput = {
  mediaItemId: Scalars['ID']['input'];
};

export type FinalizeMediaUploadPayload = {
  __typename?: 'FinalizeMediaUploadPayload';
  kind: MediaKind;
  mediaItemId: Scalars['ID']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  size: Scalars['Int']['output'];
  status: MediaItemStatus;
};

export type MediaItem = Node & {
  __typename?: 'MediaItem';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  durationSeconds?: Maybe<Scalars['Int']['output']>;
  height?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  kind: MediaKind;
  mimeType: Scalars['String']['output'];
  sizeBytes: Scalars['Int']['output'];
  status: MediaItemStatus;
  storageKey: Scalars['String']['output'];
  takenAt?: Maybe<Scalars['DateTime']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};

export type MediaItemCollectionInput = {
  pageInfo: PageInfoInput;
  sortBy: MediaItemSortBy;
  sortDir: SortDir;
};

export type MediaItemCollectionPayload = {
  __typename?: 'MediaItemCollectionPayload';
  nodes: Array<MediaItem>;
  pageInfo: PageInfo;
};

export type MediaItemSortBy =
  | 'CREATED_AT';

export type MediaItemStatus =
  | 'FAILED'
  | 'PENDING'
  | 'READY';

export type MediaKind =
  | 'PHOTO'
  | 'VIDEO';

export type Mutation = {
  __typename?: 'Mutation';
  AddMediaItemToAlbum: AddMediaItemToAlbumPayload;
  createAlbum: CreateAlbumPayload;
  createMediaUpload: CreateMediaUploadPayload;
  finalizeMediaUpload: FinalizeMediaUploadPayload;
};


export type MutationAddMediaItemToAlbumArgs = {
  input: AddMediaItemToAlbumInput;
};


export type MutationCreateAlbumArgs = {
  input: CreateAlbumInput;
};


export type MutationCreateMediaUploadArgs = {
  input: CreateMediaUploadInput;
};


export type MutationFinalizeMediaUploadArgs = {
  input: FinalizeMediaUploadInput;
};

/** Implemented by all entities that have an id. */
export type Node = {
  id: Scalars['ID']['output'];
};

/** Cursor-free paging window (offset-based). Used on output types. */
export type PageInfo = {
  __typename?: 'PageInfo';
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
};

/** Same shape as PageInfo; GraphQL requires a distinct input type for fields on input objects. */
export type PageInfoInput = {
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
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

export type UploadHeader = {
  __typename?: 'UploadHeader';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type UploadInstructions = {
  __typename?: 'UploadInstructions';
  headers: Array<UploadHeader>;
  method: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Viewer = {
  __typename?: 'Viewer';
  albums: AlbumCollectionPayload;
  displayName: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  mediaItems: MediaItemCollectionPayload;
};


export type ViewerAlbumsArgs = {
  input: ViewerAlbumsInput;
};


export type ViewerMediaItemsArgs = {
  input: ViewerMediaItemsInput;
};

export type ViewerAlbumItemsInput = {
  collectionInfo: AlbumItemCollectionInput;
};

export type ViewerAlbumsInput = {
  collectionInfo: AlbumCollectionInput;
};

export type ViewerMediaItemsInput = {
  collectionInfo: MediaItemCollectionInput;
};

export type CreateMediaUploadMutationVariables = Exact<{
  input: CreateMediaUploadInput;
}>;


export type CreateMediaUploadMutation = { __typename?: 'Mutation', createMediaUpload: { __typename?: 'CreateMediaUploadPayload', mediaItemId: string, status: MediaItemStatus, uploadInstructions: { __typename?: 'UploadInstructions', method: string, url: string, headers: Array<{ __typename?: 'UploadHeader', key: string, value: string }> } } };

export type FinalizeMediaUploadMutationVariables = Exact<{
  input: FinalizeMediaUploadInput;
}>;


export type FinalizeMediaUploadMutation = { __typename?: 'Mutation', finalizeMediaUpload: { __typename?: 'FinalizeMediaUploadPayload', mediaItemId: string, status: MediaItemStatus, size: number, kind: MediaKind } };

export type ViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type ViewerQuery = { __typename?: 'Query', viewer?: { __typename?: 'Viewer', id: string, firstName?: string | undefined, lastName?: string | undefined, displayName: string } | undefined };

export type ViewerRecentMediaQueryVariables = Exact<{ [key: string]: never; }>;


export type ViewerRecentMediaQuery = { __typename?: 'Query', viewer?: { __typename?: 'Viewer', id: string, mediaItems: { __typename?: 'MediaItemCollectionPayload', nodes: Array<{ __typename?: 'MediaItem', id: string, kind: MediaKind, status: MediaItemStatus, mimeType: string, title?: string | undefined, createdAt: any, width?: number | undefined, height?: number | undefined }>, pageInfo: { __typename?: 'PageInfo', limit: number, offset: number } } } | undefined };


export const CreateMediaUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMediaUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMediaUploadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMediaUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mediaItemId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadInstructions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"headers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateMediaUploadMutation, CreateMediaUploadMutationVariables>;
export const FinalizeMediaUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinalizeMediaUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FinalizeMediaUploadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finalizeMediaUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mediaItemId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}}]}}]}}]} as unknown as DocumentNode<FinalizeMediaUploadMutation, FinalizeMediaUploadMutationVariables>;
export const ViewerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}}]}}]} as unknown as DocumentNode<ViewerQuery, ViewerQueryVariables>;
export const ViewerRecentMediaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ViewerRecentMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mediaItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"collectionInfo"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"pageInfo"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"10"}},{"kind":"ObjectField","name":{"kind":"Name","value":"offset"},"value":{"kind":"IntValue","value":"0"}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"sortBy"},"value":{"kind":"EnumValue","value":"CREATED_AT"}},{"kind":"ObjectField","name":{"kind":"Name","value":"sortDir"},"value":{"kind":"EnumValue","value":"DESC"}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"offset"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ViewerRecentMediaQuery, ViewerRecentMediaQueryVariables>;