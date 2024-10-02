<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { decodeString } from '@/composables/useDecode'
import { convertTimeOnly } from '@/composables/useConvert'
import { useRoute } from 'vue-router';
const route = useRoute()

const props = defineProps(["dataChat", "isOnline", "me"])
const emit = defineEmits(["sendMessage", "readChat"])
const chat = ref("")

onMounted(() => {
  if (route.params.id === props.dataChat.id) {
    emit("readChat", { to: props.dataChat.id, isGroup: props.dataChat.isGroup, from: props.me })
  }
})

watch(() => route.params.id, () => {
  if (route.params.id === props.dataChat.id) {
    emit("readChat", { to: props.dataChat.id, isGroup: props.dataChat.isGroup, from: props.me })
  }
})

const member = computed(() => {
  if (props.dataChat.isGroup) {
    return props.dataChat.member.filter(item => item !== props.me)
  }
  return null
})

const inputChat = () => {
  const message = {
    to: props.dataChat.id,
    from: props.me,
    isGroup: props.dataChat.isGroup,
    ...props.dataChat.isGroup && { member: props.dataChat.member },
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
          <template v-if="!props.dataChat.isGroup">
            <span>{{ props.isOnline ? 'Online' : 'Offline' }}</span>
            <span v-if="props.isOnline" class="online position-static"></span>
          </template>
          <template v-else>
            <span v-for="(item, i) in ['you', ...member]" :key="i">
              {{ i !== props.dataChat.member.length - 1 ? (item + ",") :
                " " + item }}
            </span>
          </template>
        </div>
      </div>
    </div>
    <div class="detail-list">
      <div v-if="!props.dataChat?.list?.length" class="no-msg">No message</div>
      <template v-else>
        <div v-for="(item, i) in props?.dataChat?.list" :key="i" :id="'chat' + i"
          :class="`list ${item.isInfo ? 'justify-content-center' : item.name === props.me ? 'justify-content-end' : ''}`">
          <!-- <div v-if="props.dataChat.isGroup && item.name !== props.me" class="avatar">{{ decodeString(item.name) }}
          </div> -->
          <div class="active py-2" :style="{ 'background-color': item.isInfo && '#23262d' }">
            <div v-if="item.isInfo" style="font-size: 14px;">
              <span v-if="!item.isLeave" class="text-gray"> <b class="text-capitalize">{{ item.name === props.me ? 'You'
                : item.name }}</b>
                joined group at {{
                  convertTimeOnly(item.time)
                }}</span>
              <span v-else class="text-gray "><b class="text-capitalize"> {{ item.name === props.me ? 'you' : item.name
                  }}</b> left group at {{
                    convertTimeOnly(item.time)
                  }}</span>
            </div>
            <template v-else>
              <p v-if="props.dataChat.isGroup" class="text-capitalize">{{ item.name === props.me ? 'you' : item.name }}
              </p>
              <span>{{ item.text }}</span>
              <div class="d-flex justify-content-end align-items-center ms-3">
                <span style="font-size: 12px;">
                  {{ convertTimeOnly(item.time) }}
                </span>
                <div v-if="item.name === props.me" class="ms-1 check mt-0"
                  :style="`background-color: ${item.isRead ? '#3395ed' : 'grey'}`" />
              </div>
            </template>
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