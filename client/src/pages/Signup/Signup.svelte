<script>
    import { navigate } from 'svelte-routing';
    import { Card, Input, Label, Button, Toast, Spinner, A, Checkbox } from 'flowbite-svelte';
    import { fly } from 'svelte/transition';
    import { X } from 'lucide-svelte';
    import { DarkMode } from 'flowbite-svelte';
  import { BASE_URL } from '../../stores/urlStore.js';

    let name = 'Jane Doe';
    let email = 'janedoe@mail.com';
    let password = 'jane1234';
    let confirmPassword = 'jane1234';

    let failToast = false;
    let isLoading = false;
    let errorMessage;

    async function signUp() {
        if (password !== confirmPassword) {
            failToast = true;
            errorMessage = "Adgangskode er ikke ens";
            return;
        }
        isLoading = true;

        try {
            const response = await fetch(`${$BASE_URL}/api/signup`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ name, email, password })
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const result = await response.text();
                throw new Error(result);
            }
        } catch (error) {
            failToast = true;
            errorMessage = "Kunne ikke oprette bruger...";
        } finally {
            isLoading = false;
        }
    };

    $: if (failToast) {
        setTimeout(() => { failToast = false; }, 5000);
    }
</script>

<DarkMode class="hidden"/>
<div class="flex flex-col items-center justify-center min-h-screen">
    <Card>
        <form on:submit|preventDefault={signUp} class="flex flex-col space-y-6">
            <h1 class="text-xl font-medium text-gray-900 dark:text-white">Opret bruger</h1>
            <div class="mb-4">
                <Label for="name" class="mb-2">Navn</Label>
                <Input type="text" id="name" placeholder="John Doe" bind:value={name} required />
            </div>
            <div class="mb-4">
                <Label for="email" class="mb-2">Email addresse</Label>
                <Input type="email" id="email" placeholder="johndoe@mail.com" bind:value={email} required />
            </div>
            <div class="mb-4">
                <Label for="password" class="mb-2">Adgangskode</Label>
                <Input type="password" id="password" placeholder="•••••••••" bind:value={password} required />
            </div>
            <div class="mb-4">
                <Label for="confirm_password" class="mb-2">Bekræft adgangskode</Label>
                <Input type="password" id="confirm_password" placeholder="•••••••••" bind:value={confirmPassword} required />
            </div>
            <Checkbox class="mb-4 space-x-1 rtl:space-x-reverse " required>
            Jeg acceptere <A class="text-primary-700 dark:text-primary-600 hover:underline">vilkår og betingelser.</A>
            </Checkbox>
            <div class="flex items-center justify-between">
                {#if isLoading}
                    <Button disabled class="w-full flex items-center justify-center">
                        <Spinner class="me-3" size="4" color="white" /> Vent venligst ...
                    </Button>
                {:else}
                    <Button class="w-full" type="submit">Opret bruger</Button>
                {/if}
            </div>
            <div class="text-center text-sm font-medium text-gray-500 dark:text-gray-300">
                Har du allerede en bruger? <a href="/login" class="text-primary-700 hover:underline dark:text-primary-500"> Logind </a>
            </div>
        </form>
    </Card>
</div>

<Toast transition={fly} params={{ x: 200 }} dismissable={false} position="bottom-right" color="none" defaultIconClass="w-8 h-8 text-red bg-white" class="bg-red-500 dark:bg-red-500 text-white dark:text-white mb-4 fixed" bind:open={failToast}>
    <X slot="icon" class="text-red-500 w-5 h-5"/>
    {errorMessage}
</Toast>
