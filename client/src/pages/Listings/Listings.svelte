<script>
    import { Heading, Button, Spinner } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import AddListingComponent from '../../components/AddListing/AddListing.svelte';
    import ListingCard from '../../components/ListingCard/ListingCard.svelte';

    import { fuelData } from '../../data/fuelData.js';
    import { versionData } from '../../data/versionData.js';
    import { colorData } from '../../data/colorData.js';
    import { equipmentData } from '../../data/equipmentData.js';
    import { user } from '../../stores/userStore.js';
    import { Tag } from 'lucide-svelte';
    import ErrorToast from '../../components/ErrorToast/ErrorToast.svelte';

    let hidden4 = true;
    let carBrand = '';
    let carBrandName = '';
    let carModel = '';
    let carModelName = '';
    let carPrice = '350000';
    let carYear = '2020';
    let carFuel = 'Diesel';
    let carVersion = 'Sedan';
    let carAutomaticGear = true;
    let carImages = [];
    let carColor = 'Blue Metal';
    let carMileage = '60000';
    let carPower = '204';
    let carEquipment = [];
    let carExclusiveVAT = true;
    let carDescription = 'bla bla description...';

    let listings = [];
    let brandOptions = [];
    let modelOptions = [];
    let loading = true;

    let failToast = false;
    let errorMessage = '';
    async function fetchListings() {
        try {
            const response = await fetch('http://localhost:8080/api/listings', {
                credentials: 'include',
            });
            if (response.ok) {
                const result = await response.json();
                listings = result.data;
            } else {
                errorMessage = "Kunne ikke indlæse annoncer";
                failToast = true;                }
        } catch (error) {
            errorMessage = "Kunne ikke indlæse annoncer";
            failToast = true;
        } finally {
            loading = false;
        }
    }

    async function fetchBrands() {
        try {
            const response = await fetch('http://localhost:8080/api/cars/brands', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                brandOptions = data.data;
            } else {
                errorMessage = "Kunne ikke indlæse bilmærker";
                failToast = true;            }
        } catch (error) {
            errorMessage = "Kunne ikke indlæse bilmærker";
            failToast = true;        
        }
    }

    async function fetchModels(brandId) {
        modelOptions = [];
        carModelName = '';
        try {
            const response = await fetch(`http://localhost:8080/api/cars/models/${brandId}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.ok) {
                const data = await response.json();
                modelOptions = data.data;
            } else {
                errorMessage = "Kunne ikke indlæse bilmodeller";
                failToast = true;
            }
        } catch (error) {
            errorMessage = "Kunne ikke indlæse bilmodeller";
            failToast = true;
        }
    }

    function handleModelChange(event) {
        carModel = event.target.value;
        const selectedModel = modelOptions.find(model => model.value === carModel);
        carModelName = selectedModel ? selectedModel.name : '';
    }

    function handleBrandChange(event) {
        carBrand = event.target.value;
        const selectedBrand = brandOptions.find(brand => brand.value === carBrand);
        carBrandName = selectedBrand ? selectedBrand.name : '';
        fetchModels(carBrand);
    }

    async function addListing() {
        try {
            const imageUrls = await Promise.all(carImages.map(async (image) => {
                const formData = new FormData();
                formData.append('image', image);

                const response = await fetch('http://localhost:8080/api/upload', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const data = await response.json();
                return data.imageUrl;
            }));

            const response = await fetch('http://localhost:8080/api/listings', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    price: carPrice,
                    brand: carBrandName,
                    model: carModelName,
                    year: carYear,
                    fuel: carFuel,
                    version: carVersion,
                    automaticGear: carAutomaticGear,
                    images: imageUrls,
                    color: carColor,
                    mileage: carMileage,
                    power: carPower,
                    equipment: carEquipment,
                    exclusiveVAT: carExclusiveVAT,
                    description: carDescription
                })
            });

            if (response.ok) {
                hidden4 = true;
                fetchListings();
            } else {
                errorMessage = "Kunne ikke oprette annonce";
                failToast = true;            
            }
        } catch (error) {
            errorMessage = "Kunne ikke oprette annonce";
            failToast = true;  
        }
    }

    onMount(() => {
        fetchListings();
        fetchBrands();
    });

    function handleChange(event) {
        const files = event.target.files;
        if (files.length > 0) {
            carImages = [...carImages, files[0]];
        }
    };

    function removeImage(index) {
        carImages = carImages.filter((_, i) => i !== index);
    };
</script>

<div class="py-16 mx-auto min-h-screen">
    <Heading class="mb-4 text-center">Biler</Heading>
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mb-8 w-full max-w-6xl mx-auto">
            {#each listings as listing (listing._id)}
                <ListingCard {listing} />
            {/each}
        </div>
    {:else}
        <p class="col-span-full text-black dark:text-white mt-2 text-center">Ingen biler fundet.</p>
    {/if}
</div>

<AddListingComponent 
    {brandOptions} 
    {modelOptions} 
    {fuelData}
    {versionData}
    {colorData}
    {equipmentData}
    bind:hidden4={hidden4}
    bind:carPrice={carPrice}
    bind:carBrand={carBrand}
    bind:carModel={carModel}
    bind:carYear={carYear}
    bind:carFuel={carFuel}
    bind:carVersion={carVersion}
    bind:carAutomaticGear={carAutomaticGear}
    bind:carImages={carImages}
    bind:carColor={carColor}
    bind:carMileage={carMileage}
    bind:carPower={carPower}
    bind:carEquipment={carEquipment}
    bind:carExclusiveVAT={carExclusiveVAT}
    bind:carDescription={carDescription}
    {addListing}
    {handleBrandChange}
    {handleModelChange}
    {handleChange}
    {removeImage}
/>
<ErrorToast {errorMessage} {failToast}/>