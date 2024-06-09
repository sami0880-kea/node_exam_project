<script>
    import { Card, Badge } from 'flowbite-svelte';
    import { navigate } from 'svelte-routing';
    
    export let listing;

    function viewDetails(id) {
        navigate(`/listing/${id}`);
    }

    function formatNumber(price) {
        return new Intl.NumberFormat('de-DE').format(price);
    }

    function getImageSrc(images) {
        if (images && images.length > 0) {
            return `${images[0]}`;
        } else {
            return "/assets/images/car_placeholder.png";
        }
    }
</script>

<Card class="cursor-pointer" padding="none" on:click={() => viewDetails(listing._id)} >
    <img src={getImageSrc(listing.images)} class="object-cover rounded-t-lg h-48" alt="Bil">
    <div class="m-4">
        <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{listing.brand}</h5>
        <h4 class="mb-2 text-l font-semibold tracking-tight text-gray-900 dark:text-white">{listing.model}</h4>
        <div class="mb-2">
            <Badge>{listing.year}</Badge>
        <Badge>{listing.fuel}</Badge>
        <Badge>{listing.version}</Badge>
        <Badge>{formatNumber(listing.mileage)} km</Badge>
        <Badge>{listing.power} hk</Badge>
        <Badge>{listing.automaticGear ? 'Automatisk' : 'Manuel'}</Badge>
        </div>
        <div>
            <h3 class="text-xl font-bold text-gray-700 dark:text-white">{formatNumber(listing.price)} kr.</h3>
        <h4 class="text-sm">{listing.exclusiveVAT ? 'Ekskl. moms' : 'Inkl. moms'}</h4>
        </div>
    </div>
</Card>