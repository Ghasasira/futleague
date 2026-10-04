import { Player, TransferRecord, PlayerMatchLog, PlayerAttributes } from '../types/league';

export function getPlayerEnrichedData(player: Player): {
  birthDate: string;
  birthPlace: string;
  weight: string;
  contractExpires: string;
  estimatedWage: string;
  bioText: string;
  attributes: PlayerAttributes;
  transfers: TransferRecord[];
  matchLogs: PlayerMatchLog[];
} {
  // If player already has customized attributes, preserve them
  const baseAttributes: PlayerAttributes = player.attributes || {
    pace: player.position === 'FW' ? 88 : player.position === 'MF' ? 78 : player.position === 'DF' ? 76 : 50,
    shooting: player.position === 'FW' ? 89 : player.position === 'MF' ? 80 : player.position === 'DF' ? 52 : 25,
    passing: player.position === 'MF' ? 89 : player.position === 'DF' ? 74 : player.position === 'FW' ? 77 : 70,
    dribbling: player.position === 'FW' ? 86 : player.position === 'MF' ? 85 : player.position === 'DF' ? 68 : 45,
    defending: player.position === 'DF' ? 88 : player.position === 'MF' ? 74 : player.position === 'GK' ? 85 : 40,
    physical: player.position === 'DF' || player.position === 'GK' ? 86 : player.position === 'FW' ? 84 : 77,
  };

  // Specific fine-tuned attributes for marquee players
  if (player.name.includes('Vance')) {
    baseAttributes.pace = 92;
    baseAttributes.shooting = 96;
    baseAttributes.passing = 74;
    baseAttributes.dribbling = 82;
    baseAttributes.defending = 45;
    baseAttributes.physical = 94;
  } else if (player.name.includes('Farouk')) {
    baseAttributes.pace = 91;
    baseAttributes.shooting = 93;
    baseAttributes.passing = 86;
    baseAttributes.dribbling = 90;
    baseAttributes.defending = 48;
    baseAttributes.physical = 79;
  } else if (player.name.includes('De Vries')) {
    baseAttributes.pace = 74;
    baseAttributes.shooting = 86;
    baseAttributes.passing = 95;
    baseAttributes.dribbling = 87;
    baseAttributes.defending = 64;
    baseAttributes.physical = 78;
  } else if (player.name.includes('Pedri')) {
    baseAttributes.pace = 79;
    baseAttributes.shooting = 76;
    baseAttributes.passing = 91;
    baseAttributes.dribbling = 90;
    baseAttributes.defending = 70;
    baseAttributes.physical = 72;
  } else if (player.name.includes('Yamal')) {
    baseAttributes.pace = 89;
    baseAttributes.shooting = 84;
    baseAttributes.passing = 88;
    baseAttributes.dribbling = 93;
    baseAttributes.defending = 42;
    baseAttributes.physical = 68;
  } else if (player.name.includes('Ortega') || player.name.includes('Oblak') || player.name.includes('Becker')) {
    baseAttributes.pace = 52;
    baseAttributes.shooting = 28;
    baseAttributes.passing = 78;
    baseAttributes.dribbling = 55;
    baseAttributes.defending = 92;
    baseAttributes.physical = 85;
  }

  const birthYear = 2026 - player.age;
  const birthDate = player.birthDate || `${birthYear}-04-12`;
  const birthPlace = player.birthPlace || `${player.nationality}`;
  const weight = player.weight || (player.position === 'DF' || player.position === 'GK' ? '86 kg' : '77 kg');
  const contractExpires = player.contractExpires || 'June 2029';
  const estimatedWage = player.estimatedWage || '€175,000 / week';

  const bioText =
    player.bioText ||
    `${player.name} is a premier ${player.nationality} ${
      player.position === 'GK'
        ? 'goalkeeper renowned for commanding penalty-area presence, reflex shot-stopping, and confident distribution under pressure'
        : player.position === 'DF'
        ? 'defender known for commanding aerial dominance, intelligent positioning, and proactive tackle timing'
        : player.position === 'MF'
        ? 'midfield playmaker capable of controlling match tempo, delivering surgical line-breaking passes, and relentless box-to-box work-rate'
        : 'forward recognized for explosive off-the-ball runs, lethal clinical finishing inside the 18-yard box, and pressing intelligence'
    }. Having established an indispensable role in the starting XI, ${player.name} continues to be a cornerstone of the club's tactical identity in the Apex Championship.`;

  // Realistic Transfer History
  const transfers: TransferRecord[] = player.transfers || [
    {
      id: `tr-1-${player.id}`,
      season: '2024/25',
      date: 'Jul 2024',
      fromTeam: player.position === 'FW' ? 'Borussia West' : 'Iberia Sporting',
      toTeam: player.teamId === 'apex-city' ? 'Apex City FC' : player.teamId === 'crown-vanguard' ? 'Crown Vanguard' : 'Current Club',
      fee: player.marketValue,
      transferType: 'Permanent',
    },
    {
      id: `tr-2-${player.id}`,
      season: '2021/22',
      date: 'Aug 2021',
      fromTeam: 'Nordic Stars Academy',
      toTeam: player.position === 'FW' ? 'Borussia West' : 'Iberia Sporting',
      fee: '€18M',
      transferType: 'Permanent',
    },
    {
      id: `tr-3-${player.id}`,
      season: '2019/20',
      date: 'Jul 2019',
      fromTeam: 'Youth Academy',
      toTeam: 'Nordic Stars Academy',
      fee: 'Youth Sign',
      transferType: 'Academy',
    },
  ];

  // Recent 5 match logs
  const matchLogs: PlayerMatchLog[] = player.matchLogs || [
    {
      id: `log-1-${player.id}`,
      date: '2026-10-04',
      opponent: 'Crown Vanguard',
      opponentCode: 'CVG',
      result: '2-1 W',
      minutes: 90,
      goals: player.goals > 15 ? 1 : 0,
      assists: player.assists > 5 ? 1 : 0,
      rating: player.formRating,
    },
    {
      id: `log-2-${player.id}`,
      date: '2026-09-28',
      opponent: 'Solaria United',
      opponentCode: 'SLR',
      result: '3-2 W',
      minutes: 88,
      goals: player.position === 'FW' ? 1 : 0,
      assists: player.position === 'MF' ? 1 : 0,
      rating: 8.2,
    },
    {
      id: `log-3-${player.id}`,
      date: '2026-09-21',
      opponent: 'Ironclad Athletic',
      opponentCode: 'ICA',
      result: '1-1 D',
      minutes: 90,
      goals: 0,
      assists: 0,
      rating: 7.5,
    },
    {
      id: `log-4-${player.id}`,
      date: '2026-09-14',
      opponent: 'Verdant Rovers',
      opponentCode: 'VRD',
      result: '4-0 W',
      minutes: 75,
      goals: player.position === 'FW' ? 2 : 0,
      assists: player.position === 'MF' ? 2 : 0,
      rating: 8.9,
    },
    {
      id: `log-5-${player.id}`,
      date: '2026-09-02',
      opponent: 'Maritime Mariners',
      opponentCode: 'MAR',
      result: '2-0 W',
      minutes: 90,
      goals: player.goals > 10 ? 1 : 0,
      assists: 0,
      rating: 8.1,
    },
  ];

  return {
    birthDate,
    birthPlace,
    weight,
    contractExpires,
    estimatedWage,
    bioText,
    attributes: baseAttributes,
    transfers,
    matchLogs,
  };
}
