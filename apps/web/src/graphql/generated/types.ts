import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
  DateTime: { input: any; output: any };
};

export type Album = Node & {
  __typename?: "Album";
  coverMedia?: Maybe<MediaItem>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type MediaItem = Node & {
  __typename?: "MediaItem";
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  durationSeconds?: Maybe<Scalars["Int"]["output"]>;
  height?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  kind: MediaKind;
  mimeType: Scalars["String"]["output"];
  sizeBytes: Scalars["Int"]["output"];
  status: MediaItemStatus;
  storageKey: Scalars["String"]["output"];
  takenAt?: Maybe<Scalars["DateTime"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
  width?: Maybe<Scalars["Int"]["output"]>;
};

export type MediaItemStatus = "FAILED" | "PENDING" | "READY";

export type MediaKind = "PHOTO" | "VIDEO";

/** Implemented by all entities that have an id. */
export type Node = {
  id: Scalars["ID"]["output"];
};

export type PageInfo = {
  __typename?: "PageInfo";
  endCursor?: Maybe<Scalars["String"]["output"]>;
  hasNextPage: Scalars["Boolean"]["output"];
};

export type Query = {
  __typename?: "Query";
  shareLink?: Maybe<ShareLinkAccess>;
  viewer?: Maybe<Viewer>;
};

export type QueryShareLinkArgs = {
  token: Scalars["String"]["input"];
};

export type ShareLinkAccess = {
  __typename?: "ShareLinkAccess";
  target: ShareLinkTarget;
  token: Scalars["ID"]["output"];
  viewerRelationship: ShareViewerRelationship;
};

export type ShareLinkTarget = SharedAlbum | SharedMediaItem;

export type ShareViewerRelationship =
  | "ANONYMOUS"
  | "AUTHENTICATED"
  | "MEMBER"
  | "OWNER";

export type SharedAlbum = Node & {
  __typename?: "SharedAlbum";
  id: Scalars["ID"]["output"];
  items: SharedAlbumItemConnection;
  title: Scalars["String"]["output"];
};

export type SharedAlbumItemsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
};

export type SharedAlbumItem = Node & {
  __typename?: "SharedAlbumItem";
  id: Scalars["ID"]["output"];
  media: SharedMediaItem;
};

export type SharedAlbumItemConnection = {
  __typename?: "SharedAlbumItemConnection";
  nodes: Array<SharedAlbumItem>;
  pageInfo: PageInfo;
};

export type SharedMediaItem = Node & {
  __typename?: "SharedMediaItem";
  displayUrl: Scalars["String"]["output"];
  height?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  width?: Maybe<Scalars["Int"]["output"]>;
};

export type SortDir = "ASC" | "DESC";

export type Viewer = {
  __typename?: "Viewer";
  albums: Array<Album>;
  displayName: Scalars["String"]["output"];
  firstName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  lastName?: Maybe<Scalars["String"]["output"]>;
};

export type ViewerQueryVariables = Exact<{ [key: string]: never }>;

export type ViewerQuery = {
  __typename?: "Query";
  viewer?:
    | {
        __typename?: "Viewer";
        id: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        displayName: string;
      }
    | undefined;
};

export const ViewerDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Viewer" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "viewer" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "firstName" } },
                { kind: "Field", name: { kind: "Name", value: "lastName" } },
                { kind: "Field", name: { kind: "Name", value: "displayName" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ViewerQuery, ViewerQueryVariables>;
