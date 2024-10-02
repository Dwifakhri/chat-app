<script>
import SideBar from '@/components/SideBar.vue'

export default {
  components: { SideBar },
  computed: {
    me() {
      // const cookie = decodeURIComponent(document.cookie).split(';')
      // const authme = cookie.filter((item) => item.includes('islogin'))
      return sessionStorage.getItem("islogin")
    }
  },
  mounted() {
    this.checkSession()
  },
  methods: {
    checkSession() {
      const session = sessionStorage.getItem("islogin")
      if (!session) {
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