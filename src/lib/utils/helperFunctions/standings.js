import { getLeagueRosters } from './leagueRosters';
import { getLeagueUsers } from './leagueUsers';
import { waitForAll } from './multiPromise';

export const getStandings = async () => {
	const [rosterData, users] = await waitForAll(getLeagueRosters(), getLeagueUsers());
	return rosterData.rosters
		.map((r) => {
			const user = users[r.owner_id];
			return {
				name: user?.metadata?.team_name || user?.display_name || 'Unknown',
				avatar: user?.avatar
					? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
					: 'https://sleepercdn.com/images/v2/icons/player_default.webp',
				wins: r.settings.wins,
				losses: r.settings.losses,
				ties: r.settings.ties,
				pf: +(r.settings.fpts + r.settings.fpts_decimal / 100).toFixed(2),
				pa: +(r.settings.fpts_against + r.settings.fpts_against_decimal / 100).toFixed(2)
			};
		})
		.sort((a, b) => b.wins - a.wins || b.pf - a.pf);
};
