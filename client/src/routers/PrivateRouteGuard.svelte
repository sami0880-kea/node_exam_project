<script>
  import { navigate } from "svelte-routing";
  import { fetchUser, user } from "../stores/userStore.js";
  import { onMount } from "svelte";

  onMount(async () => {
      const isLoggedIn = await fetchUser();
      if (!isLoggedIn) {
          navigate("/login");
      }
  });
</script>

{#if $user}
  <slot />
{/if}