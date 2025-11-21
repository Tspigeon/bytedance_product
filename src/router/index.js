import { createRouter, createWebHistory } from 'vue-router'
import DeskTop from '../components/Desktop.vue'
import ProductDetails from '../components/Details.vue'

const routes = [
  {
    path: '/',
    name: 'DeskTop',
    component: DeskTop
  },
  {
    path: '/details/:id',
    name: 'ProductDetails',
    component: ProductDetails,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router