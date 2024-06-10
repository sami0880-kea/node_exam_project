<script>
    import { Button, CloseButton, Label, Input, Drawer, Select, ButtonGroup, InputAddon, Textarea, Dropzone, Checkbox, MultiSelect } from 'flowbite-svelte';
    import { sineIn } from 'svelte/easing';
    import { CloudUpload, Trash2 } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';
    import { onMount } from 'svelte';

    import { fuelData } from '../../data/fuelData.js';
    import { versionData } from '../../data/versionData.js';
    import { colorData } from '../../data/colorData.js';
    import { equipmentData } from '../../data/equipmentData.js';
    import ErrorToast from '../ErrorToast/ErrorToast.svelte';
  import { BASE_URL } from '../../stores/urlStore.js';

    export let id;
    export let hidden = true;

    let failToast = false;
    let errorMessage = '';

    let car = null;
    let imagePreviews = [];
    let newImages = [];
    const removedImages = [];

    let carPrice = '';
    let carBrand = '';
    let carModel = '';
    let carYear = '';
    let carFuel = '';
    let carVersion = '';
    let carAutomaticGear = false;
    let carImages = [];
    let carColor = '';
    let carMileage = '';
    let carPower = '';
    let carEquipment = [];
    let carExclusiveVAT = false;
    let carDescription = '';

    const dispatch = createEventDispatcher();

    async function fetchListingDetails() {
        try {
            const response = await fetch(`${$BASE_URL}/api/listings/${id}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const result = await response.json();
                car = result.data;
                carPrice = car.price;
                carBrand = car.brand;
                carModel = car.model;
                carYear = car.year;
                carFuel = car.fuel;
                carVersion = car.version;
                carAutomaticGear = car.automaticGear;
                carImages = car.images;
                carColor = car.color;
                carMileage = car.mileage;
                carPower = car.power;
                carEquipment = car.equipment;
                carExclusiveVAT = car.exclusiveVAT;
                carDescription = car.description;

                imagePreviews = car.images.map((image) => `${image}`);
            } else {
                errorMessage = "Annonce ikke fundet";
                failToast = true;
            }
        } catch (error) {
            errorMessage = "Kunne ikke indlæse annonce";
            failToast = true;
        }
    }

    async function updateListing() {
        try {
            let imageUrls = carImages.filter(image => !removedImages.includes(image)); 

            if (newImages.length > 0) {
                const newImageUrls = await Promise.all(newImages.map(async (image) => {
                    const formData = new FormData();
                    formData.append('image', image);

                    const response = await fetch(`${$BASE_URL}/api/upload`, {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    });

                    const result = await response.json();
                    return result.data;
                }));
                imageUrls = imageUrls.concat(newImageUrls);
            }

            const response = await fetch(`${$BASE_URL}/api/listings/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    price: carPrice,
                    brand: carBrand,
                    model: carModel,
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
                    description: carDescription,
                })
            });
            if (response.ok) {
                dispatch('updateListing');
                hidden = true;
            } else {
                errorMessage = "Kunne ikke opdatere";
                failToast = true;
            }
        } catch (error) {
            errorMessage = "Kunne ikke opdatere";
            failToast = true;        
        }
    }

    onMount(() => {
        fetchListingDetails();
    });

    function handleChange(event) {
        const files = event.target.files;
        if (files.length > 0) {
            newImages = [...newImages, ...files];
            imagePreviews = [...imagePreviews, ...Array.from(files).map(file => URL.createObjectURL(file))];
        }
    };

    function removeImage(index) {
        const removedImage = imagePreviews[index];
        if (carImages.includes(removedImage)) {
            removedImages.push(removedImage);
        }
        imagePreviews = imagePreviews.filter((_, i) => i !== index);
        newImages = newImages.filter((_, i) => i !== index);
    }   

    const transitionParams = {
        x: 320,
        duration: 200,
        easing: sineIn
    };
</script>

