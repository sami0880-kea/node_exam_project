<script>
    import { Heading, Span, Button } from 'flowbite-svelte';
    import { ArrowRight } from 'lucide-svelte';
</script>

<div class="flex flex-col items-center justify-center min-h-screen">
    <div class="flex flex-col md:flex-row items-center w-full m-30 max-w-7xl mx-auto">
        <div class="text-left md:w-1/2 mb-8 md:mb-0">
            <Heading tag="h1" class="text-6xl font-extrabold mb-4">Sælg din <Span highlight class="text-6xl font-extrabold">leaset bil</Span> uden <Span underline decorationClass="decoration-8 decoration-blue-400 dark:decoration-blue-600">skjulte gebyrer</Span>!</Heading>
            <Button href="/listings" class="mt-4 px-6 cursor-pointer">
                Se biler til salg
                <ArrowRight class="ml-2"/>
            </Button>
        </div>  
        <div class="md:w-1/2 flex justify-center md:justify-end">
            <img src={'/assets/images/car_home.png'} alt="Home Car"/>
        </div>
    </div>  
</div>