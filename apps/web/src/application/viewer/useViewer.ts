import { useQuery } from '@apollo/client/react';
import { useAuth } from '../../contexts/AuthContext';
import { ViewerDocument, type ViewerQuery } from '../../graphql/generated/types';

export type Viewer = NonNullable<ViewerQuery['viewer']>;

export interface UseViewerResult {
  viewer?: Viewer;
  loading: boolean;
  error?: Error;
}

/**
 * Skips the Viewer query until a token exists so we do not cache `viewer: null` while logged out
 * (that stale cache was breaking post-login session).
 */
export const useViewer = (): UseViewerResult => {
  const { hasToken } = useAuth();
  const { data, loading, error } = useQuery(ViewerDocument, {
    skip: !hasToken,
  });

  return {
    viewer: data?.viewer ?? undefined,
    loading,
    error: error ?? undefined,
  };
};
