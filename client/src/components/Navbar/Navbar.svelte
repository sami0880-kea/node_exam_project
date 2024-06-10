<script>
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Avatar, Dropdown, DropdownItem, DropdownHeader, DropdownDivider, Button } from 'flowbite-svelte';
    import { navigate } from "svelte-routing";
    import { user } from '../../stores/userStore.js';
    import { DarkMode } from 'flowbite-svelte';
    import { Mail } from 'lucide-svelte';
    import ErrorToast from '../ErrorToast/ErrorToast.svelte';
    import { BASE_URL } from '../../stores/urlStore.js';

    const activeUrl = window.location.pathname;

    let failToast = false;
    let errorMessage = '';

    async function logout() {
        try {
            const response = await fetch(`${$BASE_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                user.set(null);
                navigate("/login", { replace: true });
            }
        } catch (error) {
            errorMessage = "Kunne ikke logge ud...";
            failToast = true;       
        }
    }
 </script> 
  
  <Navbar>
    <NavBrand href="/">
      <img src={'/assets/images/logo-dark.png'} class="dark:hidden me-3 h-6 sm:h-14" alt="LeasePortalen Logo" />
      <img src={'/assets/images/logo-light.png'} class="hidden dark:block me-3 h-6 sm:h-14" alt="LeasePortalen Logo" />
    </NavBrand>
    
    <div class="flex items-center md:order-2">
      <DarkMode class="text-primary-500 dark:text-primary-600 border dark:border-gray-800 mx-4" />
      {#if $user?._id}
        <Button href="/inbox" class="hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5 text-primary-500 dark:text-primary-600 border dark:border-gray-800 mr-4">
          <Mail size={20.5} class="text-white dark:text-white" />
        </Button>

        <Avatar id="avatar-menu"/>
        <NavHamburger class1="w-full md:flex md:w-auto md:order-1" />
        
        <Dropdown placement="bottom" triggeredBy="#avatar-menu">
          <DropdownHeader>
            <span class="block text-sm font-bold">Hej, {$user.name} 👋</span>
          </DropdownHeader>
          <DropdownItem on:click={() => navigate('/mylistings')}>Mine Annoncer</DropdownItem>
          <DropdownDivider />
          <DropdownItem on:click={logout}>Log ud</DropdownItem>
        </Dropdown>
      {:else}
        <Button size="sm" href="/login">Login</Button>
        <Button size="sm" href="/signup" color="alternative" class="ml-2">Opret Bruger</Button>
        <NavHamburger />
      {/if}
      </div>
      <NavUl {activeUrl}>
      <NavLi href="/">Hjem</NavLi>
      <NavLi href="/listings">Biler</NavLi>
      <NavLi href="/contact">Kontakt os</NavLi>
    </NavUl>
  </Navbar>

  <ErrorToast {errorMessage} {failToast}/>