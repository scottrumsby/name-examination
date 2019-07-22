/* eslint-disable */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import axios from 'axios'
import Vuelidate from 'vuelidate'
import BootstrapVue from 'bootstrap-vue'
import { Plugin } from 'vue-fragment'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '../static/stylus/overrides.styl'

import router from '@/router'
import store from '@/store'

Vue.use(Vuetify)
Vue.use(Vuelidate)
Vue.use(require('vue-shortkey'))
Vue.use(BootstrapVue)
Vue.use(Plugin)

//axios.defaults.baseURL =  <-- set in setttings and auto login
axios.defaults.headers.get['Accept'] = 'application/json'
axios.defaults.headers.put['Content-Type'] = 'application/json'

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
