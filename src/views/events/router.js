import EventsForm from "@/views/events/EventsForm";
import EventsViewTest from "@/views/events/EventsViewTest";
import {getUser} from '@/utils/local';

const eventsRoutes = [
  getUser()?.scopes.includes('events:view') ? {
    name: 'Events',
    path: '/Events',
    component: EventsViewTest
  } : null,
  (getUser()?.scopes.includes('events:new') || getUser()?.scopes.includes('events:edit')) ?
  {
    name: 'NewEvent',
    path: '/Event',
    component: EventsForm
  } : null,

  // {
  //   name: 'NewNotification',
  //   path: '/notification',
  //   component: NotificationForm
  // }
];

export const eventsRouter = eventsRoutes.filter(function(x) {
  return x !== null;
})
