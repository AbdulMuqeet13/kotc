import NotificationsView from './NotificationsView';
import NotificationForm from './NotificationForm';
import {getUser} from "@/utils/local";

const notificationsRoutes = [
  getUser()?.scopes.includes('notifications:view') ?
  {
    name: 'Notifications',
    path: '/notifications',
    component: NotificationsView
  } : null,
  (getUser()?.scopes.includes('notifications:new') || getUser()?.scopes.includes('notifications:edit')) ?
  {
    name: 'NewNotification',
    path: '/notification',
    component: NotificationForm
  } : null
];

export const notificationsRouter = notificationsRoutes.filter(function(x) {
  return x !== null;
})
