<script setup>
import { ref, computed, onMounted } from 'vue';
import DetailChat from '@/components/DetailChat.vue'
import { decodeString } from '@/composables/useDecode'
import { convertTime } from '@/composables/useConvert'
import { useRoute } from 'vue-router';
import io from "socket.io-client"

const socket = io("http://127.0.0.1:3000")
const detail = ref([
  {
    id: 0, name: 'john', list:
      [
        { id: 0, name: 'john', text: 'Hay Doe', time: 1722519615000 },
      ]
  },
  {
    id: 1, name: 'office', list:
      [
        { id: 0, name: 'office', text: 'Announcement', time: 1722436860000 }
      ]
  }
])

const isDetail = computed(() => {
  return useRoute().name === 'detail'
})

const chats = computed(() => {
  if (detail.value.length) {
    return detail.value.map((item) => {
      return {
        id: item.id,
        name: item.name,
        lastText: item.list[item.list.length - 1]?.text,
        lastUpdate: item.list[item.list.length - 1]?.time,
      }
    })
  }
  return []
})

const detailChat = computed(() => {
  if (isDetail.value) {
    return detail.value.filter((item) => +useRoute().params.id === item.id)[0]
  }
  return null
})

onMounted(() => {
  socket.on("connect", () => {
    console.log("connected-" + socket.id)
  });

  socket.on("broadcast", (arg) => {
    console.log(arg)
  })

  socket.on("chat", (arg) => {
    const existChat = detail.value.find((item) => item.id === arg.id)
    if (existChat) {
      detail.value.map((item) => {
        if (existChat.id === item.id) {
          item.list.push(
            { id: item.list.length, name: arg.name, text: arg.text, time: arg.time }
          )
        }
      })
    } else {
      const newChat = {
        id: arg.id, name: arg.name, list:
          [
            { id: 0, name: arg.name, text: arg.text, time: arg.time }
          ]
      }
      detail.value.push(newChat)
    }
  })

  socket.on("disconnect", () => {
    console.log("disconnect-" + socket.id)
  })
})

const onSubmit = (e) => {
  socket.emit("chat", e)
}
</script>

<template>
  <div class="row">
    <div class="col-3 px-0">
      <div class="chat-list chat-section">
        <div class="px-3 mb-3 mt-1">
          <input type="text" placeholder="Search" class="form-control">
        </div>
        <div>
          <router-link v-for="(item, i) in chats" :key="i" :to="`/chat/detail/${item.id}`" class="list">
            <div class="avatar">{{ decodeString(item.name) }}</div>
            <div>
              <p class="text-capitalize">{{ item.name }}</p>
              <span>{{ item.lastText }}</span>
            </div>
            <div class="ms-auto">
              <span>
                {{ convertTime(item.lastUpdate) }}
              </span>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <div class="col-9">
      <div v-if="!isDetail" class="d-flex align-items-center justify-content-center h-100">
        <p>Select chat to start messaging</p>
      </div>
      <template v-else>
        <detail-chat :data-chat="detailChat" @send-message="onSubmit">
        </detail-chat>
      </template>
    </div>
  </div>
</template>