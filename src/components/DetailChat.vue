<script setup>
import { ref } from 'vue';
import { decodeString } from '@/composables/useDecode'
import { convertTimeOnly } from '@/composables/useConvert'

const props = defineProps(["dataChat"])
const emit = defineEmits(["sendMessage"])
const chat = ref('')
const cookie = decodeURIComponent(document.cookie).split(';')
const me = cookie.filter((item) => item.includes('islogin'))
const me2 = me[0]?.split('=')[1]

const inputChat = () => {
  const message = {
    id: props.dataChat.id,
    name: me2, text: chat.value, time: new Date().getTime()
  }
  emit('sendMessage', message)
  chat.value = ""
}
</script>

<template>
  <div class="chat-section">
    <div class="chat-detail">
      <div class="header-chat">
        <h5 class="text-capitalize">{{ dataChat.name }}</h5>
        <span>Online</span>
      </div>
    </div>
    <div class="detail-list">
      <div v-if="!props.dataChat.list.length" class="no-msg">No message</div>
      <template v-else>
        <div v-for="(item, i) in props.dataChat?.list" :key="i" class="list">
          <div class="avatar">{{ decodeString(item.name) }}</div>
          <div class="active">
            <p class="mb-2 text-capitalize">{{ item.name }}</p>
            <span>{{ item.text }}</span>
            <div class="d-flex justify-content-end ms-3">
              <span style="font-size: 12px;">
                {{ convertTimeOnly(item.time) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
    <form @submit.prevent="inputChat">
      <div class="row input-chat">
        <div class="col-10">
          <input type="text" class="form-control h-100" v-model="chat" placeholder="Write a message" />
        </div>
        <button type="submit" class="col-2 btn btn-primary">Send</button>
      </div>
    </form>
  </div>
</template>

<style></style>