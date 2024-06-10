<script>
    import { PaginationItem, Search, Heading, Button, Spinner, Select, P } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import AddListingComponent from '../../components/AddListing/AddListing.svelte';
    import ListingCard from '../../components/ListingCard/ListingCard.svelte';
    import { user } from '../../stores/userStore.js';
    import { ArrowLeft, ArrowRight, Tag } from 'lucide-svelte';
    import ErrorToast from '../../components/ErrorToast/ErrorToast.svelte';
    import { BASE_URL } from '../../stores/urlStore.js';

    let hidden4 = true;
    let brandOptions = [];
    let listings = [];
    let loading = true;
    let searchQuery = '';
    let sortOption = '';

    let failToast = false;
    let errorMessage = '';

    let sortOptions = [
        { value: 'price_desc', name: 'Pris (højeste først)' },
        { value: 'price_asc', name: 'Pris (laveste først)' },
        { value: 'date_desc', name: 'Date (nyeste først)'},
        { value: 'date_asc', name: 'Dato (ældste først)' },
    ];
    
    let currentPage = 1;
    let pageNumber = 1;
    let totalPages = 1;
    let totalListings;

    async function fetchListings() {
        loading = true;
        try {
            const query = new URLSearchParams({
                search: searchQuery,
                sort: sortOption,
                page: pageNumber
            }).toString();

            const response = await fetch(`${$BASE_URL}/api/listings?${query}`, {
                credentials: 'include',
            });

            if (response.ok) {
                const result = await response.json();
                listings = result.data;
                totalPages = result.pages;
                currentPage = result.page;
                totalListings = result.total;
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

    function nextPage() {
        currentPage = Number(currentPage);
        if (currentPage < totalPages) {
            pageNumber = currentPage + 1;
            fetchListings();
        }
    }

    function prevPage() {
        currentPage = Number(currentPage);
        if (currentPage > 1) {
            pageNumber = currentPage - 1;
            fetchListings();
        }
    }
  
    async function fetchBrands() {
        try {
            const response = await fetch(`${$BASE_URL}/api/cars/brands`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                brandOptions = data.data;
            } else {
                errorMessage = "Kunne ikke indlæse bilmærker";
                failToast = true;
            }
        } catch (error) {
            errorMessage = "Kunne ikke indlæse bilmærker";
            failToast = true;
        }
    }

    function refreshListings() {
        fetchListings();
    }

    onMount(() => {
        fetchListings();
        fetchBrands();
    });
</script>

<div class="py-16 mx-auto min-h-screen">
    <Heading class="mb-4 text-center">Biler</Heading>
    <div class="flex flex-col items-center">
        <div class="flex gap-2 my-6">
            <Search
            placeholder="Søg efter bil"
            size="md"
            class="w-96"
            bind:value={searchQuery}
            on:input={refreshListings}
            />
        </div>
    </div>
    {#if $user?._id}
        <div class="flex items-center justify-center">
            <Button on:click={() => (hidden4 = false)}><Tag class="mr-2"/> Sælg din bil</Button>
        </div>
    {/if}
    {#if loading}
    <div class="flex items-center justify-center min-h-screen">
        <div class="flex flex-col items-center">
            <Spinner size={16} />
            <span class="text-black dark:text-white mt-2">Indlæser...</span>
        </div>
    </div>
    {:else if listings.length}
        <div class="grid grid-cols-2 gap-4 mt-8 mb-8 w-full max-w-6xl mx-auto">
            <div class="gap-x-1 items-left content-center justify-start text-base text-gray-700 dark:text-gray-400 m-4">
                Fundet <span class="font-semibold text-gray-900 dark:text-white">{totalListings}</span> resultater
            </div>
            <div class="flex justify-end m-4">
                <Select items={sortOptions} bind:value={sortOption} on:change={refreshListings} placeholder="Sorter" class="w-48 h-15"/>
            </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mb-8 w-full max-w-6xl mx-auto">
            {#each listings as listing (listing._id)}
                <ListingCard {listing} />
            {/each}
        </div>
        <div class="flex flex-col items-center justify-center gap-2">

          
            <div class="flex space-x-3 rtl:space-x-reverse">
                <PaginationItem class="flex items-center justify-center" on:click={prevPage} disabled>
                  <ArrowLeft class="w-3.5 h-3.5" />
                </PaginationItem>
                    <div class="flex gap-x-1 items-center justify-center text-sm text-gray-700 dark:text-gray-400">
                    Side <span class="font-semibold text-gray-900 dark:text-white">{currentPage}</span>
                    af
                    <span class="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
                  </div>
                <PaginationItem class="flex items-center justify-center" on:click={nextPage}>
                  <ArrowRight class="w-3.5 h-3.5" />
                </PaginationItem>
              </div>
          </div>
    {:else}
        <p class="col-span-full text-black dark:text-white mt-2 text-center">Ingen biler fundet.</p>
    {/if}
</div>

<AddListingComponent 
    bind:hidden4={hidden4}
    brandOptions={brandOptions}
    addListing={refreshListings}
/>

<ErrorToast {errorMessage} {failToast}/>