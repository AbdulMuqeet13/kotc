import {getUser} from "@/utils/local";
import InstitutionsView from "@/views/institutions/InstitutionsView";

const institutionsRoutes = [
    getUser()?.scopes.includes('institutions:view') ?
        {
            name: 'Institutions',
            path: '/institutions',
            component: InstitutionsView
        } : null,
];

export const institutionsRouter = institutionsRoutes.filter(function(x) {
    return x !== null;
})
