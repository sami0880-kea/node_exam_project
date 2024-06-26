<script>
    import { onMount } from 'svelte';
    import io from 'socket.io-client';
    import { user } from '../../stores/userStore.js';
    import { Textarea, Alert, ToolbarButton, Avatar } from 'flowbite-svelte';
    import { Send } from 'lucide-svelte';
    import { format, isToday } from 'date-fns'; 
    import ErrorToast from '../../components/ErrorToast/ErrorToast.svelte';
    import { BASE_URL } from '../../stores/urlStore.js';
    import ListingCard from '../../components/ListingCard/ListingCard.svelte';

    let socket;
    let messages = [];
    let message = '';
    let currentUser;
    export let id;
    let conversation = null;
    let listing = {};

    $: currentUser = $user;

    let failToast = false;
    let errorMessage = '';

    async function fetchMessages(conversationId) {
        try {
            const response = await fetch(`${$BASE_URL}/api/messages/${conversationId}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const result = await response.json();
                messages = result.data;
            } else {
                errorMessage = "Kunne ikke indlæse beskeder";
                failToast = true;                }
        } catch (error) {
            errorMessage = "Kunne ikke indlæse beskeder";
            failToast = true;       
        }
    }

    async function fetchConversationDetails(conversationId) {
        try {
            const response = await fetch(`${$BASE_URL}/api/conversations/${conversationId}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const result = await response.json();
                conversation = result.data;
                fetchCarDetails(result.data.listingId);
            } else {
                errorMessage = "Kunne ikke indlæse samtale";
                failToast = true;       
            }
        } catch (error) {
            errorMessage = "Kunne ikke indlæse samtale";
            failToast = true;    
        }
    }

    function sendMessage() {
        if (message.trim() !== '') {
            const data = {
                conversationId: id,
                sender: currentUser._id,
                text: message.trim()
            };

            socket.emit('client-sends-message', data);
            message = '';
        }
    }

    async function fetchCarDetails(listingId) {
        try {
            const response = await fetch(`${$BASE_URL}/api/listings/${listingId}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const result = await response.json();
                listing = result.data;
            } else {
                errorMessage = "Kunne ikke indlæse annonce";
                failToast = true;            
            }
        } catch (error) {
            errorMessage = "Kunne ikke indlæse annonce";
            failToast = true;            
        }
    }


    function formatDateTime(dateString) {
        const date = new Date(dateString);
        if (isToday(date)) {
            return format(date, 'HH:mm');
        } else {
            return format(date, 'dd/MM HH:mm');
        }
    }

    async function initialize() {
        socket = io($BASE_URL);

        socket.on('server-sends-message', (data) => {
            messages = [...messages, {
                _id: data._id,
                sender: data.sender,
                senderName: data.senderName,
                text: data.text,
                createdAt: data.createdAt,
            }];
        });

        await fetchConversationDetails(id);

        if (conversation) {
            await fetchMessages(id);
            socket.emit('join', id);
        } else {
            errorMessage = "Kunne ikke indlæse samtale";
            failToast = true;            
        }
    }

    onMount(() => {
        initialize();
    });
</script>

<div class="grid grid-cols-3 gap-4 mt-8 mb-8 w-full max-w-7xl mx-auto">
    <div class="flex flex-col col-span-2 items-center justify-center w-full">
            <div class="p-8 w-full h-[550px] overflow-y-auto rounded-t-md bg-gray-50 border-gray-500 divide-gray-500 dark:bg-gray-900">
                {#if messages.length > 0}
                    {#each messages as msg (msg._id)}
                        <div class="flex items-start gap-2.5 mb-4 {msg.sender === $user._id ? 'justify-end' : 'justify-start'}">
                            <div class="{msg.sender === $user._id ? 'order-last' : 'order-first'}">
                                <Avatar class="mx-1"/>
                            </div>                        
                            <div class="flex flex-col gap-1">
                            <div class="flex items-center space-x-2 rtl:space-x-reverse ">
                                <span class="text-sm font-semibold text-gray-900 dark:text-white">{msg.senderName}</span>
                                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">• {formatDateTime(msg.createdAt)}</span>
                            </div>
                                <div class="flex flex-col leading-1.5 p-4 {msg.sender === $user._id ? 'rounded-lg rounded-tr-none border-blue-200 bg-blue-500 dark:bg-blue-500' : 'rounded-e-xl rounded-es-xl border-gray-200 bg-gray-100 dark:bg-gray-700'} ">
                                    <p class="text-sm font-normal w-40 break-words {msg.sender === $user._id ? 'text-white' : 'text-gray-900 dark:text-white'}">{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    {/each}
                {:else}
                    <div class="flex items-center justify-center">
                        <div class="flex flex-col items-center">
                            <span class="text-black dark:text-white mt-2">Send en besked for at starte en samtale.</span>
                        </div>
                    </div>
                {/if}
            </div>
            <form class="w-full">
                <label for="message" class="sr-only">Besked</label>
                <div class="flex w-full items-center px-3 py-4 text-gray-700 dark:text-gray-300 rounded-b-md bg-gray-50 dark:bg-gray-900 border-gray-500 divide-gray-500 text-sm">
                    <Textarea bind:value={message} id="message" class="flex-grow w-full mx-4" rows="1" placeholder="Aa" />
                    <ToolbarButton on:click={sendMessage} class="rounded-full text-primary-600 dark:text-primary-500 ml-2">
                        <Send class="w-6 h-6" />
                        <span class="sr-only">Send</span>
                    </ToolbarButton>
                </div>
            </form>
        </div>
    {#if listing}
        <div class="flex items-center justify-center col-span-1">
            <div class="flex items-center justify-center w-80 h-[550px]">
                <ListingCard {listing}/>
            </div>
        </div>
    {/if}
</div>
<ErrorToast {errorMessage} {failToast}/>