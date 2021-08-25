import cookieParser from 'cookie-parser';
import express from 'express';
import { Container } from 'final-di';

import { INJECTION_TOKEN } from './index';
import { RestApplication } from '../classes/rest-application';

export function initExpressApplication(): express.Application {
  let app: express.Application;
  try {
    app = Container.getInstance().getService<express.Application>(INJECTION_TOKEN);
  } catch (e) {
    app = express();
    const injectionToken = {
      name: INJECTION_TOKEN,
      useValue: app,
      afterInit: (app: express.Application) => {
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cookieParser());
        app.use(RestApplication.handleRequest);
      }
    };
    Container.getInstance().register(injectionToken, injectionToken as any);
  }
  return app;
}
