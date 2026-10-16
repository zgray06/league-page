<script context="module">
	import { getStandings, getPreviousDrafts } from '$lib/utils/helper';

	export async function load() {
		const standingsInfo = getStandings();
		const draftInfo = getPreviousDrafts();
		return {
			props: { standingsInfo, draftInfo }
		};
	}
</script>

<script>
	import LinearProgress from '@smui/linear-progress';
	import { match } from 'fuzzyjs';

	export let standingsInfo, draftInfo;

	// ── Standings state ─────────────────────────────────────────────────────────
	let standings = [];
	let standingsLoading = true;
	let standingsError = null;

	standingsInfo
		.then((rows) => {
			standingsLoading = false;
			standings = rows;
		})
		.catch((err) => {
			standingsLoading = false;
			standingsError = err.message;
		});

	// ── Draft lookup state ──────────────────────────────────────────────────────
	let allPicks = [];
	let draftYear = null;
	let draftLoading = true;
	let draftError = null;
	let searchQuery = '';

	draftInfo
		.then((drafts) => {
			draftLoading = false;
			if (!drafts || drafts.length === 0) return;
			const { year, draft, draftOrder, draftType, originalManagers } = drafts[0];
			draftYear = year;
			const leagueSize = draftOrder.length;
			const isSnake = draftType === 'snake';
			const picks = [];
			for (let i = 0; i < draft.length; i++) {
				for (let j = 0; j < draft[i].length; j++) {
					const cell = draft[i][j];
					if (!cell?.player) continue;
					const round = i + 1;
					const pickNo =
						isSnake && round % 2 === 0
							? (round - 1) * leagueSize + (leagueSize - j)
							: (round - 1) * leagueSize + (j + 1);
					const manager =
						cell.newOwner || originalManagers[draftOrder[j]]?.name || 'Unknown';
					picks.push({
						name: cell.player.name,
						position: cell.player.position,
						team: cell.player.team,
						avatar: cell.player.avatar, // already a CSS background-image string
						round,
						pickNo,
						manager
					});
				}
			}
			allPicks = picks;
		})
		.catch((err) => {
			draftLoading = false;
			draftError = err.message;
		});

	// Reactive fuzzy filter
	$: filteredPicks =
		searchQuery.trim().length > 1
			? allPicks
					.map((p) => ({ ...p, _score: match(searchQuery.trim(), p.name) }))
					.filter((p) => p._score.match && p._score.score > 0)
					.sort((a, b) => b._score.score - a._score.score)
					.map(({ _score, ...p }) => p)
			: [];

	// Position badge colours
	const posColor = {
		QB: '#c0392b',
		RB: '#27ae60',
		WR: '#2980b9',
		TE: '#d35400',
		K: '#8e44ad',
		DEF: '#555'
	};
</script>

