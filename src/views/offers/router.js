import InAppPurchaseView from './InAppPurchaseView';
import InAppPurchaseForm from './InAppPurchaseForm';
// import BannersView from "./BannersView";
import OffersView from "./OffersView";
import {getUser} from '@/utils/local';
import InAppPurchaseOffersView from "@/views/offers/InAppPurchaseOffersView";
import InAppPurchaseOffersForm from "@/views/offers/InAppPurchaseOffersForm";

const offersRoutes = [
    getUser()?.scopes.includes('iaps:view') ?
        {
            name: 'IAP',
            path: '/iaps',
            component: InAppPurchaseView
        } : null,
    (getUser()?.scopes?.includes('banners:view') || getUser()?.scopes?.includes('popups:view')) ?
        {
            name: 'Offers',
            path: '/offers',
            component: OffersView
        } : null,
    (getUser()?.scopes.includes('iaps:new') || getUser()?.scopes.includes('iaps:edit')) ?
        {
            name: 'NewIAP',
            path: '/iaps/create-new',
            component: InAppPurchaseForm
        } : null,
    // getUser()?.scopes.includes('banners:view') ?
    //     {
    //         name: 'Banners',
    //         path: '/banners',
    //         component: BannersView
    //     } : null,
    getUser()?.scopes.includes('iaps-offers:view') ?
        {
            name: 'IapsOffers',
            path: '/iaps/offers',
            component: InAppPurchaseOffersView
        } : null,
    (getUser()?.scopes.includes('iaps-offers:new') || getUser()?.scopes.includes('iaps-offers:edit')) ?
        {
            name: 'NewIAPOffers',
            path: '/iaps/offer',
            component: InAppPurchaseOffersForm
        } : null,

];

export const offersRouter = offersRoutes.filter(function (x) {
    return x !== null;
})
