import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import i18n from '../i18n'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
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
    path: '/news/:id',
    name: 'DynamicDetail',
    component: () => import('../views/news/dynamicDetail.vue'),
    meta: { title: 'dynamicDetail' }
  },
  {
    path: '/facilities',
    name: 'Facilities',
    component: () => import('../views/facilities/facilities.vue'),
    meta: { title: 'facilities' }
  },
  {
    path: '/facilities/instruments/:id',
    name: 'InstrumentDetail',
    component: () => import('../views/facilities/instrumentDetail.vue'),
    meta: { title: 'instrumentDetail' }
  },
  {
    path: '/notices',
    name: 'Notices',
    component: () => import('../views/notices/notices.vue'),
    meta: { title: 'notices' }
  },
  {
    path: '/notices/:id',
    name: 'NoticeDetail',
    component: () => import('../views/notices/noticeDetail.vue'),
    meta: { title: 'noticeDetail' }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: () => import('../views/tools/tools.vue'),
    meta: { title: 'tools' }
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

// 更新页面标题的函数
const updatePageTitle = (titleKey?: string) => {
  if (titleKey) {
    const t = i18n.global.t
    const pageTitle = t(`titles.${titleKey}`)
    const siteTitle = t('global.title')
    document.title = `${pageTitle} - ${siteTitle}`
  }
}

// 路由前置守卫，用于修改页面标题
router.beforeEach((to, from, next) => {
  // 设置国际化标题
  updatePageTitle(to.meta.title as string)
  next()
})

// 监听语言变化，更新当前页面标题
if (typeof window !== 'undefined') {
  window.addEventListener('localeChange', () => {
    const currentRoute = router.currentRoute.value
    if (currentRoute.meta.title) {
      updatePageTitle(currentRoute.meta.title as string)
    }
  })
}

export default router
