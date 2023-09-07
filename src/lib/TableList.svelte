<script>
	import { onDestroy, onMount, createEventDispatcher } from "svelte"
    import { intersect } from '.intersectObserver.js';
    
    export let selectorId = 'main-content'
    export let columns = []
    export let data = []
    export let top = 0
    export let loading = true
    export let isExpand = false
    export let isClickable = true
    export let expandComponent
    export let containerHeight = 0
    export let zIndex = 1
    export let emptyText = 'Data not found!'
    export let backgroundColor = {
        base: '',
        header: '',
        loader: '',
        hover: '',
        expanded: ''
    }
    export let textColor = {
        default: '',
        header: ''
    }

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

<div 
    class="tableContainer" 
    style="{containerHeight ? `max-height: ${containerHeight}px;` : ''}" 
    style:--top={`${top}px`}
    style:--zIndex={zIndex}
    style:--background-base={backgroundColor.base || 'transparent'}
    style:--background-header={backgroundColor.header || 'transparent'}
    style:--background-loader={backgroundColor.loader || '#3C3C3C'}
    style:--hover-color={backgroundColor.hover || 'transparent'}
    style:--background-expanded={backgroundColor.expanded || 'transparent'}
    style:--color-default={textColor.default || ''}
    style:--color-header={textColor.header || ''}
    bind:clientHeight={tableHeight} 
>
    <table>
        <thead>
            <tr class="columnHeaders">
                {#each columns as c, i}
                    <th 
                        scope="col" 
                        class="columnHeader {c.headerClass ? c.headerClass : ''}"
                        style:cursor={c.sortable ? 'pointer' : 'default'}
                        on:click={() => {
                            if (c.sortable) {
                              sort(c.key);
                            }
                          }}
                    >
                        <div class="header-item">
                            <p>{c.title}</p>
                            {#if c.sortable}
                                <div
                                    class="icon"
                                    style:transform={c.sort === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'}
                                    style:color={c.sort ? `${textColor.header || '#EAEAEA'}` : `${textColor.header || '#EAEAEA'}80`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 13V3M9 6l3-3l3 3m-3 11a2 2 0 1 1 0 4a2 2 0 0 1 0-4z"/>
                                    </svg>
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
                            class="{c.class || ''}" 
                            class:isExpand={isExpand && i === 0 }
                            style:cursor={isClickable || isExpand ? 'pointer' : 'default'}
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
                                <div class="open"
                                    style:transform={row.expanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                                >
                                    <div class="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                            <g id="evaChevronDownFill0">
                                                <g id="evaChevronDownFill1">
                                                    <path id="evaChevronDownFill2" fill="currentColor" d="M12 15.5a1 1 0 0 1-.71-.29l-4-4a1 1 0 1 1 1.42-1.42L12 13.1l3.3-3.18a1 1 0 1 1 1.38 1.44l-4 3.86a1 1 0 0 1-.68.28Z"/>
                                                </g>
                                            </g>
                                        </svg>
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
                    <td colspan={columns.length} class="expanded" style="padding: 0;">
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
                        {#each columns as _, j}
                            <td>
                                <div class="loader" style="animation-delay: {(j + i) * 300}ms;" />
                            </td>
                        {/each}
                    </tr>
                {/each}
            {/if}
            {#if !loading && !data.length}
                <tr>
                    <td colspan={columns.length}>
                        <div class="empty">
                            <p class="font-semibold mt-2">{emptyText}</p>
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

<style>
    .tableContainer {
        overflow: auto;
        overflow-anchor: none;
        position: relative;
        background: var(--background-base);
        color: var(--textColor-default);
    }
    table {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
        table-layout: auto;
    }
    thead tr {
        background: var(--background-header);
        color: var(--textColor-header);
        position: sticky;
        top: 0;
        left: 0;
        z-index: var(--zIndex);
    }
    th {
        padding: 8px 12px;
    }
    td {
        padding: 8px 12px;
        cursor: pointer;
    }
    tbody tr:hover {
        background: var(--background-hover);
    }

    .header-item {
        display: flex;
        flex: none;
        align-items: center;
        gap: 0.25rem;
    }

    .header-item .icon {
        height: 1.25rem;
        display: flex;
        align-items: center;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
    }

    .isExpand {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    .isExpand .open {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
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
        background: var(--background-expanded) !important;
    }

    .loader {
        height: 1.5rem;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        background: var(--background-loader);
    }

    .empty {
        width: 100%;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: .5;
        }
    }

    :global(.tableContainer .rowHeader) {
        background: var(--background-header);
        left: 0;
        position: sticky;
    }
    :global(.tableContainer [scope="row"]) {
        background: var(--background-base);
        left: 0;
        position: sticky;
    }

    :global(.tableContainer thead.stickyHeader){
        position: fixed;
        z-index: var(--zIndex);
        overflow-x: scroll;
        top: var(--top);
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
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