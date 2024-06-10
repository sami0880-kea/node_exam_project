<script>
    import { Heading, P, Textarea, Button, Label, Input, Toast } from 'flowbite-svelte';
    import { user } from '../../stores/userStore.js';
    import { fly } from 'svelte/transition';
    import { X, Check } from 'lucide-svelte';
    import { BASE_URL } from '../../stores/urlStore.js';

    $: currentUser = $user;
    
    let email = '';
    let subject = 'Tilføje newton-meters til biler';
    let message = 'Hej, jeg vil gerne spørge om det muligt for jer at tilføje newton meter til biler så man kan se hvor meget torque bilen har. Tak på forhånd!';

    let failToast = false;
    let successToast = false;

    const textareaprops = {
        id: 'message',
        name: 'message',
        label: 'Your message',
        rows: 6,
        placeholder: 'Leave a message...'
    };

    $: if (currentUser && currentUser.email) {
        email = currentUser.email;
    }

    async function sendMail() {
        try {
            const response = await fetch(`${$BASE_URL}/api/send-email`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, subject, message })
            });

            if (!response.ok) {
                failToast = true;
                return;
            }
            successToast = true;
            email = currentUser.email || '';
            subject = '';
            message = '';
        } catch (error) {
            failToast = true;
        }
    }

    $: if (failToast) {
        setTimeout(() => { failToast = false; }, 5000);
    }

    $: if (successToast) {
        setTimeout(() => { successToast = false; }, 5000);
    }
</script>

<div class="py-16 mx-auto max-w-screen-md min-h-screen">
    <Heading class="mb-4 text-center">Kontakt Os</Heading>
    <P class="mb-8 text-center">Har du spørgsmål? Send os en mail!</P>
    <form on:submit|preventDefault={sendMail} class="space-y-6">
        <div class="mb-4">
            <Label class="mb-2">Din Email</Label>
            <Input type="email" id="email" placeholder="Your Email" bind:value={email} disabled={currentUser && currentUser.email} required />
        </div>
        <div class="mb-4">
            <Label class="mb-2">Emne</Label>
            <Input type="text" id="subject" placeholder="Subject" bind:value={subject} required />
        </div>
        <div class="mb-4">
            <Label class="mb-2">Din besked</Label>
            <Textarea bind:value={message} {...textareaprops} />
        </div>
        <Button type="submit" class="w-40">Send</Button>
    </form>
</div>
<Toast transition={fly} params={{ x: 200 }} dismissable={false} position="bottom-right" color="none" defaultIconClass="w-8 h-8 text-red bg-white" class="bg-red-500 dark:bg-red-500 text-white dark:text-white mb-4 fixed" bind:open={failToast}>
    <X slot="icon" class="text-red-500 w-5 h-5" />
    Kunne ikke sende email!
</Toast>
<Toast transition={fly} params={{ x: 200 }} dismissable={false} position="bottom-right" color="none" defaultIconClass="w-8 h-8 text-red bg-white" class="bg-green-500 dark:bg-green-500 text-white dark:text-white mb-4 fixed" bind:open={successToast}>
    <Check slot="icon" class="text-green-500 w-5 h-5" />
    Email er blevet sendt!
</Toast>
