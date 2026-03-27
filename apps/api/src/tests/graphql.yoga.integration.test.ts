import { container, initializeContainer } from "../container";
import { initLogger } from "../logger";
import { config } from "../config";
import { createExecuteGraphQL } from "./executeGQL";

describe("GraphQL", () => {
  let executeGraphQL: ReturnType<typeof createExecuteGraphQL>;

  beforeAll(async () => {
    const logger = initLogger();
    initializeContainer(logger, config);
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
