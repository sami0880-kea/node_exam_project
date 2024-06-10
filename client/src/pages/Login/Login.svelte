<script>
    import { navigate } from 'svelte-routing';
    import { fetchUser } from '../../stores/userStore.js';
    import { Card, Input, Label, Button, Toast, Spinner } from 'flowbite-svelte';
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { X } from 'lucide-svelte';
    import { DarkMode } from 'flowbite-svelte';
  import { BASE_URL } from '../../stores/urlStore.js';

    let email = 'johndoe@mail.com';
    let password = 'johndoe1234';

    let failToast = false;
    let isLoading = false;

    async function login() {
        try {
            isLoading = true;  
            const response = await fetch(`${$BASE_URL}/api/login`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                failToast = true;
                isLoading = false;
                return;
            }

            fetchUser();
            navigate("/listings", { replace: true });
            isLoading = false;
        } catch (error) {
            failToast = true;
            isLoading = false;
        }
    }

    onMount(() => {
        if (localStorage.getItem('session')) {
            navigate('/');
        }
    });

    $: if (failToast) {
        setTimeout(() => { failToast = false; }, 5000);
    }
</script>


<DarkMode class="hidden"/>
<div class="flex flex-col items-center justify-center min-h-screen">
        <Card>
        <form on:submit|preventDefault={login} class="flex flex-col space-y-6">
            <h1 class="text-xl font-medium text-gray-900 dark:text-white">Logind</h1>
            <div class="mb-4">
                <Label for="email" class="mb-2">Email addresse</Label>
                <Input type="email" id="email" placeholder="johndoe@company.com" bind:value={email} required />
            </div>
            <div class="mb-4">
                <Label for="password" class="mb-2">Adgangskode</Label>
                <Input type="password" id="password" placeholder="•••••••••" bind:value={password} required />
            </div>
            <div class="flex items-center justify-between">
                {#if isLoading}
                    <Button disabled class="w-full flex items-center justify-center">
                        <Spinner class="me-3" size="4" color="white" /> Vent venligst ...
                    </Button>
                {:else}
                    <Button class="w-full" type="submit">Logind</Button>
                {/if}
            </div>
            <div class="text-center text-sm font-medium text-gray-500 dark:text-gray-300">
                Har du ikke en bruger? <a href="/signup" class="text-primary-700 hover:underline dark:text-primary-500"> Opret bruger</a>
            </div>
        </form>
    </Card>
</div>

<Toast transition={fly} params={{ x: 200 }} dismissable={false} position="bottom-right" color="none" defaultIconClass="w-8 h-8 text-red bg-white" class="bg-red-500 dark:bg-red-500 text-white dark:text-white mb-4 fixed" bind:open={failToast}>
    <X slot="icon" class="text-red-500 w-5 h-5"/>
    Ugyldig logind detaljer
</Toast>