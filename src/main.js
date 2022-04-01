import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import FlowyPlugin from '@hipsjs/flowy-vue';
import router from './router';
import axios from "axios";
import {firestorePlugin} from "vuefire";
import VueChartJs from 'vue-chartjs';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import {registerPlugin} from 'filepond';


registerPlugin(FilePondPluginImagePreview)

Vue.config.productionTip = false;

import './assets/style.sass';

import '@hipsjs/flowy-vue/dist/lib/flowy-vue.css';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import 'filepond-plugin-media-preview/dist/filepond-plugin-media-preview.css';
import 'filepond-plugin-pdf-preview/dist/filepond-plugin-pdf-preview.css';

Vue.prototype.$axios = axios
// axios.defaults.baseURL = 'http://192.168.100.212:5000'
axios.defaults.baseURL = 'https://api.kingofthecurve.org/v2'

axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.common["Authorization"] = token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);
axios.interceptors.response.use(
    response => {
        if (response.status === 200 || response.status === 201) {
            return Promise.resolve(response);
        } else {
            return Promise.reject(response);
        }
    },
    error => {
        if (error.response.status) {
            switch (error.response.status) {
                case 401:
                    localStorage.removeItem('auth_token')
                    localStorage.removeItem('auth_user')

                    break;
            }
            return Promise.reject(error.response);
        }
    }
);


Vue.use(FlowyPlugin);
Vue.use(VueChartJs);
Vue.use(firestorePlugin);
new Vue({
    vuetify,
    FlowyPlugin,
    VueChartJs,
    router,
    render: (h) => h(App)
}).$mount('#app');
