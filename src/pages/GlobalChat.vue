<script>
import { nextTick } from 'vue'
import { useRoute } from 'vue-router'
import MainH1 from '../components/MainH1.vue'
import MainLoader from '../components/MainLoader.vue'
import MainButton from '../components/MainButton.vue'
import {
  receiveGlobalChatMessages,
  saveGlobalChatMessage,
  getGlobalChatLastMessages
} from '../services/global-chat'
import {
  receivePrivateChatMessages,
  savePrivateChatMessage,
  getPrivateChatLastMessages
} from '../services/private-chat'
import { subscribeToAuthState } from '../services/auth'
import { getAllUserProfiles, getUserProfileById } from '../services/user-profiles'
import {
  getRespuestas,
  agregarRespuesta,
  subscribeToRespuestas
} from '../services/respuestas'

let privateChatSubscription = null
let globalChatChannel = null

export default {
  name: 'GlobalChat',
  components: { MainH1, MainLoader, MainButton },

  data() {
    return {
      user: {
        id: null,
        email: null,
        display_name: null,
        bio: null,
        career: null
      },
      users: [],
      messages: [],
      loadingMessages: false,
      newMessage: {
        body: ''
      },
      selectedUser: null,
      privateMessages: [],
      loadingPrivateMessages: false,
      route: useRoute(),
      readyToShow: false
    }
  },

  methods: {
    async sendMessage() {
      if (!this.newMessage.body.trim()) return

      try {
        if (this.selectedUser) {
          await savePrivateChatMessage(this.user.id, this.selectedUser.id, this.newMessage.body)
        } else {
          await saveGlobalChatMessage({
            sender_id: this.user.id,
            email: this.user.email,
            body: this.newMessage.body
          })
        }

        this.newMessage.body = ''
        await nextTick()
        requestAnimationFrame(() => {
          this.scrollToBottom(false)
        })
      } catch (error) {
        console.error('Error al enviar el mensaje:', error)
      }
    },

    async sendRespuesta(message) {
      const comment = message.newComment.trim()
      if (!comment) return

      if (!message.id) {
        console.error('El mensaje no tiene un ID definido.')
        return
      }

      try {
        const parsedId = Number(message.id)
        if (!parsedId || isNaN(parsedId)) {
          throw new Error(`El ID del mensaje no es un número válido: ${message.id}`)
        }

        await agregarRespuesta({
          global_chat_id: parsedId,
          sender_id: this.user.id,
          comment
        })
        message.newComment = ''
      } catch (error) {
        console.error('Error al enviar respuesta:', error)
      }
    },

    async cargarRespuestasParaMensaje(message) {
      try {
        const respuestas = await getRespuestas(message.id)
        message.comments = respuestas
      } catch (error) {
        console.error('Error cargando respuestas:', error)
      }
    },

    async handleSelectUser(user) {
      this.selectedUser = user
      this.loadingPrivateMessages = true
      this.privateMessages = []

      try {
        const messages = await getPrivateChatLastMessages(this.user.id, user.id)
        this.privateMessages = messages

        await nextTick()
        requestAnimationFrame(() => {
          this.scrollToBottom(false)
        })

        if (privateChatSubscription?.unsubscribe) {
          console.log('[Chat] Canal privado cerrado')
          privateChatSubscription.unsubscribe()
        }

        if (globalChatChannel?.unsubscribe) {
          console.log('[Chat] Canal global cerrado')
          globalChatChannel.unsubscribe()
          globalChatChannel = null
        }

        privateChatSubscription = receivePrivateChatMessages(
          this.user.id,
          user.id,
          async (newMsg) => {
            this.privateMessages.push(newMsg)
            await nextTick()
            requestAnimationFrame(() => {
              this.scrollToBottom(false)
            })
          }
        )
      } catch (error) {
        console.error('Error cargando mensajes privados:', error)
      }

      this.loadingPrivateMessages = false
    },

    async handleGlobalChat() {
      if (privateChatSubscription?.unsubscribe) {
        console.log('[Chat] Canal privado cerrado')
        privateChatSubscription.unsubscribe()
        privateChatSubscription = null
      }
      this.selectedUser = null
      if (globalChatChannel?.unsubscribe) {
        console.log('[Chat] Canal global cerrado')
        globalChatChannel.unsubscribe()
        globalChatChannel = null
      }
      this.setupGlobalChatListener()
      await nextTick()
      requestAnimationFrame(() => {
        this.scrollToBottom(false)
      })
    },

    setupGlobalChatListener() {
      if (globalChatChannel) return
      globalChatChannel = receiveGlobalChatMessages(async (newReceivedMessage) => {
        if (!this.selectedUser) {
          if (!newReceivedMessage?.id) {
            console.warn('Mensaje global recibido sin ID, ignorado.')
            return
          }

          const newMessageWithComments = {
            ...newReceivedMessage,
            comments: [],
            newComment: ''
          }

          this.messages.push(newMessageWithComments)
          await this.cargarRespuestasParaMensaje(newMessageWithComments)
          await nextTick()
          requestAnimationFrame(() => {
            this.scrollToBottom(false)
          })
        }
      })
    },

    scrollToBottom(smooth = false) {
      const container = this.$refs.chatContainer
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        })
      }
    }
  },

  async mounted() {
    subscribeToAuthState((newUserData) => (this.user = newUserData))

    try {
      this.loadingMessages = true
      this.messages = await getGlobalChatLastMessages()
      this.messages = await Promise.all(
        this.messages.map(async (msg) => {
          const comentarios = await getRespuestas(msg.id)
          return {
            ...msg,
            comments: comentarios,
            newComment: ''
          }
        })
      )
      this.loadingMessages = false

      const allUsers = await getAllUserProfiles()
      this.users = allUsers.filter((u) => u.id !== this.user.id)

      const userIdDesdeQuery = this.route.query.usuario
      if (userIdDesdeQuery) {
        const target = this.users.find((u) => u.id === userIdDesdeQuery)
        if (target) {
          await this.handleSelectUser(target)
        } else {
          this.setupGlobalChatListener()
        }
      } else {
        this.setupGlobalChatListener()
      }

      subscribeToRespuestas(async (respuesta) => {
        const msg = this.messages.find((m) => m.id === respuesta.global_chat_id)
        if (msg) {
          const profile = await getUserProfileById(respuesta.sender_id)
          respuesta.user_profiles = profile
          msg.comments.push(respuesta)
        }
      })

      await nextTick()
      requestAnimationFrame(() => {
        this.scrollToBottom(false)
      })

      this.readyToShow = true
    } catch (error) {
      console.error('Error cargando mensajes o usuarios:', error)
    }
  },

  beforeUnmount() {
    if (privateChatSubscription?.unsubscribe) {
      privateChatSubscription.unsubscribe()
    }
    if (globalChatChannel?.unsubscribe) {
      globalChatChannel.unsubscribe()
    }
  }
}
</script>




