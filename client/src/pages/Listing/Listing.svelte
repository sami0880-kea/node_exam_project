<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { user } from '../../stores/userStore.js';
    import { Card, Carousel, Badge, Button, Avatar, Breadcrumb, BreadcrumbItem, Spinner, Modal, Img } from 'flowbite-svelte';
    import { Calendar, Check, CircleAlert, Gauge, Joystick, Mail, Rabbit } from 'lucide-svelte';
    import InfoBadge from '../../components/InfoBadge/InfoBadge.svelte';
    import { equipmentData } from '../../data/equipmentData.js';
    import EditListing from '../../components/EditListing/EditListing.svelte';
    import ErrorToast from '../../components/ErrorToast/ErrorToast.svelte';

    export let id;
    let car = null;
    let currentUser;
    let hidden4 = true;

    let confirmDeleteModal = false;

    $: currentUser = $user;

    let images = [];

    let failToast = false;
    let errorMessage = '';
    
    async function fetchCarDetails() {
        try {
            const response = await fetch(`http://localhost:8080/api/listings/${id}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const result = await response.json();
                car = result.data;
                images = car.images.map((src, index) => ({
                    alt: `Image ${index + 1}`,
                    src: `${src}`,
                    title: `Image ${index + 1}`
                }));
                car.equipment = car.equipment.map(equip => {
                    const matchedEquip = equipmentData.find(e => e.value === equip);
                    return matchedEquip ? matchedEquip.name : equip;
                });
            } else {
                errorMessage = "Kunne ikke indlæse annonce";
                failToast = true;            }
        } catch (error) {
            errorMessage = "Kunne ikke indlæse annonce";
            failToast = true;            
        }
    }

    async function deleteListing() {
        try {
            const response = await fetch(`http://localhost:8080/api/listings/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                navigate('/listings');
            } else {
                errorMessage = "Fejl ved sletning af annonce";
                failToast = true;                }
        } catch (error) {
            errorMessage = "Fejl ved sletning af annonce";
            failToast = true;
        } finally {
            confirmDeleteModal = false;
        }
    }

    async function messageSeller() {
        if (!currentUser || !car) return;

        try {
            const response = await fetch(`http://localhost:8080/api/conversations/find/${currentUser._id}/${car.userId}/${id}`, {
                credentials: 'include',
            });
            if (response.ok) {
                const result = await response.json();
                const conversation = result.data;
                navigate(`/messages/${conversation._id}`);
            } else {
                errorMessage = "Kunne ikke åbne samtale!";
                failToast = true;            }
        } catch (error) {
            errorMessage = "Kunne ikke åbne samtale!";
            failToast = true;        
        }
    }

    function formatNumber(price) {
        return new Intl.NumberFormat('de-DE').format(price);
    }

    function editListing() {
        hidden4 = false;
    }

    function handleListingUpdated() {
        hidden4 = true;
        fetchCarDetails();
    }

    onMount(() => {
        fetchCarDetails();
    });
</script>

