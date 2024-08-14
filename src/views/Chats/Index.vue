<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import DetailChat from '@/components/DetailChat.vue'
import { decodeString } from '@/composables/useDecode'
import { convertTime } from '@/composables/useConvert'
import { useRoute, useRouter } from 'vue-router';
import io from "socket.io-client"

const detail = ref([
  // {
  //   id: 'john', name: 'john', isGroup: false, list:
  //     [
  //       { id: 0, name: 'john', text: 'Hay You', time: 1722519615000, },
  //     ]
  // },
  // {
  //   id: 'office', name: 'office', isGroup: true, list:
  //     [
  //       { id: 0, name: 'office', text: 'Announcement', time: 1722436860000 }
  //     ]
  // }
])
const online = ref([])
const cookie = decodeURIComponent(document.cookie).split(';')
const authme = cookie.filter((item) => item.includes('islogin'))
const me = authme[0]?.split('=')[1]
const socket = ref({})
const router = useRouter()

const isDetail = computed(() => {
  return useRoute().name === 'detail'
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

// watch(isDetail, () => {
//   // console.log(isDetail.value);

//   if (detail.value) {
//     console.log('sdce');

//   }
// })

onMounted(() => {
  socket.value = io("http://127.0.0.1:3000")

  if (socket) {
    socket.value?.emit("join", me)
    // chats.value.forEach(element => {
    //   return socket.value?.emit("joinRoom", { name: element.name, room: element.id })
    // });

    socket.value?.on("users", (arg) => {
      online.value = arg
      // const users = JSON.parse(localStorage.getItem("users")) || []
      // const isExist = users.find((item) => item === me)
      // if (!isExist) {
      //   users.push(arg)
      // }
      // localStorage.setItem("users", JSON.stringify(users))
      // online.value = JSON.parse(localStorage.getItem("users"))
    })

    // socket.value?.on("roomx", (arg) => {
    //   console.log(arg);

    // })

    socket.value?.on("readMessage", (arg) => {
      // console.log(arg);
      // console.log(detail.value);


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

      const isExistChat = detail.value.find((item) => item.id.includes(arg.from))
      if (isExistChat) {
        detail.value = detail.value.map((obj) => {
          if (obj.id === arg.from) {
            const newObj = {
              ...obj, from: arg.from,
              list: isDetail.value ? [...obj.list, { ...arg.list, isSent: true }] : [...obj.list, arg.list]
            }
            if (isDetail.value) {
              socket.value?.emit("read", { to: arg.from, isGroup: false, from: me })
            }
            return newObj
          } return obj
        })

      } else {
        const newChat = {
          id: arg.from, name: arg.from, from: arg.from, list:
            [
              arg.list
            ]
        }
        return detail.value.push(newChat)
      }

    })
  }
})

onUnmounted(() => {
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
      id: val, name: val, from: me, list: []
    })
    socket.value?.emit("joinRoom", { name: val, room: val })
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

// const connect = () => {
//   const socket = io("http://127.0.0.1:3000")
//   if (!connected.value) {
//     // socket.emit("join", me)
//     socket.connect()
//     console.log("connected", socket, 'atas');
//   } else {
//     console.log(socket);

//     socket.disconnect()
//   }
//   connected.value = !connected.value
// }
</script>

<template>
  <div class="row position-relative">
    <div v-if="useRoute().name === 'chat'" class="new-chat" type="button" data-bs-toggle="modal"
      data-bs-target="#usersModal">
      <img src="@/assets/icon/chat.svg" alt="chat">
      <p class="text">New Chat</p>
    </div>
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
          <button class="btn btn-primary w-100" type="button" data-bs-toggle="modal" data-bs-target="#usersModal">New
            message</button>
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
</template>