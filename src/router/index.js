import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      // name: 'layout'  这里不需要加name，layout不需要显示，没有意义
      path: '/',
      component: () => import('@/views/layout'),
      // 嵌套子路由
      children: [
        {
          name: 'home',
          path: ' ',
          component: () => import('@/views/home')
        },
        {
          name: 'publish',
          path: '/publish',
          component: () => import('@/views/publish')
        }
      ]
    },
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/login')
    }
  ]
})
// 路由拦截
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  // 如果不是去登陆页面的话，就判断他有没有登陆，有的话就next，没有的话就跳转到登录页
  // 判断他有没有登陆，看登陆状态
  const loginState = window.localStorage.getItem('user_info')
  if (!loginState) {
    return next({ name: 'login' })
  }
  next()
})
export default router
