const fs = require('fs');

const username = process.env.GITHUB_USER_NAME || 'antony819';
const token = process.env.GITHUB_TOKEN;
const outputDir = process.env.OUTPUT_DIR || 'dist';

async function fetchContributions() {
  const query = `query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays { contributionCount }
          }
        }
      }
    }
  }`;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'antony819-profile-animation'
    },
    body: JSON.stringify({ query, variables: { login: username } })
  });

  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors[0].message);
  return payload.data.user.contributionsCollection.contributionCalendar.weeks;
}

function level(count) {
  if (count === 0) return '#ebedf0';
  if (count < 3) return '#9be9a8';
  if (count < 6) return '#40c463';
  if (count < 10) return '#30a14e';
  return '#216e39';
}

function hero() {
  return `
    <g transform="translate(28 56)">
      <circle cx="40" cy="35" r="19" fill="#f4c7a1" stroke="#172554" stroke-width="3"/>
      <path d="M22 29 Q39 2 60 22 L54 31 Q39 20 27 35Z" fill="#f6c945" stroke="#172554" stroke-width="3"/>
      <path d="M26 35 L11 27 L19 42 L28 43 M54 35 L69 27 L61 42 L53 43" fill="#f6c945" stroke="#172554" stroke-width="3"/>
      <path d="M32 37 L37 39 M47 39 L52 37" stroke="#172554" stroke-width="3" stroke-linecap="round"/>
      <path d="M37 47 Q45 52 53 47" fill="none" stroke="#172554" stroke-width="3" stroke-linecap="round"/>
      <path d="M16 59 Q40 47 64 59 L75 103 L5 103Z" fill="#1e5aa8" stroke="#172554" stroke-width="3"/>
      <path d="M9 69 L-4 95 L12 103 L28 74 M69 69 L82 95 L66 103 L50 74" fill="#e63946" stroke="#172554" stroke-width="3"/>
      <path d="M19 59 L40 75 L61 59" fill="#f6c945" stroke="#172554" stroke-width="3"/>
      <path d="M40 75 L40 103" stroke="#f6c945" stroke-width="5"/>
      <path d="M29 103 L24 128 L42 128 L47 103 M53 103 L48 128 L66 128 L61 103" fill="#172554" stroke="#172554" stroke-width="3"/>
      <path d="M64 70 L94 57" stroke="#f6c945" stroke-width="11" stroke-linecap="round"/>
      <path d="M94 57 L116 48" stroke="#f4c7a1" stroke-width="13" stroke-linecap="round"/>
      <path d="M114 45 L128 39 M115 52 L132 52 M112 59 L126 68" stroke="#f6c945" stroke-width="4" stroke-linecap="round"/>
    </g>`;
}

function svg(weeks) {
  const width = 920;
  const height = 210;
  const startX = 210;
  const startY = 86;
  const cell = 11;
  const gap = 3;
  const cells = weeks.flatMap((week, weekIndex) => week.contributionDays.map((day, dayIndex) => ({
    x: startX + weekIndex * (cell + gap),
    y: startY + dayIndex * (cell + gap),
    color: level(day.contributionCount),
    active: day.contributionCount > 0,
    delay: 1.65 + weekIndex * 0.045
  })));
  const grid = cells.map((item) => `<rect class="${item.active ? 'cell active' : 'cell'}" x="${item.x}" y="${item.y}" width="${cell}" height="${cell}" rx="2" fill="${item.color}" style="--sweep-delay:${item.delay}s;--original:${item.color}"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Custom contribution grid hero animation">
  <title>Hero contribution grid punch animation</title>
  <style>
    text { font-family: Arial, sans-serif; }
    .cell { transform-box: fill-box; transform-origin: center; }
    .active { animation: clear 5s ease-in-out infinite; animation-delay: var(--sweep-delay); }
    .hero { animation: punch 5s ease-in-out infinite; transform-origin: 160px 110px; }
    .smash { animation: smash 5s ease-in-out infinite; transform-origin: 150px 110px; }
    @keyframes punch { 0%, 18%, 100% { transform: translateX(0); } 24%, 36% { transform: translateX(18px); } 42% { transform: translateX(0); } }
    @keyframes smash { 0%, 22% { opacity: 0; transform: scaleX(.2); } 28%, 54% { opacity: 1; transform: scaleX(1); } 66%, 100% { opacity: 0; transform: scaleX(1.2); } }
    @keyframes clear { 0%, 28%, 100% { fill: var(--original); opacity: 1; } 48%, 72% { fill: #ebedf0; opacity: 1; } }
  </style>
  <rect width="100%" height="100%" rx="12" fill="#ffffff"/>
  <text x="28" y="28" fill="#172554" font-size="14" font-weight="700">HERO CONTRIBUTION GRID</text>
  <g class="hero">${hero()}</g>
  <g class="smash" fill="none" stroke="#f6c945" stroke-linecap="round">
    <path d="M135 108 C220 70 310 74 405 102" stroke-width="8"/>
    <path d="M145 112 C250 100 340 112 470 128" stroke="#e63946" stroke-width="4"/>
    <path d="M150 102 C250 55 350 58 520 78" stroke="#1e5aa8" stroke-width="4"/>
  </g>
  <g>${grid}</g>
</svg>`;
}

(async () => {
  if (!token) throw new Error('GITHUB_TOKEN is required');
  const weeks = await fetchContributions();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(`${outputDir}/hero-contribution-grid.svg`, svg(weeks));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
