import { initializeContainer } from "../container";
import { createExecuteGraphQL } from "./executeGQL";
import { IocGeneratedCradle } from "../di/generated/ioc-registry.types";
import { AwilixContainer } from "awilix";

describe("GraphQL", () => {
  let executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  let container: AwilixContainer<IocGeneratedCradle>;
  beforeAll(async () => {
    container = initializeContainer();
    const yogaApp = container.resolve("yogaApp");
    executeGraphQL = createExecuteGraphQL({ yogaApp });
  });

  describe("viewer", () => {
    describe("when executing the viewer query while logged out", () => {
      it("should return null for viewer", async () => {
        const { response, json } = await executeGraphQL({
          query: `
            query {
              viewer {
                id
                displayName
              }
            }
          `,
          context: {
            isLoggedIn: false,
          },
        });

        expect(response.status).toBe(200);
        expect(json.errors).toBeUndefined();
        expect(json.data).toEqual({
          viewer: null,
        });
      });
    });

    describe("when executing the viewer query while logged in", () => {
      it("should return the current user", async () => {
        const { response, json } = await executeGraphQL({
          query: `
            query {
              viewer {
                id
                displayName
              }
            }
          `,
          context: {
            isLoggedIn: true,
          },
        });

        expect(response.status).toBe(200);
        expect(json.errors).toBeUndefined();
        expect(json.data?.viewer).toBeTruthy();
        expect(json.data?.viewer?.id).toBe("viewer-1");
        expect(json.data?.viewer?.displayName).toBe("Demo User");
      });
    });
  });
});
