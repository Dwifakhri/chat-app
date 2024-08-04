import Login from "@/views/Login.vue"
import Index from "@/views/Chats/Index.vue"
import _chat from "@/views/Chats/_chat.vue"
import { createRouter, createWebHistory } from "vue-router"
import { loadLayoutMiddleware } from "@/router/middleware.js"
import defaultLayout from "@/layouts/default.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Login,
    },
    {
      path: "/chat",
      name: "chat",
      component: Index,
      meta: {
        layout: defaultLayout,
      },
      children: [
        {
          name: "detail",
          path: "detail/:id",
          component: _chat,
        },
      ],
    },
  ],
})

// router.beforeEach(loadLayoutMiddleware)

export default router
