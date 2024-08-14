<script setup>
import { onMounted, ref, watch } from 'vue';
import { decodeString } from '@/composables/useDecode'
import { convertTimeOnly } from '@/composables/useConvert'

const props = defineProps(["dataChat", "isOnline", "me"])
const emit = defineEmits(["sendMessage", "readChat"])
const chat = ref("")

onMounted(() => {
  emit("readChat", { to: props.dataChat.id, isGroup: props.dataChat.isGroup, from: props.me })
})

const inputChat = () => {
  const message = {
    to: props.dataChat.id,
    from: props.me,
    isGroup: props.dataChat.isGroup,
    list: {
      id: props.dataChat.list.length ? props.dataChat.list.length : 0,
      name: props.me,
      text: chat.value,
      isSent: false,
      isRead: false
    }
  }
  emit('sendMessage', message)
  const chatList = document.querySelector('.detail-list')
  window.scrollTo(0, chatList.scrollHeight)
  chat.value = ""
}

</script>

<template>
  <div class="chat-section">
    <div class="chat-detail">
      <div class="header-chat">
        <h5 class="text-capitalize">{{ props.dataChat?.name }}</h5>
        <div class="d-flex align-items-center">
          <span>{{ props.isOnline ? 'Online' : 'Offline' }}</span>
          <span class="online position-static"></span>
        </div>
      </div>
    </div>
    <div class="detail-list">
      <div v-if="!props.dataChat?.list?.length" class="no-msg">No message</div>
      <template v-else>
        <div v-for="(item, i) in props?.dataChat?.list" :key="i" :id="'chat' + i"
          :class="`list ${item.name === props.me ? 'justify-content-end' : ''}`">
          <!-- <div v-if="item.name !== props.me" class="avatar">{{ decodeString(item.name) }}</div> -->
          <div class="active py-2">
            <!-- <p class="text-capitalize">{{ item.name === props.me ? 'You' : item.name }}</p> -->
            <span>{{ item.text }}</span>
            <div class="d-flex justify-content-end align-items-center ms-3">
              <span style="font-size: 12px;">
                {{ convertTimeOnly(item.time) }}
              </span>
              <div v-if="item.name === props.me" class="ms-1 check mt-0"
                :style="`background-color: ${item.isRead ? '#3395ed' : 'grey'}`" />
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