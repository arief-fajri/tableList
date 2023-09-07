<script>
	import { onDestroy, onMount, createEventDispatcher } from "svelte"
    import { intersect } from '.intersectObserver.js';
	import Icon from "@iconify/svelte"

    export let selectorId = 'main-content'
    export let columns = []
    export let data = []
    export let top = 0
    export let loading = true
    export let isExpand
    export let isClickable = true
    export let expandComponent
    export let containerHeight = 0
    export let zIndex = 1

    let scrollContainer
    let tableHeight

    const dispatch = createEventDispatcher();

    function onScroll() {
        try {
            let compTable = document.querySelector(".tableContainer");
            
            if (compTable) {
                let tableBodyRowData = compTable.querySelectorAll(".tableBodyRow td, .tableBodyRow th");
                let caption = compTable.querySelector("caption");
                let captionHeight = caption ? caption.offsetHeight : 0;
                let compTableBody = compTable.querySelector("tbody");
                let compTableHead = compTable.querySelector("thead");
                let columnHeaders = compTable.querySelectorAll(".columnHeader");
                let columnHeadersRow = compTableHead.querySelector(".columnHeaders");
                let columnHeadersNotEmpty = compTableHead.querySelectorAll(".columnHeader:not(.emptyCell)");
                let horizontalScroller = compTable.querySelector(".horizontal-scroller");
                let horizontalScrollerContent = horizontalScroller.querySelector(".horizontal-scroller-content");
                let originalTablePosition = "";
                
                function checkTableOffset() {
                    let compTableRect = compTable.getBoundingClientRect();
                    let compTableHeadRect = compTableHead.getBoundingClientRect();
                    let compTableBodyRect = compTableBody.getBoundingClientRect();
                    let compTableHeadRowRect = columnHeadersRow.getBoundingClientRect();
                    horizontalScroller.style.left = compTableRect.left + "px";
                    horizontalScroller.style.width = compTableRect.width + "px";
                    horizontalScrollerContent.style.width = compTable.scrollWidth + "px";

                    if (compTableRect.top <= top || compTableRect.top > window.innerHeight) {
                        calculateColumnHeaderWidthsAndPos(compTableRect, compTableHeadRect, compTableBodyRect);
                    } else if (compTableBodyRect.top > compTableHeadRect.bottom) {
                        resetTable();
                    }

                    if (compTableRect.bottom <= window.innerHeight || compTableRect.top > window.innerHeight) {
                        horizontalScroller.style.visibility = "hidden";
                    } else if (compTableRect.top <= window.innerHeight && compTable.clientWidth < compTable.scrollWidth) {
                        horizontalScroller.style.visibility = "visible";
                    }

                    if (compTableRect.bottom <= compTableHeadRect.bottom && !Array.from(compTableHead.classList).includes("atBottom")) {
                        compTableHead.classList.add("atBottom");
                    } else if (compTableHeadRect.top >= 0) {
                        compTableHead.classList.remove("atBottom");
                    }
                }

                function scrollColumnHeader(compTable) {
                    compTableHead.scrollLeft = compTable.scrollLeft;
                }

                function setColWidths(compTableRect) {
                    compTableHead.style.width = compTableRect.width + "px";
                    compTableHead.style.left = compTableRect.left + "px";
                    
                    for (let i = 0; i < columnHeaders.length; i++) {
                        if(tableBodyRowData[i]){
                            let tableBodyRowDataRect = tableBodyRowData[i].getBoundingClientRect();
                            if (Array.from(compTableHead.classList).includes("stickyHeader")) {
                                columnHeaders[i].style.minWidth = getComputedStyle(tableBodyRowData[i]).width;
                            } else {
                                columnHeaders[i].style.minWidth = "initial";
                            }
                        }
                    }
                }

                function calculateColumnHeaderWidthsAndPos(compTableRect, compTableHeadRect, compTableBodyRect) {
                    compTableHead.classList.add("stickyHeader");
                    scrollColumnHeader(compTable);
                    setColWidths(compTableRect);

                    let xMatrix = parseFloat(getComputedStyle(compTableBody).transform.substring(getComputedStyle(compTableBody).transform.indexOf("(")+1, getComputedStyle(compTableBody).transform.lastIndexOf(")")).split(",")[5]);
                    if ((xMatrix == 0 || getComputedStyle(compTableBody).transform == 'none')) {
                        compTableBody.style.transform = "translateY(" + (compTableHead.offsetHeight - captionHeight) + "px)";
                        compTable.style.paddingBottom = (compTableHead.offsetHeight - captionHeight) + "px";
                    }
                }

                function resetTable() {
                    compTableHead.classList.remove("stickyHeader");
                    compTableBody.style.transform = "translateY(0px)";
                    compTable.style.paddingBottom = "0px";
                }

                window.addEventListener("scroll", function() {
                    checkTableOffset();
                });

                window.addEventListener("resize", function () {
                    resetTable();
                    checkTableOffset();
                });

                compTable.addEventListener("scroll", function(e) {
                    if (Array.from(compTableHead.classList).includes("stickyHeader") && !Array.from(compTableHead.classList).includes("atBottom")) {
                        scrollColumnHeader(e.target);
                    }
                    horizontalScroller.scrollLeft = e.target.scrollLeft;
                });

                horizontalScroller.addEventListener("scroll", function(e) {
                    if (Array.from(compTableHead.classList).includes("stickyHeader") && !Array.from(compTableHead.classList).includes("atBottom")) {
                        scrollColumnHeader(e.target);
                    }
                    compTable.scrollLeft = e.target.scrollLeft;
                });

                compTableHead.addEventListener("scroll", function(e) {
                    horizontalScroller.scrollLeft = e.target.scrollLeft;
                    compTable.scrollLeft = e.target.scrollLeft;
                });

                let compTableRect = compTable.getBoundingClientRect();
                setColWidths(compTableRect);
                checkTableOffset();
            }
        } catch(error) {
            console.log(error);
        }
    }

    function sort(key) {
        columns = columns.map((m) => {
        if (m.key === key) {
            if (!m.sort) {
            m.sort = "asc";
            } else if (m.sort === "asc") {
            m.sort = "desc";
            } else {
            m.sort = null;
            }
            dispatch("sort", { key, sort: m.sort });
        } else {
            m.sort = null;
        }
        return m;
        });
    }
    
    onMount(()=>{
        if(containerHeight){
            scrollContainer = document.getElementById(selectorId); // define scroll container
            if(scrollContainer){
                scrollContainer.addEventListener("scroll", onScroll, {
                  passive: false,
                });
            }
        }
    })

    onDestroy(()=>{
        if (scrollContainer && containerHeight) {
            scrollContainer.removeEventListener("scroll", onScroll);
        }
    })
