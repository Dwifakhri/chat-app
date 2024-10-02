<script>
export default {
  name: "recordView",
  data() {
    return {
      username: "",
      authExpired: 30,
      loading: false
    };
  },
  mounted() {
    this.checkSession()
    // this.$socket.on("connect", () => {
    //   console.log("connected-" + this.$socket.id)
    // });

    // this.$socket.on("broadcast", (data) => {
    //   // this.countTime()
    //   // console.log(data);
    //   let x = 0
    //   if (data) {
    //     let a = 1000 + new Date().getMilliseconds()
    //     // console.log(a - x);
    //     x = a
    //   }
    //   // this.playNextChunk(data)
    // })

    // this.$socket.on("disconnect", () => {
    //   console.log("disconnect-" + this.$socket.id)
    // })
  },
  methods: {
    checkSession() {
      const session = sessionStorage.getItem("islogin")
      if (session) {
        this.$router.push('/chat')
      }
      return
    },
    login() {
      this.loading = true
      // const expires = new Date(new Date().getTime() + this.authExpired * 60000)
      sessionStorage.setItem("islogin", this.username)
      setTimeout(() => {
        // document.cookie = `islogin=${this.username}; expires=${expires}`
        this.$router.push("/chat")
      }, 500);
    }
  }
};
</script>

<template>
  <div class="container vh-100 d-flex align-items-center">
    <form @submit.prevent="login" class="box">
      <div class="text-center mb-5">
        <img src="@/assets/icon/logo.svg" alt="logo">
      </div>
      <h4>Enter your name to start chat</h4>
      <div class="form-group">
        <input type="text" class="form-control" v-model="username" autofocus>
      </div>
      <button class="btn btn-primary mt-4 w-100" :disabled="!username || loading" f>Login</button>
    </form>
  </div>
</template>
<style></style>