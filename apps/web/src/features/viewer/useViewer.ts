import { useViewerQuery } from "../../graphql/generated/types";
import type { ViewerQuery } from "../../graphql/generated/types";

export type Viewer = NonNullable<ViewerQuery["viewer"]>;

export interface UseViewerResult {
  viewer?: Viewer;
  loading: boolean;
  error?: Error;
}

export const useViewer = (): UseViewerResult => {
  const { data, loading, error } = useViewerQuery();

  return {
    viewer: data?.viewer ?? undefined,
    loading,
    error: error ?? undefined,
  };
};
