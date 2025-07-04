<script>
import { nextTick } from 'vue';
import MainH1 from '../components/MainH1.vue';
import MainLoader from '../components/MainLoader.vue';
import MainButton from '../components/MainButton.vue';
import {
  receiveGlobalChatMessages,
  saveGlobalChatMessage,
  getGlobalChatLastMessages
} from '../services/global-chat';
import {
  receivePrivateChatMessages,
  savePrivateChatMessage,
  getPrivateChatLastMessages
} from '../services/private-chat';
import { subscribeToAuthState } from '../services/auth';
import { getAllUserProfiles } from '../services/user-profiles';

let privateChatSubscription = null;

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
        career: null,
      },
      users: [],
      messages: [],
      loadingMessages: false,
      newMessage: {
        body: '',
      },
      selectedUser: null,
      privateMessages: [],
      loadingPrivateMessages: false,
    };
  },

  methods: {
    async sendMessage() {
      if (!this.newMessage.body.trim()) return;

      try {
        if (this.selectedUser) {
          await savePrivateChatMessage(this.user.id, this.selectedUser.id, this.newMessage.body);
        } else {
          await saveGlobalChatMessage({
            sender_id: this.user.id,
            email: this.user.email,
            body: this.newMessage.body,
          });
        }

        this.newMessage.body = '';
        await nextTick();
        requestAnimationFrame(() => {
          this.scrollToBottom(false);
        });
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
      }
    },

    async handleSelectUser(user) {
      this.selectedUser = user;
      this.loadingPrivateMessages = true;
      this.privateMessages = [];

      try {
        const messages = await getPrivateChatLastMessages(this.user.id, user.id);
        this.privateMessages = messages;

        await nextTick();
        requestAnimationFrame(() => {
          this.scrollToBottom(false);
        });

        if (privateChatSubscription?.unsubscribe) {
          privateChatSubscription.unsubscribe();
        }

        privateChatSubscription = receivePrivateChatMessages(this.user.id, user.id, async (newMsg) => {
          this.privateMessages.push(newMsg);
          await nextTick();
          requestAnimationFrame(() => {
            this.scrollToBottom(false);
          });
        });
      } catch (error) {
        console.error("Error cargando mensajes privados:", error);
      }

      this.loadingPrivateMessages = false;
    },

    async handleGlobalChat() {
      if (privateChatSubscription?.unsubscribe) {
        privateChatSubscription.unsubscribe();
        privateChatSubscription = null;
      }
      this.selectedUser = null;
      await nextTick();
      requestAnimationFrame(() => {
        this.scrollToBottom(false);
      });
    },

    scrollToBottom(smooth = false) {
      const container = this.$refs.chatContainer;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        });
      }
    },
  },

  async mounted() {
    subscribeToAuthState(newUserData => this.user = newUserData);

    receiveGlobalChatMessages(async newReceivedMessage => {
      if (!this.selectedUser) {
        const newMessageWithComments = {
          ...newReceivedMessage,
          comments: [],
          newComment: ''
        };
        this.messages.push(newMessageWithComments);
        await nextTick();
        requestAnimationFrame(() => {
          this.scrollToBottom(false);
        });
      }
    });

    try {
      this.loadingMessages = true;
      this.messages = await getGlobalChatLastMessages();
      this.messages = this.messages.map(msg => ({
        ...msg,
        comments: [],
        newComment: ''
      }));
      this.loadingMessages = false;
      await nextTick();
      requestAnimationFrame(() => {
        this.scrollToBottom(false);
      });

      const allUsers = await getAllUserProfiles();
      this.users = allUsers.filter(u => u.id !== this.user.id);
    } catch (error) {
      console.error("Error cargando mensajes o usuarios:", error);
    }
  },

  beforeUnmount() {
    if (privateChatSubscription?.unsubscribe) {
      privateChatSubscription.unsubscribe();
    }
  }
};
</script>

<template>
  <div class="flex w-full" style="height: calc(100vh - 112px); overflow-x: hidden;">
    <!-- Columna izquierda: contactos -->
    <aside class="w-1/4 bg-white border-r border-gray-300 p-4 overflow-y-auto" style="height: 100%; max-height: calc(100vh - 112px);">
      <h2 class="text-lg font-semibold mb-4">Contactos</h2>
      <ul class="space-y-2">
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

        <li class="text-xs text-gray-500 uppercase mt-4">Privados</li>
        <li v-for="u in users" :key="u.id">
  <button
    @click="handleSelectUser(u)"
    :class="[
      'text-sm text-left w-full hover:underline',
      selectedUser?.id === u.id
        ? 'text-green-600 font-bold'
        : 'text-gray-700'
    ]"
  >
    {{ u.display_name || u.email }}
  </button>
</li>

      </ul>
    </aside>

    <!-- Columna derecha: chat -->
    <main class="w-3/4 flex flex-col relative bg-white">
      <!-- Encabezado -->
      <div class="text-md sticky top-0 z-10 bg-gray-100 border-b border-gray-300 px-4 py-2 font-semibold text-gray-700">
        {{ selectedUser ? `Chat con ${selectedUser.display_name || selectedUser.email}` : 'Chat Global' }}
      </div>

      <!-- Mensajes -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-2 space-y-4 divide-y divide-gray-200">
        <!-- Mensajes globales -->
        <ul v-if="!loadingMessages && !selectedUser" class="flex flex-col gap-4">
          <li v-for="message in messages" :key="message.id" class="flex flex-col gap-0.5 pb-6">
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
          </li>
        </ul>

        <!-- Mensajes privados -->
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



        <!-- Loader -->
        <div v-if="(selectedUser && loadingPrivateMessages) || (!selectedUser && loadingMessages)" class="flex justify-center items-center w-full">
          <MainLoader />
        </div>
      </div>

      <!-- Formulario -->
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