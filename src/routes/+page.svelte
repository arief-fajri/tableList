<script>
  import TableList from "$lib/index.js"
  import { onMount } from "svelte"
  //   import TableList from "@rief_/tablelist"

  let data = []
  let loading = true

  const getData = async () => {
    const req = await fetch("https://dummyjson.com/products")
    if (req.status === 200) {
      const { products } = await req.json()
      data = products
      setTimeout(() => {
        loading = false
      })
    }
  }

  const columns = [
    { key: "id", title: "ID", value: (v) => v.id },
    { key: "name", title: "Name", value: (v) => v.title },
    { key: "description", title: "Description", value: (v) => v.description },
    { key: "price", title: "Price", value: (v) => v.price },
    { key: "stock", title: "Stock", value: (v) => v.stock },
  ]

  onMount(() => {
    getData()
  })
</script>


<main>
    <div id="main-content">
        <h1>Welcome to your library project</h1>
        <p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
        <p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
        <TableList {columns} {data} bind:loading selectorId="main-content"/>
    </div>
</main>

<style>
    main {
        overflow: clip;
        height: 100vh;
    }
    #main-content {
        overflow-y: scroll;
        height: 100%;
    }
</style>
