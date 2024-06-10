<script>
    import { PaginationItem, Search, Heading, Button, Spinner, Select, P } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import ListingCard from '../../components/ListingCard/ListingCard.svelte';
    import { user } from '../../stores/userStore.js';
    import ErrorToast from '../../components/ErrorToast/ErrorToast.svelte';
    import { BASE_URL } from '../../stores/urlStore.js';

    let listings = [];
    let loading = true;

    let failToast = false;
    let errorMessage = '';

    async function fetchListings(page = 1) {
        loading = true;
        try {
            const response = await fetch(`${$BASE_URL}/api/listings/user/${$user._id}`, {
                credentials: 'include',
            });

            if (response.ok) {
                const result = await response.json();
                listings = result.data;
            } else {
                errorMessage = "Kunne ikke indlæse annoncer";
                failToast = true;
            }
        } catch (error) {
            errorMessage = "Kunne ikke indlæse annoncer";
            failToast = true;
        } finally {
            loading = false;
        }
    }
  

  function refreshListings() {
        fetchListings();
    }

    onMount(() => {
        fetchListings();
    });
</script>

<div class="py-16 mx-auto min-h-screen">
    <Heading class="mb-4 text-center">Dine annoncer</Heading>
    {#if loading}
    <div class="flex items-center justify-center min-h-screen">
        <div class="flex flex-col items-center">
            <Spinner size={16} />
            <span class="text-black dark:text-white mt-2">Indlæser...</span>
        </div>
    </div>
    {:else if listings.length}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mb-8 w-full max-w-6xl mx-auto">
            {#each listings as listing (listing._id)}
                <ListingCard {listing} />
            {/each}
        </div>
    {:else}
        <p class="col-span-full text-black dark:text-white mt-2 text-center">Ingen biler fundet.</p>
    {/if}
</div>

<ErrorToast {errorMessage} {failToast}/>