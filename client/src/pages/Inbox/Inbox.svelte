<script>
  import { navigate } from 'svelte-routing';
  import { user } from '../../stores/userStore.js';
  import { Avatar } from 'flowbite-svelte';
  import ErrorToast from '../../components/ErrorToast/ErrorToast.svelte';

  let rooms = [];
  let currentUser;

  $: currentUser = $user;

  let failToast = false;
  let errorMessage = '';

  async function fetchRooms() {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/conversations/user/${currentUser._id}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const result = await response.json();
        rooms = result.data;
      } else {
        errorMessage = "Kunne ikke indlæse samtaler...";
        failToast = true;
      }
    } catch (error) {
      errorMessage = "Kunne ikke indlæse samtaler...";
      failToast = true;
    }
  }

  $: if (currentUser) {
    fetchRooms();
  }

  function goToConversation(roomId) {
    navigate(`/messages/${roomId}`);
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen text-center">
  <h2 class="text-2xl text-gray-900 font-semibold dark:text-white mb-4">Dine Beskeder</h2>
  <div class="w-full max-w-lg">
    {#if rooms.length > 0}
      <ul class="divide-y divide-gray-200 dark:divide-gray-700 ">
        {#each rooms as room (room._id)}
          <li class="py-3 sm:py-4">
            <button class="flex items-start space-x-3 cursor-pointer"  on:click={() => goToConversation(room._id)}>
              <img src={room.listingImage} alt="Listing Car" class="w-12 h-12 object-cover rounded-full"/>
              <div class="flex-1 min-w-0">
                <p class="text-left text-sm font-semibold text-gray-900 truncate dark:text-white">{room.listingName ? room.listingName : 'Slettet annonce'}</p>
                <p class="text-left text-sm text-gray-500 truncate dark:text-gray-400">{room.latestMessage.text}</p>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-gray-900 dark:text-white">Du har ikke startet en samtale endnu.</p>
    {/if}
  </div>
</div>
<ErrorToast {errorMessage} {failToast}/>