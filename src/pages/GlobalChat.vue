<script>
import { nextTick } from 'vue';
import MainH1 from '../components/MainH1.vue';
import MainLoader from '../components/MainLoader.vue';
import MainButton from '../components/MainButton.vue';
import { receiveGlobalChatMessages, saveGlobalChatMessage, getGlobalChatLastMessages } from '../services/global-chat';
import { subscribeToAuthState } from '../services/auth';
import { RouterLink } from 'vue-router';

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
            messages: [],
            loadingMessages: false,
            newMessage: {
                body: '',
                imageFile: null,
            },
            comments: {},
        };
    },

    methods: {
        async sendMessage() {
            try {
                await saveGlobalChatMessage({
                    sender_id: this.user.id,
                    email: this.user.email,
                    body: this.newMessage.body,
                });
                this.newMessage.body = '';
            } catch (error) {
                console.error("Error al enviar el mensaje:", error);
            }
        },

        redirectScrollToChat(e) {
            const container = this.$refs.chatContainer;
            if (!container) return;

            const hovered = document.elementFromPoint(e.clientX, e.clientY);
            if (!container.contains(hovered)) {
                container.scrollTop += e.deltaY;
                e.preventDefault();
            }
        },

        handleImageUpload(e) {
            const file = e.target.files[0];
            if (file) {
                this.newMessage.imageFile = file;
            }
        },

        addComment(index) {
            const commentText = this.messages[index].newComment.trim();
            if (commentText) {
                this.messages[index].comments.push(commentText);
                this.messages[index].newComment = '';
            }
        },

        async loadInitialComments() {
            try {
                for (const message of this.messages) {
                    this.comments[message.id] = await loadComments(message.id);
                }
            } catch (error) {
                console.error("Error cargando comentarios:", error);
            }
        },
    },

    async mounted() {
        subscribeToAuthState(newUserData => this.user = newUserData);

        receiveGlobalChatMessages(async newReceivedMessage => {
            const newMessageWithComments = {
                ...newReceivedMessage,
                comments: [],
                newComment: ''
            };
            this.messages.unshift(newMessageWithComments);
            await nextTick();
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
        } catch (error) {
            console.error("Error cargando mensajes:", error);
        }

        window.addEventListener('wheel', this.redirectScrollToChat, { passive: false });
    },

    beforeUnmount() {
        window.removeEventListener('wheel', this.redirectScrollToChat);
    }
};
</script>


<template>
    <div class="mx-auto flex flex-col w-[50%] ">
        
        <div class="mx-auto overflow-y-auto w-12/12 py-5">
            
            <h2 class="mb-4 text-xl">Crear publicación</h2>

            <form 
                action="#"
                @submit.prevent="() => sendMessage()">
                <div class="mb-3">
                    <label for="body" class="block mb-2">Mensaje</label>
                    <textarea
                        v-model="newMessage.body"
                        id="body"
                        class="w-full p-2 border border-gray-400 rounded resize-y max-h-[150px]">
                    </textarea>
                </div>
                <MainButton type="submit">Postear</MainButton>

            </form>
        </div>
        <div ref="chatContainer pb-5" >
            <h2 class="sr-only">Lista de Mensajes</h2>
            <ul 
                v-if="!loadingMessages"
                class="flex flex-col gap-4 divide-y divide-gray-300 ">

                <li v-for="(message, index) in messages" :key="message.id" class="flex flex-col gap-0.5 pb-6 ">

                    <!-- Mensaje principal -->
                    <div>
                        <RouterLink
                        :to="`/usuario/${message.sender_id}`"
                        class="text-blue-800 font-bold underline"
                        >

                            {{ message.email }}
                        </RouterLink>
                    </div>
                    <div>{{ message.body }}</div>
                    <div class="text-sm text-green-600">
                        {{ new Date(message.created_at).toLocaleDateString() }}
                        {{ new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </div>

                    <!-- Comentarios existentes -->
                    <div v-if="message.comments.length" class="ml-4 mt-2 space-y-1">
                        <div v-for="(comment, cIndex) in message.comments" :key="cIndex" class="text-sm text-gray-700">
                            💬 {{ comment }}
                        </div>
                    </div>

                    <!-- Agregar comentario -->
                    <div class="mt-2 flex gap-2 items-center">
                        <input
                            v-model="message.newComment"
                            type="text"
                            class="flex-1 p-1 border border-gray-300 rounded text-sm"
                            placeholder="Postea tu respuesta"
                        />
                        <MainButton
                            @click="addComment(index)"
                            class="px-3 py-1 text-sm"
                        >
                            Responder
                        </MainButton>
                    </div>
                </li>


            </ul>
            <div v-else class="flex justify-center items-center w-full">
                <MainLoader />
            </div>
        </div>
        
    </div>
</template>