<script>
import SideBar from '@/components/SideBar.vue'

export default {
  components: { SideBar },
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
    <SideBar />
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style></style>