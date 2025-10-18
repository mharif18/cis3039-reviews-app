import { createRouter, createWebHistory } from 'vue-router';
import ListReviews from '@/views/ListReviews.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ListReviews,
    },
  ],
});

export default router;
