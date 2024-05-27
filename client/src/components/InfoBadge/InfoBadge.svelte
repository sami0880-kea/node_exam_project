<script>
    export let icon;
    export let title;
    export let value;
</script>

<div class="flex flex-row p-2 text-black dark:text-white m-2 rounded-md items-center justify-center">
    <svelte:component this={icon} class="mr-4"/>
    <div>
        <h4 class="font-light">{title}</h4>
        <p class="font-bold">{value}</p>
    </div>
</div>