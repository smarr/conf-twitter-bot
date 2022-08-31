import Router from '@koa/router';
import usersRouter from './users/users.route';
import sessionsRouter from './sessions/sessions.route';
import oAuthsRouter from './oauths/oauths.route';
import accountsRouter from './accounts/accounts.route';
import tweetsRouter from './tweets/tweets.route';
import papersRouter from './papers/papers.route';

// routes located in ./api will be prefixed with /api
const router = new Router({ prefix: '/api' });

// append additional routes to below variable to enable
const routes = [usersRouter, sessionsRouter, oAuthsRouter, accountsRouter, tweetsRouter, papersRouter];

// loop over routes to enable them
for (const route of routes) {
	router.use(route.routes(), route.allowedMethods());
}

export default router;