</script>

<div class="tableContainer scrollbar-none" style="--top: {top}px; --zIndex: {zIndex}; {containerHeight ? `max-height: ${containerHeight}px;` : ''}" bind:clientHeight={tableHeight} >
    <table>
        <thead>
            <tr class="columnHeaders">
                {#each columns as c, i}
                    <th 
                        scope="col" 
                        class="columnHeader {c.sorting ? 'cursor-pointer' : ''}"
                        on:click={() => {
                            if (c.sorting) {
                              sort(c.key);
                            }else if(c.filtering){
                              const {top, left, bottom, right, width, height} = c.headerComp.getBoundingClientRect()
                              dispatch("filter", { key: c.key, position: {top: top - 2, left, bottom, right, width, height}});
                            }
                          }}
                    >
                        <div class="flex items-center gap-2 flex-none">
                            <p>{c.name}</p>
                            {#if c.sorting}
                                <div
                                    class="text-xl flex items-center transition duration-300 {c.sort === 'asc' ? 'rotate-180' : 'rotate-0'} {!c.sorting
                                    ? 'text-transparent'
                                    : !c.sort
                                    ? 'text-base-light/[.5]'
                                    : 'text-[#EAEAEA]'}"
                                >
                                    <Icon icon="eva:arrow-upward-fill" />
                                </div>
                            {/if}
                        </div>
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each data as row}
                <tr 
                    class="tableBodyRow" 
                    class:expanded={row.expanded}
                    on:mouseenter={()=>{
                        if(!row.expanded) row.isHovered = true
                    }}
                    on:mouseleave={()=>{
                        if(!row.expanded) row.isHovered = false
                    }}
                >
                    {#each columns as c, i}
                        <!-- svelte-ignore a11y-misplaced-scope -->
                        <td 
                            class="{c.class || ''} {isExpand && i === 0 ? 'flex items-center gap-1' : ''}" 
                            class:cursor-pointer={isClickable}
                            on:click={() => {
                                if (isExpand) {
                                  if(c.key){
                                    data = data.map(m=>({...m, expanded: row.id === m.id ? !row.expanded : false}))
                                  }
                                } else if (isClickable) {
                                    dispatch('click', {...row, key: c.key})
                                }
                              }}
                            >
                            {#if isExpand && i === 0}
                                <div class:rotate-180={row.expanded} class="transrition duration-300">
                                    <div class="text-2xl">
                                        <Icon icon="eva:chevron-down-fill"/>
                                    </div>
                                </div>
                            {/if}
                            {#if c.renderComponent}
                                <svelte:component this={c.renderComponent} value={c.value(row)} bind:dataItems={data} bind:isRowHovered={row.isHovered}/>
                            {:else}
                                {@html c.value(row)}
                            {/if}
                        </td>
                    {/each}
                </tr>
                <tr>
                    <td colspan={columns.length} class="isExpand bg-[#292929]" style="padding: 0;">
                      <div class="expand" class:open={row.expanded} style="--expand-height: {row.expand_height}px; ">
                        <div bind:clientHeight={row.expand_height}>
                          <svelte:component this={expandComponent} value={row}/>
                        </div>
                      </div>
                    </td>
                </tr>
            {/each}
            {#if loading}
                {#each { length: 3 } as _, i}
                    <tr class="loading">
                    {#each columns as c, j}
                        <td>
                            <div class="bg-grey w-full h-6 bg-[#3C3C3C] animate-pulse" style="animation-delay: {(j + i) * 300}ms;" />
                        </td>
                    {/each}
                    </tr>
                {/each}
            {/if}
            {#if !loading && !data.length}
                <tr>
                    <td colspan={columns.length}>
                        <div class="w-full py-10 flex flex-col items-center justify-center">
                            <div class="mb-4">
                                <img src="/empty.svg" alt="" class="w-full h-full">
                            </div>
                            <p class="font-semibold mt-2">Tidak ada data</p>
                        </div>
                    </td>
                </tr>
            {/if}
        </tbody>
    </table>
    <div class="horizontal-scroller">
        <div class="horizontal-scroller-content"></div>
    </div>
</div>

<div use:intersect on:inViewport={() => {
    if(tableHeight >= window.innerHeight && !loading){
        dispatch('bottom')
    }
}}/>

<style lang="postcss">
    .tableContainer {
        overflow: auto;
        overflow-anchor: none;
        position: relative;
    }
    table {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
        table-layout: auto;
    }
    thead tr {
        @apply bg-base-soft;
        position: sticky;
        top: 0;
        left: 0;
        z-index: var(--zIndex);
    }
    th {
        @apply px-3 py-2 text-left;
    }
    td {
        @apply px-3 py-2;
    }
    tbody tr:hover {
        @apply bg-base-carbon/[0.5];
    }

    .expand {
        max-height: 0px;
        overflow: hidden;
        transition: max-height .5s;
        background: #2D2D2D;
    }

    .expand.open {
        transition: max-height .5s;
        max-height: var(--expand-height);
    }
    .expanded {
      /* @apply border-b border-base-lightest; */
        background: #333333 !important;
    }

    :global(.tableContainer .rowHeader) {
        @apply bg-base-soft;
        left: 0;
        position: sticky;
    }
    :global(.tableContainer [scope="row"]) {
        @apply bg-base;
        left: 0;
        position: sticky;
    }

    :global(.tableContainer thead.stickyHeader){
        @apply transition-all duration-300;
        position: fixed;
        z-index: var(--zIndex);
        overflow-x: scroll;
        top: var(--top);
        /* transition: 300ms; */
    }
    :global(.tableContainer thead.stickyHeader.atBottom){
        position: absolute;
        z-index: var(--zIndex);
        bottom: 0px;
        left: 0px !important;
        top: initial;
        width: initial !important;
        overflow-x: clip;
    }
    :global(.tableContainer thead::-webkit-scrollbar){
        height: 0px;
    }
    :global(.tableContainer .horizontal-scroller){
        position: fixed;
        bottom: 0;
        height: 30px;
        overflow: auto;
        overflow-y: hidden;
    }
    :global(.tableContainer .horizontal-scroller-content){
        height: 30px;
    }
</style>