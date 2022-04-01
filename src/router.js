import Vue from 'vue';
import VueRouter from 'vue-router';
import SignInView from './views/auth/SignIn';
import NotFound from './views/404.vue';
import Dashboard from './components/Dashboard';
import Home from './views/home.vue'

import {usersRouter} from './views/users/router';
import {notificationsRouter} from './views/notifications/router';
import {questionsRouter} from './views/questions/router';
import {eventsRouter} from './views/events/router';
import {offersRouter} from './views/offers/router';
import {flashcardsRouter} from "@/views/flashcards/router";
import {institutionsRouter} from "@/views/institutions/router";

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        component: Dashboard,
        children: [
            {
                path: '/',
                component: Home
            },
            ...usersRouter,
            ...notificationsRouter,
            ...questionsRouter,
            ...eventsRouter,
            ...offersRouter,
            ...flashcardsRouter,
            ...institutionsRouter,
        ]
    },
    {
        name: 'SignIn',
        path: '/auth/sign-in',
        component: SignInView
    },
    {
        name: 'NotFound',
        path: '**',
        component: NotFound
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

// eslint-disable-next-line no-unused-vars
router.beforeEach((to, __, next) => {
    if (!localStorage.getItem('auth_token')) {
        if (to.path !== '/auth/sign-in') {
            next('/auth/sign-in');
        }
    }

    next();
});

export default router;
