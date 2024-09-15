<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import DetailChat from '@/components/DetailChat.vue'
import { decodeString } from '@/composables/useDecode'
import { convertTime } from '@/composables/useConvert'
import { useRoute, useRouter } from 'vue-router';
import io from "socket.io-client"

const detail = ref([])
const online = ref([])
const groups = ref([])
const me = sessionStorage.getItem("islogin")
const showBtn = ref(false)
const socket = ref({})
const router = useRouter()
const route = useRoute()
const groupName = ref('')
const selectedUsers = ref([])
const selectedGroup = ref('')

const isDetail = computed(() => {
  return route.name === 'detail'
})

const chats = computed(() => {
  if (detail.value.length) {
    return detail.value.map((item) => {
      return {
        id: item.id,
        from: item.from,
        name: item.name || '',
        lastText: item.list[item.list.length - 1]?.text || '',
        lastUpdate: item.list[item.list.length - 1]?.time,
        unreadChat: item.list.filter(item => !item.isSent && item.name !== me)?.length,
        isRead: item.list[item.list.length - 1]?.isRead
      }
    })
  }
  return []
})

const detailChat = computed(() => {
  if (isDetail.value) {
    return detail.value.filter((item) => useRoute().params.id === item.id)[0]
  }
  return null
})

const onlineUsers = computed(() => {
  return Object.values(online.value).filter((item) => item !== me)

})

onMounted(() => {
  socket.value = io("http://127.0.0.1:3000")

  if (socket) {
    socket.value?.emit("join", me)
    socket.value?.on("users", (arg) => {
      online.value = arg
    })

    socket.value?.on("groups", (arg) => {
      groups.value = arg
    })

    socket.value?.on("roomx", (arg) => {
      const existChat = detail.value.find((item) => item.id === arg.room)
      if (existChat) {
        detail.value = detail.value.map((obj) => {
          if (obj.id === arg.room) {
            if (!arg.isInvite) {
              return { ...obj, member: [...obj.member, arg.name] }
            } else {
              return { ...obj, member: [...obj.member] }
            }
          }
          return obj
        })
      } else {
        detail.value.push({
          id: arg.room, name: arg.room, isGroup: true, member: [...arg.member], list: []
        })
      }
    })

    socket.value?.on("room", (arg) => {
      socket.value.emit("joinRoom", { name: me, room: arg.room, isInvite: true })
      const existChat = detail.value.find((item) => item.id === arg.room)
      if (!existChat) {
        detail.value.push({
          id: arg.room, name: arg.room, isGroup: true, member: arg.name, list: []
        })
      }
    })

    socket.value?.on("readMessage", (arg) => {
      detail.value = detail.value.map((obj) => {
        if (obj.id === arg.from) {
          const list = obj.list.map((item) =>
            ({ ...item, isRead: true })
          )
          return { ...obj, list }
        } return obj
      })
    })

    socket.value?.on("chatMessage", (arg) => {
      let isExistChat
      if (arg.isGroup) {
        isExistChat = detail.value.find((item) => item.id.includes(arg.to))
      } else {
        isExistChat = detail.value.find((item) => item.id.includes(arg.from))
      }
      if (isExistChat) {
        let from = arg.isGroup ? arg.to : arg.from
        detail.value = detail.value.map((obj) => {
          if (obj.id === from && arg.from !== me) {
            const newObj = {
              ...obj, from: from,
              list: route?.params?.id === from ? [...obj.list, { ...arg.list, isSent: true }] : [...obj.list, arg.list]
            }
            if (route?.params?.id === from) {
              socket.value?.emit("read", { to: from, isGroup: arg.isGroup, from: me })
            }
            return newObj
          } return obj
        })

      } else {
        let from = arg.isGroup ? arg.to : arg.from
        const newChat = {
          id: from, name: from, from: from, isGroup: arg.isGroup, ...arg.isGroup && { member: arg.member }, list: [arg.list]
        }
        return detail.value.push(newChat)
      }
    })
  }
})

onUnmounted(() => {
  // socket.value?.emit("leaveRoom", { name: me })
  socket.value.disconnect()
})

const onSubmit = (e) => {
  let obj = e
  Object.assign({}, obj)
  obj.list.time = new Date().getTime()
  const existChat = detail.value.find((item) => item.id === obj.to)
  existChat.from = obj.from
  existChat.list.push(obj.list)
  socket.value.emit("chat", obj)
}

const checkOnline = (val) => {
  return Object.values(online.value).includes(val) && val !== me
}

const create = (val) => {
  const existChat = detail.value.find((item) => item.id === val)
  if (!existChat) {
    detail.value.push({
      id: val, name: val, from: me, isGroup: false, list: []
    })
  }
  router.push(`/chat/detail/${val}`)
}

const readChat = (val) => {
  detail.value = detail.value.map((obj) => {
    if (obj.id === val.to) {
      const list = obj.list.map((item) =>
        ({ ...item, isSent: true })
      )
      return { ...obj, list }
    } return obj
  })
  socket.value.emit("read", val)
}

const createGroup = () => {
  const existChat = detail.value.find((item) => item.id === groupName.value)
  if (!existChat) {
    detail.value.push({
      id: groupName.value, name: groupName.value, isGroup: true, member: [...selectedUsers.value, me], list: []
    })
    socket.value?.emit("inviteRoom", { name: [...selectedUsers.value, me], room: groupName.value })
  }
  router.push(`/chat/detail/${groupName.value}`)
  groupName.value = ""
}