<div class="flex flex-col min-h-screen p-4">
    {#if car}
    <div class="flex flex-row m-2 justify-center">
        <Breadcrumb class="">
            <BreadcrumbItem href="/" home>Hjem</BreadcrumbItem>
            <BreadcrumbItem href="/listings">Biler</BreadcrumbItem>
            <BreadcrumbItem>{car.brand} {car.model}</BreadcrumbItem>
        </Breadcrumb>
    </div>
    <div class="flex flex-row justify-center">
        <div class="flex flex-col justify-center">
            <Card size="lg" padding="none" class="m-4 overflow-hidden">
                {#if images.length > 0}
                    <Carousel {images} let:Indicators let:Controls class="!h-[500px]">
                        <Controls />
                        <Indicators />
                    </Carousel>
                {:else}
                    <Img src="/assets/images/car_placeholder.png" alt="Car Placeholder" class="!h-[500px]"/>
                {/if}
            </Card>
                
            <Card size="lg" padding="none" class="m-4">
                <div class="flex flex-row">
                    <div class="w-full m-2 flex flex-row flex-wrap justify-center">
                        <InfoBadge 
                            icon={Gauge} 
                            title="Kilometer" 
                            value={`${formatNumber(car.mileage)} km`} 
                        />
                        <InfoBadge 
                            icon={Calendar} 
                            title="Årgang" 
                            value={car.year} 
                        />
                        <InfoBadge 
                            icon={Rabbit} 
                            title="Hestekræfter" 
                            value={`${car.power} hk`} 
                        />
                        <InfoBadge 
                            icon={Joystick} 
                            title="Gearkasse" 
                            value={car.automaticGear ? 'Automatisk' : 'Manuel'} 
                        />
                    </div>
                </div>
            </Card>                
            
            <Card size="lg" padding="sm" class="m-4">
                <h5 class="m-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white">Udstyr</h5>
                <div class="flex flex-wrap">
                    {#each car.equipment as item}
                    <Badge color="dark" class="m-1 p-3"><Check size={18} class="mr-1"/> {item}</Badge>
                    {/each}
                </div>
            </Card>

            <Card size="lg" padding="sm" class="m-4">
                <h5 class="m-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white">Beskrivelse</h5>
                <p class="m-2 whitespace-pre-wrap">{car.description}</p>
            </Card>
        </div>
        <Card class="m-4 h-full" size="sm">
            {#if car.userId === $user?._id}
            <div class="flex flex-row mb-4">  
                <Button outline color="dark" class="mr-2 w-full" on:click={editListing}>Rediger annonce</Button>
                <Button color="red" class="w-full" on:click={() => (confirmDeleteModal = true)}>Slet annonce</Button>
            </div>
            <Modal bind:open={confirmDeleteModal} size="xs" autoclose>
                <div class="text-center">
                    <CircleAlert class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
                    <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Er du sikker på at du vil slette annoncen?</h3>
                    <Button color="red" class="me-2" on:click={deleteListing}>Ja</Button>
                    <Button color="alternative" on:click={() => (confirmDeleteModal = false)}>Annuller</Button>
                </div>
            </Modal>
            {/if}
            <h5 class="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{car.brand}</h5>
            <p class="mb-3 text-xl font-normal text-gray-700 dark:text-gray-400 leading-tight">{car.model}</p>
            <h5 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{formatNumber(car.price)} kr.</h5>
            <h4 class="mb-4 text-sm text-gray-700 dark:text-gray-400">{car.exclusiveVAT ? 'Ekskl. moms' : 'Inkl. moms'}</h4>

            <div class="mb-2">
                <Badge color="dark" class="mb-1 p-2">{car.year}</Badge>
                <Badge color="dark" class="mb-1 p-2">{car.fuel}</Badge>
                <Badge color="dark" class="mb-1 p-2">{car.version}</Badge>
                <Badge color="dark" class="mb-1 p-2">{formatNumber(car.mileage)} km</Badge>
                <Badge color="dark" class="mb-1 p-2">{car.power} hk</Badge>
                <Badge color="dark" class="mb-1 p-2">{car.automaticGear ? 'Automatisk' : 'Manuel'}</Badge>
            </div>

            <hr class="my-4 border-gray-300 dark:border-gray-600" />
        
            <div class="flex flex-row">
                <div class="flex justify-between items-center mb-2">
                    <Avatar href="/" alt="Seller"/>
                </div>
                <div class="flex flex-col mx-4">
                    <div class="text-base mt-2 font-semibold leading-none text-gray-900 dark:text-white">
                        <p>{car.sellerName}</p>
                    </div>
                    <div class="mb-3 text-sm font-normal">
                        <p>Sælger</p>
                    </div>
                </div>
            </div> 
            {#if car.userId !== $user?._id}
                <Button on:click={messageSeller} class="bg-blue-500 text-white p-2 rounded mt-2" size="md"><Mail class="w-4 h-4 me-2"/> Send besked</Button>
            {/if}
        </Card>
    </div>
    {:else}
    <div class="flex items-center justify-center min-h-screen">
        <div class="flex flex-col items-center">
            <Spinner size={16} />
            <span class="text-black dark:text-white mt-2">Indlæser...</span>
        </div>
    </div>
    {/if}
</div>

<EditListing 
    id={id}
    bind:hidden={hidden4}
    on:updateListing={handleListingUpdated}
/>
<ErrorToast {errorMessage} {failToast}/>