<script>
import { nextTick } from 'vue';
import MainButton from '../components/MainButton.vue';
import MainH1 from '../components/MainH1.vue';
import MainLoader from '../components/MainLoader.vue';
import { subscribeToAuthState } from '../services/auth';
import { getPrivateChatLastMessages, receivePrivateChatMessages, savePrivateChatMessage } from '../services/private-chat';
import { getUserProfileById } from '../services/user-profiles';

export default {
    name: 'PrivateChat',
    components: { MainH1, MainLoader, MainButton, },
    data() {
        return {
            userAuth: {
                id: null,
                email: null,
                bio: null,
                display_name: null,
                career: null,
            },

            userChat: {
                id: null,
                email: null,
                bio: null,
                display_name: null,
                career: null,
            },
            loadingUser: false,

            messages: [],
            loadingMessages: false,

            newMessage: {
                body: '',
            },
        };
    },
    methods: {
        async handleSubmit() {
            try {
                await savePrivateChatMessage(
                    this.userAuth.id,
                    this.userChat.id,
                    this.newMessage.body,
                );
                this.newMessage.body = '';
            } catch (error) {
                // TODO :)
            }
        },
    },
    async mounted() {
        subscribeToAuthState(newUserState => this.userAuth = newUserState);

        try {
            this.loadingUser = true;
            this.loadingMessages = true;

            receivePrivateChatMessages(
                this.userAuth.id,
                this.$route.params.id,
                async newMessage => {
                    this.messages.push(newMessage);
                    
                    // Movemos el scroll.
                    await nextTick();
                    this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight;
                }
            );

            this.userChat = await getUserProfileById(this.$route.params.id);
            this.loadingUser = false;

            this.messages = await getPrivateChatLastMessages(
                this.userAuth.id, 
                this.$route.params.id
            );
            this.loadingMessages = false;
            
            // Movemos el scroll.
            await nextTick();
            this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight;
        } catch (error) {
            // TODO :)
        }
    }
}
</script>

<template>
    <template v-if="!loadingUser">
        <MainH1>Chat privado con {{ userChat.email }}</MainH1>

        <div 
            ref="chatContainer"
            class="overflow-y-auto h-100 p-4 mb-4 border border-gray-400 rounded"
        >
            <h2 class="sr-only">Lista de Mensajes</h2>

            <ul 
                v-if="!loadingMessages"
                class="flex flex-col gap-4"
            >
                <li
                    v-for="message in messages"
                    class="flex flex-col gap-0.5 max-w-3/4 p-4 rounded"
                    :class="{
                        'self-end bg-green-200': message.sender_id == userAuth.id,
                        'self-start bg-gray-200': message.sender_id != userAuth.id,
                    }"
                >
                    <div>{{ message.body }}</div>
                    <div class="text-sm text-gray-500">{{ message.created_at }}</div>
                </li>
            </ul>
            <MainLoader v-else />
        </div>

        <div>
            <h2 class="sr-only">Enviar un mensaje</h2>
            <form 
                action="#"
                class="flex items-stretch gap-4"
                @submit.prevent="handleSubmit"
            >
                <div class="w-full">
                    <label for="body" class="sr-only">Mensaje</label>
                    <textarea
                        v-model="newMessage.body"
                        id="body"
                        class="w-full h-full p-2 border border-gray-400 rounded"
                    ></textarea>
                </div>
                <MainButton type="submit">Enviar</MainButton>
            </form>
        </div>
    </template>
    <MainLoader v-else />
</template>