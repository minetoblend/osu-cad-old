import Vue from 'vue'
import App from './App.vue'

import {BootstrapVue} from 'bootstrap-vue'

import './style.scss'

import store from './store'
import axios from "axios";

import {library} from '@fortawesome/fontawesome-svg-core'
import {faPlay, faPause, faPlus, faArrowLeft} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

library.add(faPlay, faPause, faPlus, faArrowLeft)


Vue.component('icon', FontAwesomeIcon)


Vue.use(BootstrapVue)

Vue.prototype.$http = axios;

Vue.config.productionTip = false


new Vue({
    store,
    render: h => h(App)
}).$mount('#app')


document.onload = () => {
    document.getElementById('viewport').setAttribute('content', `width=device-width, initial-scale=${window.innerWidth / 1024}, minimum-scale=${window.innerWidth / 1024}, maximum-scale=${window.innerWidth / 1024}`)
}