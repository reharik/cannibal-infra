declare module 'supertest' {
  import type { Server } from 'node:http';

  export interface SupertestResponse {
    status: number;
    body: unknown;
  }

  /** Fluent client returned by `request(server)`; the chain is awaitable. */
  export interface SupertestTest {
    put(url: string): SupertestTest;
    set(field: string, value: string): SupertestTest;
    attach(
      field: string,
      file: Buffer,
      options: { filename: string; contentType: string },
    ): SupertestTest;
    then<TResult1 = SupertestResponse, TResult2 = never>(
      onfulfilled?: (value: SupertestResponse) => TResult1 | PromiseLike<TResult1>,
      onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
    ): Promise<TResult1 | TResult2>;
  }

  function request(server: Server): SupertestTest;
  export default request;
}
