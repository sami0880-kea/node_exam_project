<script>
    import { Toast } from 'flowbite-svelte';
    import { fly } from 'svelte/transition';
    import { Ban } from 'lucide-svelte';

    export let errorMessage = '';
    export let failToast = false;

    $: if (failToast) {
        setTimeout(() => { failToast = false; }, 5000);
    }
</script>

<Toast transition={fly} params={{ x: 200 }} position="bottom-right" color="none" defaultIconClass="w-8 h-8 text-red bg-white" class="bg-red-500 dark:bg-red-500 text-white dark:text-white mb-4 fixed z-50	" bind:open={failToast}>
    <Ban slot="icon" class="text-red-500 w-5 h-5"/>
    {errorMessage}
</Toast>