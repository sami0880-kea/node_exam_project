<script>
    import { navigate } from 'svelte-routing';
    import { DarkMode, Card, Input, Label, Button, Toast, Spinner } from 'flowbite-svelte';
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { BASE_URL } from '../../stores/urlStore.js';
    import { X } from 'lucide-svelte';

    let token = '';
    let password = '';
    let confirmPassword = '';
    let failToast = false;
    let isLoading = false;

    async function resetPassword() {
        if (password !== confirmPassword) {
            failToast = true;
            return;
        }

        try {
            isLoading = true;
            const response = await fetch(`${$BASE_URL}/api/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, password })
            });

            if (response.ok) {
                navigate("/login", { replace: true });
            } else {
                failToast = true;
            }
            isLoading = false;
        } catch (error) {
            failToast = true;
            isLoading = false;
        }
    }

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get('token') || '';
    });

    $: if (failToast) {
        setTimeout(() => { failToast = false; }, 5000);
    }
</script>

<DarkMode class="hidden"/>
<div class="flex flex-col items-center justify-center min-h-screen">
    <Card>
        <form on:submit|preventDefault={resetPassword} class="flex flex-col space-y-6">
            <h1 class="text-xl font-medium text-gray-900 dark:text-white">Nustil adgangskode</h1>
            <div class="mb-4">
                <Label for="password" class="mb-2">Ny adgangskode</Label>
                <Input type="password" id="password" placeholder="•••••••••" bind:value={password} required />
            </div>
            <div class="mb-4">
                <Label for="confirmPassword" class="mb-2">Bekræft adgangskode</Label>
                <Input type="password" id="confirmPassword" placeholder="•••••••••" bind:value={confirmPassword} required />
            </div>
            <div class="flex items-center justify-between">
                {#if isLoading}
                    <Button disabled class="w-full flex items-center justify-center">
                        <Spinner class="me-3" size="4" color="white" /> Vent venglist ...
                    </Button>
                {:else}
                    <Button class="w-full" type="submit">Nustil adgangskode</Button>
                {/if}
            </div>
        </form>
    </Card>
</div>

<Toast transition={fly} params={{ x: 200 }} dismissable={false} position="bottom-right" color="none" defaultIconClass="w-8 h-8 text-red bg-white" class="bg-red-500 dark:bg-red-500 text-white dark:text-white mb-4 fixed" bind:open={failToast}>
    <X slot="icon" class="text-red-500 w-5 h-5"/>
    Adgangskode er ikke ens!
</Toast>