<style>
	#dashboard {
		position: relative;
		z-index: 1;
		max-width: 900px;
		margin: 0 auto;
		padding: 40px 20px 60px;
	}

	h2 {
		font-size: 1.4em;
		font-weight: 700;
		margin: 0 0 16px;
		letter-spacing: 0.02em;
	}

	/* ── Section card ──────────────────────────────────────────────────────── */
	.section-card {
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
		padding: 24px;
		margin-bottom: 32px;
	}

	/* ── Standings table ───────────────────────────────────────────────────── */
	.standings-table {
		width: 100%;
		border-collapse: collapse;
	}

	.standings-table th {
		text-align: left;
		font-size: 0.78em;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #888;
		padding: 6px 10px 10px;
		border-bottom: 2px solid #e8e8e8;
	}

	.standings-table th.num {
		text-align: right;
	}

	.standings-table td {
		padding: 10px;
		border-bottom: 1px solid #f0f0f0;
		font-size: 0.95em;
	}

	.standings-table tbody tr:last-child td {
		border-bottom: none;
	}

	.standings-table tbody tr:hover td {
		background: #fafafa;
	}

	.rank-cell {
		color: #aaa;
		font-size: 0.85em;
		text-align: center;
		width: 30px;
	}

	.manager-cell {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.manager-avatar {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
		border: 1px solid #ddd;
	}

	.manager-name {
		font-weight: 600;
		line-height: 1.2;
	}

	.num-cell {
		text-align: right;
		font-variant-numeric: tabular-nums;
		color: #333;
	}

	.record-cell {
		text-align: right;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}

	/* ── Draft search ──────────────────────────────────────────────────────── */
	.search-wrap {
		position: relative;
		margin-bottom: 20px;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.1em;
		color: #aaa;
		pointer-events: none;
		font-family: 'Material Icons';
	}

	.search-input {
		width: 100%;
		box-sizing: border-box;
		padding: 10px 14px 10px 38px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 0.97em;
		outline: none;
		transition: border-color 0.15s;
		background: #fafafa;
	}

	.search-input:focus {
		border-color: #5c6bc0;
		background: #fff;
	}

	.search-hint {
		font-size: 0.82em;
		color: #aaa;
		margin-top: -10px;
		margin-bottom: 16px;
	}

	/* ── Pick results ──────────────────────────────────────────────────────── */
	.picks-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.pick-card {
		display: flex;
		align-items: center;
		gap: 14px;
		background: #f8f8f8;
		border-radius: 6px;
		padding: 10px 14px;
		border: 1px solid #ececec;
	}

	.player-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background-size: cover;
		background-position: center top;
		flex-shrink: 0;
		border: 1px solid #ddd;
		background-color: #eee;
	}

	.pick-info {
		flex: 1;
		min-width: 0;
	}

	.player-name {
		font-weight: 700;
		font-size: 1em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.player-meta {
		font-size: 0.82em;
		color: #777;
		margin-top: 2px;
	}

	.pick-detail {
		text-align: right;
		flex-shrink: 0;
		font-size: 0.85em;
	}

	.pick-round {
		font-weight: 700;
		color: #333;
	}

	.pick-overall {
		color: #999;
		font-size: 0.92em;
	}

	.drafted-by {
		font-size: 0.8em;
		color: #777;
		margin-top: 2px;
	}

	.pos-badge {
		display: inline-block;
		font-size: 0.72em;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: 3px;
		color: #fff;
		margin-right: 4px;
		vertical-align: middle;
	}

	.empty-state {
		text-align: center;
		color: #aaa;
		padding: 20px 0;
		font-size: 0.92em;
	}

	/* ── Loading / progress ────────────────────────────────────────────────── */
	.loading-block {
		padding: 12px 0 4px;
	}

	.loading-label {
		font-size: 0.88em;
		color: #aaa;
		margin-bottom: 8px;
	}

	@media (max-width: 560px) {
		.standings-table th:nth-child(5),
		.standings-table td:nth-child(5) {
			/* hide PA on very small screens */
			display: none;
		}
	}
</style>

<div id="dashboard">
	<!-- ── Standings ───────────────────────────────────────────────────────── -->
	<div class="section-card">
		<h2>🏆 Standings</h2>
		{#if standingsLoading}
			<div class="loading-block">
				<p class="loading-label">Loading standings...</p>
				<LinearProgress indeterminate />
			</div>
		{:else if standingsError}
			<p class="empty-state">Could not load standings: {standingsError}</p>
		{:else}
			<table class="standings-table">
				<thead>
					<tr>
						<th style="width:30px">#</th>
						<th>Team</th>
						<th class="num">W</th>
						<th class="num">L</th>
						<th class="num">T</th>
						<th class="num">PF</th>
						<th class="num">PA</th>
					</tr>
				</thead>
				<tbody>
					{#each standings as row, i}
						<tr>
							<td class="rank-cell">{i + 1}</td>
							<td>
								<div class="manager-cell">
									<img class="manager-avatar" src={row.avatar} alt={row.name} />
									<span class="manager-name">{row.name}</span>
								</div>
							</td>
							<td class="record-cell">{row.wins}</td>
							<td class="record-cell">{row.losses}</td>
							<td class="record-cell">{row.ties}</td>
							<td class="num-cell">{row.pf}</td>
							<td class="num-cell">{row.pa}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	<!-- ── Draft Lookup ────────────────────────────────────────────────────── -->
	<div class="section-card">
		<h2>🔍 Draft Lookup{draftYear ? ` — ${draftYear}` : ''}</h2>

		{#if draftLoading}
			<div class="loading-block">
				<p class="loading-label">Loading draft data...</p>
				<LinearProgress indeterminate />
			</div>
		{:else if draftError}
			<p class="empty-state">Could not load draft: {draftError}</p>
		{:else if allPicks.length === 0}
			<p class="empty-state">No completed draft found.</p>
		{:else}
			<div class="search-wrap">
				<span class="search-icon">search</span>
				<input
					class="search-input"
					type="text"
					placeholder="Search player name…"
					bind:value={searchQuery}
					autocomplete="off"
					spellcheck="false"
				/>
			</div>
			<p class="search-hint">Type at least 2 characters to search {allPicks.length} picks</p>

			{#if searchQuery.trim().length > 1}
				{#if filteredPicks.length === 0}
					<p class="empty-state">No players found matching "{searchQuery}"</p>
				{:else}
					<div class="picks-list">
						{#each filteredPicks as pick}
							<div class="pick-card">
								<div class="player-avatar" style={pick.avatar}></div>
								<div class="pick-info">
									<div class="player-name">{pick.name}</div>
									<div class="player-meta">
										<span
											class="pos-badge"
											style="background-color:{posColor[pick.position] || '#666'}"
										>{pick.position}</span>
										{pick.team || '—'}
									</div>
								</div>
								<div class="pick-detail">
									<div class="pick-round">Rd {pick.round}</div>
									<div class="pick-overall">Pick {pick.pickNo}</div>
									<div class="drafted-by">by {pick.manager}</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		{/if}
	</div>
</div>
