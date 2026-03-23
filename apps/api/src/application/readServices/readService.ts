import { RESOLVER, Lifetime } from "awilix";
import { Container } from "../../container";
import type { ReadViewerServices } from "../../di/generated/awilix.autoload";

/**
 * A single viewer-scoped service factory:
 *   ({ viewerId }) => { someMethod(), otherMethod() }
 */
type ViewerScopedServiceFactory<TMethods extends Record<string, unknown>> =
  (args: { viewerId: string }) => TMethods;

/**
 * Union -> intersection helper
 * Turns:
 *   { a: string } | { b: number }
 * into:
 *   { a: string } & { b: number }
 */
type UnionToIntersection<U> = (
  U extends unknown ? (arg: U) => void : never
) extends (arg: infer I) => void
  ? I
  : never;

/**
 * Given:
 *   {
 *     albumService: ({ viewerId }) => { listAlbums, getAlbumCoverMedia }
 *   }
 *
 * produce:
 *   {
 *     listAlbums,
 *     getAlbumCoverMedia
 *   }
 */
type FlattenedBoundViewerReadServices<
  T extends Record<string, ViewerScopedServiceFactory<Record<string, unknown>>>,
> = UnionToIntersection<ReturnType<T[keyof T]>>;

export type ViewerReadServices =
  FlattenedBoundViewerReadServices<ReadViewerServices>;

export type BindViewerReadServices = (args: {
  viewerId: string;
}) => ViewerReadServices;

export const buildBindViewerReadServices = ({
  readViewerServices,
}: Container): BindViewerReadServices => {
  return ({ viewerId }: { viewerId: string }): ViewerReadServices => {
    const result: Record<string, unknown> = {};

    for (const [serviceName, serviceFactory] of Object.entries(
      readViewerServices,
    )) {
      const methods = serviceFactory({ viewerId });

      for (const [methodName, method] of Object.entries(methods)) {
        if (methodName in result) {
          throw new Error(
            `Duplicate viewer read service method "${methodName}" from service "${serviceName}"`,
          );
        }

        result[methodName] = method;
      }
    }

    return result as ViewerReadServices;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(buildBindViewerReadServices as any)[RESOLVER] = {
  name: "bindViewerReadServices",
  lifetime: Lifetime.SCOPED,
};
