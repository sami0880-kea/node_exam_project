<script>
    import { Router, Route } from "svelte-routing";
    import { fetchUser } from "./stores/userStore.js";
    import PrivateRoute from "./routers/PrivateRoute.svelte";
    import Navbar from './components/Navbar/Navbar.svelte';
    import { onMount } from "svelte";

    import Home from "./pages/Home/Home.svelte";
    import Listings from "./pages/Listings/Listings.svelte";
    import MyListings from "./pages/MyListings/MyListings.svelte";
    import Listing from "./pages/Listing/Listing.svelte";
    import Login from "./pages/Login/Login.svelte";
    import Signup from "./pages/Signup/Signup.svelte";
    import Contact from "./pages/Contact/Contact.svelte";
    import Messages from "./pages/Messages/Messages.svelte"; 
    import Inbox from "./pages/Inbox/Inbox.svelte"; 
    import Footer from "./components/Footer/Footer.svelte";

    onMount(() => {
        fetchUser();
    });

    export let url = "";
</script>

<Navbar/>
<Router {url}>
    <Route path="/" component={Home} />
    <Route path="/login" component={Login} />
    <Route path="/signup" component={Signup} />
    <Route path="/contact" component={Contact} />
    <Route path="/listings" component={Listings} />
    <Route path="/listing/:id" component={Listing} />

    <PrivateRoute path="/inbox">
        <Inbox/>
    </PrivateRoute>
    
    <PrivateRoute path="/messages/:id" let:params>
        <Messages id={params.id} />
    </PrivateRoute>

    <PrivateRoute path="/mylistings">
        <MyListings/>
    </PrivateRoute>
</Router>
<Footer/>