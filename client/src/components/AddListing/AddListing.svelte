<script>
    import { Button, CloseButton, Label, Input, Drawer, Select, ButtonGroup, InputAddon, Textarea, Dropzone, Checkbox, MultiSelect } from 'flowbite-svelte';    import { sineIn } from 'svelte/easing';
    import { CloudUpload, Trash2 } from 'lucide-svelte';

    export let brandOptions = [];
    export let modelOptions = [];
    export let fuelData = [];
    export let versionData = [];
    export let colorData = [];
    export let equipmentData = [];

    export let carPrice = '';
    export let carBrand = '';
    export let carModel = '';
    export let carYear = '';
    export let carFuel = '';
    export let carVersion = '';
    export let carAutomaticGear = false;
    export let carImages = [];
    export let carColor = '';
    export let carMileage = '';
    export let carPower = '';
    export let carEquipment = [];
    export let carExclusiveVAT = false;
    export let carDescription = '';

    export let addListing;
    export let handleBrandChange;
    export let handleModelChange;
    export let hidden4;
    export let handleChange;
    export let removeImage;

    const transitionParams = {
        x: 320,
        duration: 200,
        easing: sineIn
    };

    let imagePreviews = [];

    $: imagePreviews = carImages.map(image => URL.createObjectURL(image));
</script>

<Drawer class="w-[500px] p-8" placement="right" transitionType="fly" {transitionParams} bind:hidden={hidden4} id="sidebar4">
    <div class="flex items-center">
        <h5 id="drawer-label" class="inline-flex items-center mb-6 text-base font-semibold text-gray-500 dark:text-gray-400">
            Opret Annonce
        </h5>
        <CloseButton on:click={() => (hidden4 = true)} class="mb-4 dark:text-white" />
    </div>
    <form on:submit|preventDefault={addListing} class="mb-6">
        <div class="mb-6">
            <Label for="carBrand" class="block mb-2">Mærke</Label>
            <Select items={brandOptions} bind:value={carBrand} on:change={handleBrandChange} size="sm" placeholder="Vælg mærke" />
        </div>
        <div class="mb-6">
            <Label for="carModel" class="block mb-2">Model</Label>
            <Select items={modelOptions} bind:value={carModel} on:change={handleModelChange} size="sm" placeholder="Vælg model" />
        </div>
        <div class="mb-6">
            <Label for="carYear" class="block mb-2">Årgang</Label>
            <Input id="carYear" name="carYear" bind:value={carYear} required type="number" placeholder="Årgang" />
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