import UserForm from './UserForm';
import UsersView from './UsersView';
import {getUser} from "@/utils/local";
import ReviewsView from "@/views/reviews/ReviewsView";
import AccountDeletionRequestsView from "@/views/users/AccountDeletionRequestsView";
import CustomersView from "@/views/users/CustomersView";

export const usersRoutes = [
    getUser()?.scopes.includes('account-deletion:view') ?
        {
            name: 'AccountDeletionRequests',
            path: '/account-deletion-requests',
            component: AccountDeletionRequestsView
        } : null,
    getUser()?.scopes.includes('users:view') ?
        {
            name: 'Users',
            path: '/users',
            component: UsersView
        } : null,
    (getUser()?.scopes.includes('users:new') || getUser()?.scopes.includes('users:edit')) ?
        {
            name: 'NewUser',
            path: '/user',
            component: UserForm
        } : null,
    getUser()?.scopes.includes('reviews:view') ?
        {
            path: '/reviews',
            name: 'Reviews',
            component: ReviewsView
        } : null,
    getUser()?.scopes.includes('customers:view') ? {
        path: '/customers',
        name: 'Customers',
        component: CustomersView
    } : null
];

export const usersRouter = usersRoutes.filter(function (x) {
    return x !== null;
})