<Drawer class="w-[500px] p-8" placement="right" transitionType="fly" {transitionParams} bind:hidden={hidden} id="sidebar4">
    <div class="flex items-center">
        <h5 id="drawer-label" class="inline-flex items-center mb-6 text-base font-semibold text-gray-500 dark:text-gray-400">
            Rediger Annonce
        </h5>
        <CloseButton on:click={() => (hidden = true)} class="mb-4 dark:text-white" />
    </div>
    <form on:submit|preventDefault={updateListing} class="mb-6">
        <div class="mb-6">
            <Label for="carYear" class="block mb-2">Årgang</Label>
            <Input id="carYear" name="carYear" bind:value={carYear} required type="number" placeholder="Vælg årgang" />
        </div>
        <div class="mb-6">
            <Label for="carPrice" class="block mb-2">Pris</Label>
            <ButtonGroup class="w-full" size="md">
                <Input id="carPrice" name="carPrice" bind:value={carPrice} required type="number" placeholder="Pris" />
                <InputAddon>kr.</InputAddon>
            </ButtonGroup>
        </div>
        <div class="mb-6">
            <Label for="carFuel" class="block mb-2">Brændstof</Label>
            <Select items={fuelData} bind:value={carFuel} size="sm" placeholder="Vælg brændstof" />
        </div>
        <div class="mb-6">
            <Label for="carVersion" class="block mb-2">Version</Label>
            <Select items={versionData} bind:value={carVersion} size="sm" placeholder="Vælg version" />
        </div>
        <div class="mb-6">
            <Checkbox bind:checked={carAutomaticGear}>Automatisk Gear</Checkbox>
        </div>
        <div class="mb-6">
            <Label for="carImages" class="block mb-2">Billeder</Label>
            {#if imagePreviews.length > 0}
                <div class="flex flex-wrap gap-2 mb-4">
                    {#each imagePreviews as preview, index}
                        <div class="relative">
                            <img src={preview} alt="Preview" class="w-20 h-20 object-cover rounded-sm" />
                            <button type="button" on:click={() => removeImage(index)}><Trash2 size={22} class="absolute top-1 right-1 bg-red-500 text-white rounded-sm p-1 cursor-pointer text-xs" /></button>
                        </div>
                    {/each}
                </div>
            {/if}
            <Dropzone
                id="carImages"
                on:dragover={(event) => event.preventDefault()}
                on:change={handleChange}>
                <CloudUpload class="mb-3 w-10 h-10 text-gray-400"/>
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Upload billeder af bilen</span></p>
                <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG el. JPEG (MAX. 1920x1080px)</p>
            </Dropzone>
        </div>
        <div class="mb-6">
            <Label for="carColor" class="block mb-2">Farve</Label>
            <Select items={colorData} bind:value={carColor} size="sm" placeholder="Vælg farve" />
        </div>
        <div class="mb-6">
            <Label for="carMileage" class="block mb-2">Kørte kilometer</Label>
            <Input id="carMileage" name="carMileage" bind:value={carMileage} required type="number" placeholder="Indtast kilometer antal" />
        </div>
        <div class="mb-6">
            <Label for="carPower" class="block mb-2">HK (Hestekræfter)</Label>
            <Input id="carPower" name="carPower" bind:value={carPower} required type="number" placeholder="Indtast antal hestekræfter" />
        </div>
        <div class="mb-6">
            <Label for="carEquipment" class="block mb-2">Udstyr</Label>
            <MultiSelect items={equipmentData} bind:value={carEquipment} size="sm" placeholder="Vælg udstyr" />
        </div>
        <div class="mb-6 flex">
            <Checkbox bind:checked={carExclusiveVAT}>Eksklusiv moms</Checkbox>
        </div>
        <div class="mb-6">
            <Label for="carDescription" class="block mb-2">Beskrivelse</Label>
            <Textarea id="carDescription" name="carDescription" bind:value={carDescription} required rows="4" placeholder="Indtast beskrivelse" />
        </div>
        <Button type="submit" class="w-full">Gem ændringer</Button>
    </form>
</Drawer>
<ErrorToast {errorMessage} {failToast}/>