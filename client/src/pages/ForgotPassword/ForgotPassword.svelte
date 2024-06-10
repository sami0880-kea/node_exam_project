<script>
    import { DarkMode, Card, Button, Input, Label, Toast, Spinner } from 'flowbite-svelte';
    import { BASE_URL } from '../../stores/urlStore.js';
    import { fly } from 'svelte/transition';
    import { X, Check } from 'lucide-svelte';

    let email = '';
    let successToast = false;
    let failToast = false;
    let isLoading = false;
    let message = '';

    async function requestPasswordReset() {
        if (!email) {
            message = "Indtast venligst en email addresse";
            failToast = true;
            return;
        }

        try {
            isLoading = true;
            const response = await fetch(`${$BASE_URL}/api/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok) {
                message = "Hvis email eksistere, har du modtaget en email med nulstilling af adgangskode!";
                successToast = true;
            }

            isLoading = false;
        } catch (error) {
            message = "Fejl! Prøv igen senere...";
            failToast = true;
            isLoading = false;
        }
    }

    $: if (successToast || failToast) {
        setTimeout(() => { successToast = false; failToast = false; }, 5000);
    }
</script>

<DarkMode class="hidden"/>
<div class="flex flex-col items-center justify-center min-h-screen">
    <Card>
        <form on:submit|preventDefault={requestPasswordReset} class="flex flex-col space-y-6">
            <h1 class="text-xl font-medium text-gray-900 dark:text-white">Glemt Adgangskode</h1>
            <div class="mb-4">
                <Label for="email" class="mb-2">Email addresse</Label>
                <Input type="email" id="email" placeholder="Email" bind:value={email} required />
            </div>
            <div class="flex items-center justify-between">
                {#if isLoading}
                    <Button disabled class="w-full flex items-center justify-center">
                        <Spinner class="me-3" size="4" color="white" /> Vent venligst ...
                    </Button>
                {:else}
                    <Button class="w-full" type="submit">Nustil adgangskode</Button>
                {/if}
            </div>
        </form>
    </Card>
</div>

<Toast transition={fly} params={{ x: 200 }} dismissable={false} position="bottom-right" color="none" defaultIconClass="w-8 h-8 text-red bg-white" class="bg-green-500 dark:bg-green-500 text-white dark:text-white mb-4 fixed" bind:open={successToast}>
    <Check slot="icon" class="text-green-500 w-5 h-5" />
    {message}
</Toast>
<Toast transition={fly} params={{ x: 200 }} dismissable={false} position="bottom-right" color="none" defaultIconClass="w-8 h-8 text-red bg-white" class="bg-red-500 dark:bg-red-500 text-white dark:text-white mb-4 fixed" bind:open={failToast}>
    <X slot="icon" class="text-red-500 w-5 h-5" />
    {message}
</Toast>