const joinGroup = () => {
  socket.value.emit("joinRoom", { name: me, room: selectedGroup.value, isInvite: false })
}

</script>

<template>
  <div class="row position-relative">
    <template v-if="useRoute().name === 'chat'">
      <div class="new btn-plus" @click.prevent="showBtn = !showBtn">
        <img src="@/assets/icon/plus.svg" alt="plus">
      </div>
      <div :class="`new ${showBtn ? 'btn-chat-show' : 'btn-chat'}`" type="button" data-bs-toggle="modal"
        data-bs-target="#usersModal">
        <img src="@/assets/icon/chat.svg" alt="chat">
      </div>
      <div :class="`new ${showBtn ? 'btn-grp-show' : 'btn-grp'}`" type="button" data-bs-toggle="modal"
        data-bs-target="#groupModal">
        <img src="@/assets/icon/users.svg" alt="grp">
      </div>
    </template>
    <div class="col-3 px-0">
      <div class="chat-list chat-section">
        <div class="px-3 mb-3 mt-1">
          <input type="text" placeholder="Search" class="form-control">
        </div>
        <template v-if="chats.length">
          <router-link v-for="(item, i) in chats" :key="i" :to="`/chat/detail/${item.id}`" class="list">
            <div class="position-relative py-1 w-25 me-2">
              <div class="avatar">{{ decodeString(item.name) }}<span v-if="checkOnline(item.name)"
                  class="online"></span></div>
            </div>
            <div class="w-50">
              <p class="text-capitalize">{{ item.name }}</p>
              <p class="text-truncate chat-text">{{ item.lastText }}</p>
            </div>
            <div class="w-25 text-end">
              <span class="d-block">
                {{ convertTime(item.lastUpdate) }}
              </span>
              <div class="d-flex justify-content-end align-items-center">
                <div v-if="item.from === me && item.lastText" class="check"
                  :style="`background-color: ${item.isRead ? '#3395ed' : 'grey'}`" />
                <span v-if="item.unreadChat && item.from !== me" class="number-chat">{{ item.unreadChat }}</span>
              </div>
            </div>
          </router-link>
        </template>
        <div v-else class="px-3">
          <button class="btn btn-primary w-100" type="button" data-bs-toggle="modal" data-bs-target="#usersModal">
            New message
          </button>
          <button class="btn btn-success w-100 mt-2" type="button" data-bs-toggle="modal" data-bs-target="#joinGroup">
            Join group
          </button>
        </div>
      </div>
    </div>

    <div class="col-9">
      <div v-if="!isDetail" class="d-flex align-items-center justify-content-center h-100">
        <p>Select chat to start messaging</p>
      </div>
      <template v-else>
        <detail-chat :data-chat="detailChat" :isOnline="checkOnline(detailChat.id)" :me="me" @send-message="onSubmit"
          @read-chat="readChat">
        </detail-chat>
      </template>
    </div>
  </div>
  <div class="modal fade" id="usersModal" tabindex="-1" aria-labelledby="usersModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5 text-white" id="usersModalLabel">Select user</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="onlineUsers.length" class="chat-list">
            <div v-for="(item, i) in onlineUsers" :key="i" class="list align-items-center py-2 px-3"
              data-bs-dismiss="modal" @click.prevent="create(item)">
              <div class="me-3 py-1">
                <div class="avatar">{{ decodeString(item) }}<span v-if="checkOnline(item)" class="online"></span>
                </div>
              </div>
              <div>
                <p class="text-capitalize">{{ item }}</p>
              </div>
            </div>
          </div>
          <p v-else>No user online</p>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade" id="groupModal" tabindex="-1" aria-labelledby="groupModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5 text-white" id="groupModalLabel">Create group with user</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3 mt-1">
            <label class="form-label text-white" for="grp-user">Name</label>
            <input id="grp-user" type="text" placeholder="Group name" class="form-control" v-model="groupName">
          </div>
          <div v-if="onlineUsers.length" class="chat-list">
            <div v-for="(item, i) in onlineUsers" :key="i" class="list align-items-center py-2 px-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" :id="item" :value="item" v-model="selectedUsers">
                <label class="form-check-label" :for="item">
                  <div class="py-1 d-flex flex-row justify-content-between align-items-start">
                    <div class="avatar">{{ decodeString(item) }}<span v-if="checkOnline(item)" class="online"></span>
                    </div>
                    <p class="ms-2 text-capitalize">{{ item }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <p v-else>No user online</p>
          <button class="btn btn-primary w-100 mt-3" data-bs-dismiss="modal" type="button" @click="createGroup"
            :disabled="!groupName.length || !selectedUsers.length">Create
            group</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade" id="joinGroup" tabindex="-1" aria-labelledby="joinGroupLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5 text-white" id="joinGroupLabel">Join a group</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="groups.length" class="chat-list">
            <div v-for="(item, i) in groups" :key="i" class="list align-items-center py-2 px-3">
              <div class="form-check">
                <input class="form-check-input" type="radio" :id="item" :value="item" v-model="selectedGroup">
                <label class="form-check-label" :for="item">
                  <div class="py-1 d-flex flex-row justify-content-between align-items-start">
                    <div class="avatar">{{ decodeString(item) }}
                    </div>
                    <p class="ms-2 text-capitalize">{{ item }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <p v-else>No group available</p>
          <button class="btn btn-primary w-100 mt-2" data-bs-dismiss="modal" type="button" @click="joinGroup"
            :disabled="!selectedGroup.length">Join</button>
        </div>
      </div>
    </div>
  </div>
</template>