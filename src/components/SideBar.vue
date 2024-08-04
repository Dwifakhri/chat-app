<template>
  <div class="sidebar d-flex flex-column flex-shrink-0">
    <img src="@/assets/icon/logo.svg" alt="logo" class="mb-5 px-3">
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <RouterLink to="/chat" :class="`nav-link ${isChat ? 'active' : ''}`"  @click.prevent="logout">
          <i class="fas fa-comments d-block"></i>
          <span>Chats</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/" class="nav-link" @click.prevent="logout">
          <i class="fas fa-user d-block"></i>
          <span>Logout</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  computed: {
    isChat() {
  return this.$route.path.includes('chat')  
  }
},
  methods: {
    logout() {
      document.cookie = "islogin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }
}
</script>

<style></style>