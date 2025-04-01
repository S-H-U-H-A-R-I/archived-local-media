<script>
    import { page } from "$app/state";
</script>

<div class="error-container">
    <h1>{page.status}: {page.error ? page.error.message : "Unknown Error"}</h1>
</div>

<style>
    .error-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        padding: 1rem;
    }

    h1 {
        color: #ff3e00;
        font-size: 2rem;
        text-align: center;
    }
</style>
