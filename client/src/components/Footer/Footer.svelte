<script>
    import { Footer, FooterCopyright, FooterLinkGroup, FooterBrand, FooterLink } from 'flowbite-svelte';
</script>

<Footer footerType="logo">
    <div class="sm:flex sm:items-center sm:justify-between m-12">
        <img src={'/assets/images/logo-dark.png'} class="dark:hidden me-3 h-6 sm:h-14" alt="LeasePortalen Logo" />
        <img src={'/assets/images/logo-light.png'} class="hidden dark:block me-3 h-6 sm:h-14" alt="LeasePortalen Logo" />
          <FooterLinkGroup ulClass="flex flex-wrap items-center mb-6 text-sm text-gray-500 sm:mb-0 dark:text-gray-400">
        <FooterLink href="/contact">Kontakt Os</FooterLink>
        </FooterLinkGroup>
    </div>
    <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
    <FooterCopyright href="/" by="LeasePortalen - "/>
</Footer>