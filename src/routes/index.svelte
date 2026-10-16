<script>
	import LinearProgress from '@smui/linear-progress';
	import { getNflState, cleanName, leagueName } from '$lib/utils/helper';
	import { Transactions, PowerRankings} from '$lib/components';
    import { getAwards, getStandings } from "$lib/utils/helper"
    import { rosterManagers } from '$lib/utils/rosterManagers';
    import { goto } from '$app/navigation';
    import { managers } from './managers/managers';

    let nflState = getNflState();
    let podiumsData = getAwards();
    let standings = getStandings();

    const getNames = (name, rosterID, currentManagers) => {
		if(cleanName(name) != cleanName(currentManagers[rosterID].name)) {
			return `${name}<div class="curOwner">(${currentManagers[rosterID].name})</div>`;
		}
		return name;
	}

    let el, left;

    const resize = (w) => {
        left = el?.getBoundingClientRect() ? el?.getBoundingClientRect().left  : 0;
    }

    $: resize(innerWidth);

    let innerWidth;

</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    #home {
        display: flex;
        flex-wrap: nowrap;
        position: relative;
        overflow-y: hidden;
        z-index: 1;
    }

    #main {
        flex-grow: 1;
        min-width: 320px;
        margin: 0 auto;
        padding: 60px 0;
    }

    .text {
        padding: 0 30px;
        max-width: 620px;
        margin: 0 auto;
    }

    .leagueData {
        position: relative;
        z-index: 1;
        width: 100%;
        min-width: 470px;
        max-width: 470px;
        min-height: 100%;
        background-color: #ebebeb;
        border-left: #eee;
		box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 20%), inset 0px 3px 4px 0px rgb(0 0 0 / 14%), inset 0px 1px 8px 0px rgb(0 0 0 / 12%);
    }

    @media (max-width: 950px) {
        .leagueData {
            max-width: 100%;
            min-width: 100%;
            width: 100%;
        }
        #home {
            flex-wrap: wrap;
        }
    }

    .transactions {
        display: block;
        width: 95%;
        margin: 10px auto;
    }

    .center {
        text-align: center;
    }

    h6 {
        text-align: center;
    }

    /* champ styling */
    #currentChamp {
        padding: 25px 0;
        box-shadow: 0 0 8px 0 #777;
        background-color: #f3f3f3;
        box-shadow: 0 -8px 8px -8px #555, 0 8px 8px -8px #555;
        border-left: 1px solid #ccc;
    }

    #champ {
        position: relative;
        width: 150px;
        height: 150px;
        margin: 0 auto;
        cursor: pointer;
    }

    .first {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        border-radius: 100%;
        border: 1px solid #ccc;
        left: 50%;
        top: 43%;
    }

    .laurel {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 135px;
        height: auto;
        left: 50%;
        top: 50%;
    }

    h4 {
        text-align: center;
        font-size: 1.6em;
        margin: 10px;
    }

    .label {
        display: table;
        text-align: center;
        line-height: 1.1em;
        padding: 6px 20px;
        background-color: #fff;
        border: 1px solid #aaa;
        margin: 10px auto 0;
        cursor: pointer;
    }
    
    .status {
        color: #777;
        margin-top: -0.5em;
    }

    .muted {
        color: #aaa;
    }

    .summary {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        padding: 16px 20px;
        margin: 20px 0 40px;
    }

    .summaryTitle {
        font-size: 0.78em;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #888;
        margin: 0 0 8px;
    }

    .topRow {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
    }

    .topRank {
        width: 18px;
        color: #aaa;
        text-align: center;
        flex-shrink: 0;
    }

    .topAvatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid #ddd;
        flex-shrink: 0;
    }

    .topName {
        flex: 1;
        min-width: 0;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .topRecord {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }

    .topPf {
        color: #777;
        font-size: 0.85em;
        font-variant-numeric: tabular-nums;
        min-width: 70px;
        text-align: right;
    }

    .dashLink {
        display: inline-block;
        margin-top: 12px;
        font-weight: 600;
        color: #5c6bc0;
        text-decoration: none;
    }

    .dashLink:hover {
        text-decoration: underline;
    }

	:global(.curOwner) {
		font-size: 0.75em;
		color: #bbb;
		font-style: italic;
	}
</style>

<div id="home">
    <div id="main">
        <div class="text">
            <h6>{leagueName}</h6>
            {#await nflState then nflStateData}
                <p class="center status">NFL {nflStateData.season} · {nflStateData.week > 0 ? `Week ${nflStateData.week}` : 'Preseason'}</p>
            {:catch}
            {/await}

            <div class="summary">
                <p class="summaryTitle">Top of the standings</p>
                {#await standings}
                    <LinearProgress indeterminate />
                {:then rows}
                    {#if rows.every(r => r.wins + r.losses + r.ties === 0)}
                        <p class="center muted">Season hasn't started yet.</p>
                    {:else}
                        {#each rows.slice(0, 3) as row, i}
                            <div class="topRow">
                                <span class="topRank">{i + 1}</span>
                                <img class="topAvatar" src={row.avatar} alt={row.name} />
                                <span class="topName">{row.name}</span>
                                <span class="topRecord">{row.wins}-{row.losses}{row.ties ? `-${row.ties}` : ''}</span>
                                <span class="topPf">{row.pf} PF</span>
                            </div>
                        {/each}
                    {/if}
                {:catch error}
                    <p class="center muted">Could not load standings: {error.message}</p>
                {/await}
                <a class="dashLink" href="/dashboard">Full standings &amp; draft lookup →</a>
            </div>
        </div>
        <PowerRankings />
    </div>
    
    <div class="leagueData">
        <div class="homeBanner">
            {#await nflState}
                <p class="center">Retrieving NFL state...</p>
                <LinearProgress indeterminate />
            {:then nflStateData}
                <p class="center">NFL {nflStateData.season} {nflStateData.week > 0 ? `Week ${nflStateData.week}` : "Preseason"}</p>
            {:catch error}
                <p class="center">Something went wrong: {error.message}</p>
            {/await}
        </div>

        <div id="currentChamp">
            {#await podiumsData}
                <p class="center">Retrieving awards...</p>
                <LinearProgress indeterminate />
            {:then {podiums, currentManagers}}
                {#if podiums[0]}
                    <h4>{podiums[0].year} Champ</h4>
                    <div id="champ" on:click={() => {if(managers.length) goto(`/managers?manager=${rosterManagers[parseInt(podiums[0].champion.rosterID)]}`)}} >
                        <img src="{podiums[0].champion.avatar}" class="first" alt="champion" />
                        <img src="./laurel.png" class="laurel" alt="laurel" />
                    </div>
                    <span class="label" on:click={() => goto(`/managers?manager=${rosterManagers[parseInt(podiums[0].champion.rosterID)]}`)} >{@html getNames(podiums[0].champion.name, podiums[0].champion.rosterID, currentManagers)}</span>
                {:else}
                    <p class="center">No former champs.</p>
                {/if}
            {:catch error}
                <p class="center">Something went wrong: {error.message}</p>
            {/await}
        </div>

        <div class="transactions" bind:this={el} >
            <Transactions masterOffset={left} />
        </div>
    </div>
</div>