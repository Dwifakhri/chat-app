<script>
import SideBar from '@/components/SideBar.vue'

export default {
  components: { SideBar },
  computed: {
    me() {
      const cookie = decodeURIComponent(document.cookie).split(';')
      const authme = cookie.filter((item) => item.includes('islogin'))
      return authme[0]?.split('=')[1]
    }
  },
  mounted() {
    this.checkCookie()
  },
  methods: {
    checkCookie() {
      const cookie = decodeURIComponent(document.cookie)
      if (!cookie.includes('islogin')) {
        this.$router.push('/')
      }
      return
    }
  }
}

</script>
<template>
  <div class="position-relative">
    <SideBar :me="me" />
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style></style>