import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/home/home.vue'),
    meta: { title: 'home' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/about/about.vue'),
    meta: { title: 'about' }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('../views/members/members.vue'),
    meta: { title: 'members' }
  },
  {
    path: '/members/:userId',
    name: 'UserDetail',
    component: () => import('../views/members/userDetail.vue'),
    meta: { title: 'userDetail' }
  },
  {
    path: '/research',
    name: 'Research',
    component: () => import('../views/research/reaearch.vue'),
    meta: { title: 'research' }
  },
  {
    path: '/research/papers',
    name: 'PapersList',
    component: () => import('../views/research/papersList.vue'),
    meta: { title: 'papersList' }
  },
  {
    path: '/research/papers/:id',
    name: 'PaperDetail',
    component: () => import('../views/research/paperDetail.vue'),
    meta: { title: 'paperDetail' }
  },
  {
    path: '/research/patents/:id',
    name: 'PatentDetail',
    component: () => import('../views/research/patentDetail.vue'),
    meta: { title: 'patentDetail' }
  },
  {
    path: '/research/books/:id',
    name: 'BookDetail',
    component: () => import('../views/research/bookDetail.vue'),
    meta: { title: 'bookDetail' }
  },
  {
    path: '/research/patents',
    name: 'PatentsList',
    component: () => import('../views/research/patentsList.vue'),
    meta: { title: 'patentsList' }
  },
  {
    path: '/research/books',
    name: 'BooksList',
    component: () => import('../views/research/booksList.vue'),
    meta: { title: 'booksList' }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../views/news/news.vue'),
    meta: { title: 'news' }
  },
  {
    path: '/facilities',
    name: 'Facilities',
    component: () => import('../views/facilities/facilities.vue'),
    meta: { title: 'facilities' }
  },
  {
    path: '/join',
    name: 'Join',
    component: () => import('../views/join/join.vue'),
    meta: { title: 'join' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/notFound.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由前置守卫，用于修改页面标题
router.beforeEach((to, from, next) => {
  // 设置标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Synthetic Biology Research Institute`
  }
  next()
})

export default router
