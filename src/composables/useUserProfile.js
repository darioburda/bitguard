import { onMounted, ref } from "vue";
import { getUserProfileById } from "../services/user-profiles";

export default function useUserProfile(id) {
    const user = ref({
        id: null,
        email: null,
        bio: null,
        display_name: null,
        career: null,
        photo: null,
    });
    const loadingUser = ref(false);

    onMounted(async () => {
        try {
            loadingUser.value = true;
            user.value = await getUserProfileById(id);
        } catch (error) {
            
        }
        loadingUser.value = false;
    });

    return {
        user,
        loadingUser,
    }
};