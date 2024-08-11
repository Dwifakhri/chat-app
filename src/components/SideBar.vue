<template>
  <div class="sidebar d-flex flex-column flex-shrink-0">
    <div class="mb-5 text-center">
      <div class="px-3">
        <div class="position-relative">
          <img src="https://t4.ftcdn.net/jpg/01/24/65/69/360_F_124656969_x3y8YVzvrqFZyv3YLWNo6PJaC88SYxqM.jpg"
            alt="logo" class="photo-profile">
          <span class="online"></span>
        </div>
      </div>
      <p class="text-truncate px-3">{{ me }}</p>
    </div>
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <RouterLink to="/chat" :class="`nav-link ${isChat ? 'active' : ''}`">
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
  props: {
    me: {
      type: String,
      default: ''
    }
  },
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