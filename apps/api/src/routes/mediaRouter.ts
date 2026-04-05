import Router from '@koa/router';
import { koaBody } from 'koa-body';
import { IocGeneratedCradle } from '../di/generated/ioc-registry.types';

export const buildMediaRouter = ({ mediaController }: IocGeneratedCradle): Router => {
  const router = new Router({ prefix: '/media' });

  router.put('/uploads/:mediaItemId', koaBody({ multipart: true }), mediaController.upload);

  return router;
};