<template>
  <div class="flex w-full" style="height: calc(100vh - 112px); overflow-x: hidden;">
    <aside class="w-1/4 bg-white border-r border-gray-300 p-4 overflow-y-auto" style="height: 100%; max-height: calc(100vh - 112px);">
      <h2 class="text-lg font-semibold mb-4">Contactos</h2>
      <ul class="space-y-5">
        <li>
          <button
            @click="handleGlobalChat"
            :class="[
              'text-sm text-left w-full hover:underline',
              selectedUser === null
                ? 'text-green-600 font-bold'
                : 'text-gray-700'
            ]"
          >
            Chat Global
          </button>
        </li>

        <!-- <li class="text-xs text-gray-500 uppercase mt-4">Contactos</li> -->
        <li v-for="u in users" :key="u.id">
          <button
            @click="handleSelectUser(u)"
            class="flex items-center gap-3 w-full text-left hover:underline"
            :class="selectedUser?.id === u.id ? 'text-green-600 font-bold' : 'text-gray-700'"
          >
            <div class="w-11 h-11 flex-shrink-0">
              <img
                :src="u.photo"
                alt="Foto de perfil"
                class="p-0 w-full h-full object-cover rounded-full ring-2 ring-[#05A378]"
              />
            </div>
            <span class="truncate">{{ u.display_name || u.email }}</span>
          </button>
        </li>

      </ul>
    </aside>

    <main class="w-3/4 flex flex-col relative bg-white">
      <div class="text-md sticky top-0 z-10 bg-gray-100 border-b border-gray-300 px-4 py-2 font-semibold text-gray-700">
        {{ selectedUser ? `Chat con ${selectedUser.display_name || selectedUser.email}` : 'Chat Global' }}
      </div>

      <div ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-2 space-y-4 divide-y divide-gray-200">
        <ul v-if="!loadingMessages && !selectedUser" class="flex flex-col gap-4">
          <li v-for="message in messages" :key="message.id" class="flex flex-col gap-1 pb-6">
            <div class="text-sm">
              Post de
              <RouterLink :to="`/usuario/${message.sender_id}`" class="text-blue-800 font-bold underline">
                {{ message.email }}
              </RouterLink>
            </div>
            <div>{{ message.body }}</div>
            <div class="text-xs text-green-600">
              {{ new Date(message.created_at).toLocaleDateString() }}
              {{ new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </div>

            <div class="ml-4 mt-3 space-y-2">
              <div
                v-for="respuesta in message.comments"
                :key="respuesta.id"
                class="text-sm text-gray-700 border-l-2 border-gray-300 pl-3"
              >
                <span class="font-semibold text-green-700">{{ respuesta.user_profiles?.display_name || '...' }}</span>
                : {{ respuesta.comment }}
              </div>

              <form @submit.prevent="sendRespuesta(message)" class="mt-2 flex gap-2">
                <input
                  v-model="message.newComment"
                  type="text"
                  placeholder="Responder..."
                  class="flex-1 border rounded-md px-2 py-1 text-sm"
                />
                <MainButton type="submit">Responder</MainButton>
              </form>
            </div>
          </li>
        </ul>

        <ul v-if="!loadingPrivateMessages && selectedUser" class="flex flex-col gap-4">
          <li
            v-for="msg in privateMessages"
            :key="msg.id"
            :class="[
              'flex flex-col gap-0.5 pb-6 max-w-[80%]',
              msg.sender_id === user.id
                ? 'self-end text-right bg-green-100 rounded-xl px-4 py-2 mr-8'
                : 'self-start text-left bg-gray-100 rounded-xl px-4 py-2 ml-8'
            ]"
          >
            <div class="text-sm font-medium text-blue-700">
              {{ msg.sender_id === user.id ? 'Vos' : selectedUser.display_name }}
            </div>
            <div class="text-gray-800">{{ msg.body }}</div>
            <div class="text-xs text-green-600">
              {{ new Date(msg.created_at).toLocaleDateString() }}
              {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </div>
          </li>
        </ul>

        <div v-if="(selectedUser && loadingPrivateMessages) || (!selectedUser && loadingMessages)" class="flex justify-center items-center w-full">
          <MainLoader />
        </div>
      </div>

      <div class="sticky bottom-0 z-10 bg-white border-t border-gray-300 px-4 py-3 overflow-hidden">
        <form @submit.prevent="sendMessage" class="flex items-center gap-2 max-w-[96%] mx-auto">
          <textarea
            v-model="newMessage.body"
            placeholder="Escribí un mensaje"
            rows="1"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-full shadow-sm resize-none max-h-[120px] overflow-y-auto"
            @keydown.enter.prevent="sendMessage"
          />
          <MainButton type="submit">Enviar</MainButton>
        </form>
      </div>
    </main>
  </div>
</template>
