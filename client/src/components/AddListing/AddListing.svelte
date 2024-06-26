<script>
    import { Button, CloseButton, Label, Input, Drawer, Select, ButtonGroup, InputAddon, Textarea, Dropzone, Checkbox, MultiSelect} from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import { sineIn } from 'svelte/easing';
    import { CloudUpload, Trash2 } from 'lucide-svelte';
    import ErrorToast from '../ErrorToast/ErrorToast.svelte';

    import { fuelData } from '../../data/fuelData.js';
    import { versionData } from '../../data/versionData.js';
    import { colorData } from '../../data/colorData.js';
    import { equipmentData } from '../../data/equipmentData.js';
    import { BASE_URL } from '../../stores/urlStore.js';

    export let hidden4;
    export let addListing;
    export let brandOptions;
    
    let modelOptions = [];

    let carBrand = '';
    let carModel = '';
    let carPrice = '635000';
    let carYear = '2020';
    let carFuel = 'Petrol';
    let carVersion = 'Station Car';
    let carAutomaticGear = true;
    let carImages = [];
    let carColor = 'Gråmetal';
    let carMileage = '48000';
    let carPower = '600';
    let carEquipment = ['appleCarplay', 'glassRoof'];
    let carExclusiveVAT = false;
    let carDescription = 'Hermed udbydes en super flot og velholdt Audi RS6 i den underspillede Daytona grå med mange af de rigtige krydser på udstyrslisten, et godt kilometertal og fortsat fabriksgaranti. På alle måder en rigtig velkørende maskine, som der er taget utroligt godt hånd om.';
    let carBrandName = '';
    let carModelName = '';

    let errorMessage = '';
    let failToast = false;

    const transitionParams = {
        x: 320,
        duration: 200,
        easing: sineIn
    };

    let imagePreviews = [];

    $: imagePreviews = carImages.map(image => URL.createObjectURL(image));

    async function fetchBrands() {
        try {
            const response = await fetch($BASE_URL + '/api/cars/brands', {
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

    async function fetchModels(brandId) {
        modelOptions = [];
        carModelName = '';
        try {
            const response = await fetch(`${$BASE_URL}/api/cars/models/${brandId}`, {
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

    function handleBrandSelection(event) {
        carBrand = event.target.value;
        const selectedBrand = brandOptions.find(brand => brand.value === carBrand);
        carBrandName = selectedBrand ? selectedBrand.name : '';
        fetchModels(carBrand);
    }

    function handleModelSelection(event) {
        carModel = event.target.value;
        const selectedModel = modelOptions.find(model => model.value === carModel);
        carModelName = selectedModel ? selectedModel.name : '';
    }

    async function handleAddListing() {
        if (!carBrand || !carModel || !carPrice || !carYear || !carFuel || !carVersion || !carColor || !carMileage || !carPower || !carDescription) {
            errorMessage = "Alle felter skal udfyldes";
            failToast = true;
            return;
        }

        try {
            const uploadPromises = carImages.map(async (image) => {
                const formData = new FormData();
                formData.append('image', image);

                const response = await fetch(`${$BASE_URL}/api/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error();
                }

                const data = await response.json();
                return data.data;
            });

            const imageUrls = await Promise.all(uploadPromises);
            
            const response = await fetch(`${$BASE_URL}/api/listings`, {
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
                addListing();
            } else {
                errorMessage = "Kunne ikke oprette annonce";
                failToast = true;
            }
        } catch (error) {
            errorMessage = "Kunne ikke oprette annonce";
            failToast = true;
        }
    }


    function handleChange(event) {
        const files = event.target.files;
        if (files.length > 0) {
            carImages = [...carImages, files[0]];
        }
    }

    function removeImage(index) {
        carImages = carImages.filter((_, i) => i !== index);
    }

    onMount(() => {
        fetchBrands();
    });
</script>

<Drawer class="w-[500px] p-8" placement="right" transitionType="fly" {transitionParams} bind:hidden={hidden4} id="sidebar4">
    <div class="flex items-center">
        <h5 id="drawer-label" class="inline-flex items-center mb-6 text-base font-semibold text-gray-500 dark:text-gray-400">
            Opret Annonce
        </h5>
        <CloseButton on:click={() => (hidden4 = true)} class="mb-4 dark:text-white" />
    </div>
    <form on:submit|preventDefault={handleAddListing} class="mb-6">
        <div class="mb-6">
            <Label for="carBrand" class="block mb-2">Mærke</Label>
            <Select items={brandOptions} bind:value={carBrand} on:change={handleBrandSelection} size="sm" placeholder="Vælg mærke" />
        </div>
        <div class="mb-6">
            <Label for="carModel" class="block mb-2">Model</Label>
            <Select items={modelOptions} bind:value={carModel} on:change={handleModelSelection} size="sm" placeholder="Vælg model" />
        </div>
        <div class="mb-6">
            <Label for="carYear" class="block mb-2">Årgang</Label>
            <Input id="carYear" name="carYear" bind:value={carYear} required type="number" placeholder="Årgang" />
        </div>
        <div class="mb-6">
            <Label for="carPrice" class="block mb-2">Pris</Label>
            <ButtonGroup class="w-full" size="md">
                <Input id="carPrice" name="carPrice" bind:value={carPrice} required type="number" placeholder="Pris" min="1"/>
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
                            <Trash2 size={22} on:click={() => removeImage(index)} class="absolute top-1 right-1 bg-red-500 text-white rounded-sm p-1 cursor-pointer text-xs" />
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
        <Button type="submit" class="w-full">Opret annonce</Button>
    </form>
</Drawer>

<ErrorToast {errorMessage} {failToast}/>