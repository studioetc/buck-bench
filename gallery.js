// First-party release/availability records researched by GPT-5.6 Terra on 2026-09-07.
// Dates reflect the official launch; private partner previews are excluded.
const modelReleases = {
  "GPT-5.5": {
    "date": "2026-04-23",
    "source": "https://models.dev/api.json",
    "note": "models.dev release_date. Added 2026-11-19."
  },
  "Gemini 3.1 Pro": {
    "date": "2026-02-19",
    "source": "https://www.theregister.com/2026/02/19/google_germinates_gemini_31_pro/",
    "note": "Preview launch on 19 February 2026 (also models.dev, gemini-3.1-pro-preview). Added 2026-11-19."
  },
  "Claude Sonnet 5.5": {
    "date": "2026-09-28",
    "source": "https://models.dev/api.json",
    "note": "models.dev release_date; Anthropic's deprecations page gives retirement 'not sooner than Sep 28, 2027' (release + 1 year). Added 2026-11-19."
  },
  "Claude Opus 4.5": {
    "date": "2025-11-24",
    "source": "https://models.dev/api.json",
    "note": "models.dev release_date; Anthropic's deprecations page gives retirement 'not sooner than Nov 24, 2026'. Added 2026-11-19."
  },
  "Claude Opus 4.6": {
    "date": "2026-02-05",
    "source": "https://www.anthropic.com/news/claude-opus-4-6",
    "note": "Anthropic announcement, 5 February 2026. models.dev says 2026-02-04. Added 2026-11-19."
  },
  "Claude Sonnet 4.6": {
    "date": "2026-02-17",
    "source": "https://models.dev/api.json",
    "note": "models.dev release_date; Anthropic's deprecations page gives retirement 'not sooner than Feb 17, 2027'. Added 2026-11-19."
  },
  "Claude Sonnet 4.5": {
    "date": "2025-09-29",
    "source": "https://models.dev/api.json",
    "note": "models.dev release_date. Added 2026-11-19."
  },
  "GPT-6.2 Sol": {
    "date": "2026-11-17",
    "source": "https://developers.openai.com/api/docs/changelog",
    "note": "OpenAI API changelog entry dated Nov 17 (2026); also announced on the OpenAI community forum that day."
  },
  "GPT-6.2 Astra": {
    "date": "2026-11-17",
    "source": "https://developers.openai.com/api/docs/changelog",
    "note": "OpenAI API changelog entry dated Nov 17 (2026); also announced on the OpenAI community forum that day."
  },
  "Claude Fable 5.2": {
    "date": "2026-11-09",
    "source": "https://platform.claude.com/docs/en/release-notes/overview",
    "note": "Launched 9 November 2026 per Anthropic's Claude Platform release notes. Added 2026-11-18."
  },
  "Claude Opus 5.5": {
    "date": "2026-09-22",
    "source": "https://www.anthropic.com/claude-opus-5-5",
    "note": "Available on all platforms on the announcement date. Added 2026-09-23."
  },
  "Claude Fable 5": {
    "date": "2026-06-09",
    "source": "https://www.anthropic.com/news/claude-fable-5-mythos-5",
    "note": "First public launch. Access was suspended June 12 and restored July 1."
  },
  "Claude Opus 5": {
    "date": "2026-07-24",
    "source": "https://www.anthropic.com/news/claude-opus-5",
    "note": "Available on all platforms on the announcement date."
  },
  "Claude Fable 5.1": {
    "date": "2026-09-01",
    "source": "https://www.anthropic.com/claude-fable-and-mythos-5-1",
    "note": "September 1 announcement in Anthropic's news index; available on all platforms."
  },
  "GPT-Sol 6.1": {
    "date": "2026-09-29",
    "source": "https://deploymentsafety.openai.com/gpt-6-1-sol/respecting-auto-review",
    "note": "Official introduction on 29 September 2026. ChatGPT Work and Codex rollout began with Pro users and expanded to other plans. Verified 30 September 2026."
  },
  "GPT-5.6 Sol": {
    "date": "2026-07-09",
    "source": "https://openai.com/index/gpt-5-6/",
    "note": "General availability. June 26 preview was restricted to selected trusted partners."
  },
  "Claude Sonnet 5": {
    "date": "2026-06-30",
    "source": "https://www.anthropic.com/news/claude-sonnet-5",
    "note": "Available across all plans on the announcement date."
  },
  "GPT-6 Astra": {
    "date": "2026-09-03",
    "source": "https://openai.com/index/gpt-6-astra/",
    "note": "Official launch and start of staged rollout, initially to a limited set of organizations."
  },
  "Claude Opus 4.8": {
    "date": "2026-05-28",
    "source": "https://www.anthropic.com/news/claude-opus-4-8",
    "note": "Available on the announcement date."
  },
  "Claude Opus 4.7": {
    "date": "2026-04-16",
    "source": "https://www.anthropic.com/news/claude-opus-4-7",
    "note": "Generally available on the announcement date."
  },
  "Kimi K3": {
    "date": null,
    "source": "https://www.kimi.ai/blog/kimi-k3",
    "note": "Official post announces availability but has no verified publication date. Evaluation and planned weights dates are not treated as release dates."
  },
  "GLM-5.3": {
    "date": "2026-08-18",
    "source": "https://docs.z.ai/release-notes/new-released",
    "note": "First dated first-party availability record found: August 18 release notes. Some third-party reporting gives an August 14 announcement."
  },
  "Grok 4.5": {
    "date": "2026-07-16",
    "source": "https://x.ai/news/grok-4-5",
    "note": "Official announcement states it launched on July 16."
  },
  "Gemini 3.5 Flash (High)": {
    "date": "2026-05-19",
    "source": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/",
    "note": "Gemini 3.5 Flash release. High is a configuration, not a separately released model."
  }
};

const artifacts = [
  {id:'gpt55',model:'GPT-5.5',title:'Arena build',file:'raw/gpt-5.5/gpt55/index.html',relation:'Arena run',note:'Arena battle on 17 July 2026 (gpt-5.5-xhigh side, identified by the user from the Arena chat). Built from the downloaded Vite source.'},
  {id:'gemini31pro',model:'Gemini 3.1 Pro',title:'Arena build',file:'raw/gemini-3.1-pro/gemini31pro/index.html',relation:'Arena run',note:'Arena chat from 17 July 2026; model gemini-3.1-pro identified by the user from the Arena chat. Built from the downloaded Vite source.'},
  {id:'sonnet55',model:'Claude Sonnet 5.5',title:'Black Buck simulation',file:'raw/claude-sonnet-5-5/sonnet55/black-buck.html',relation:'Independent run',note:'Clean Claude Code run at xhigh with Chrome; researched, built from source files and checked its page thoroughly in Chrome.'},
  {id:'opus45',model:'Claude Opus 4.5',title:'Refuelling simulation',file:'raw/claude-opus-4-5/opus45/black-buck.html',relation:'Independent run',note:'Clean Claude Code run (effort high, the most Opus 4.5 accepts) with Chrome; researched and checked its page in Chrome.'},
  {id:'opus46-era',model:'Claude Opus 4.6',title:'Claude Code 2.1.32',file:'raw/claude-opus-4-6/opus46-era/black-buck.html',relation:'Release-era harness',note:'Run on Claude Code 2.1.32, the version current at release, with a clean config and Chrome: researched (8 searches, 24 page reads) and checked its page in Chrome.'},
  {id:'opus46-run2',model:'Claude Opus 4.6',title:'Claude Code 2.1.327',file:'raw/claude-opus-4-6/opus46-run2/index.html',relation:'Current harness',note:'Rerun with the Artifact tool blocked: saved to the run folder and checked its page in Chrome; no web research.'},
  {id:'opus46',model:'Claude Opus 4.6',title:'Claude Code 2.1.327 · Artifact tool on',file:'raw/claude-opus-4-6/opus46/operation-black-buck.html',relation:'Current harness, earlier run',note:'First run, with the Artifact tool available: one large write, no research or browser check, then published a private claude.ai artifact.'},
  {id:'sonnet46-era',model:'Claude Sonnet 4.6',title:'Claude Code 2.1.45',file:'raw/claude-sonnet-4-6/sonnet46-era/black_buck.html',relation:'Release-era harness',note:'Run on Claude Code 2.1.45, the version current at release, with a clean config and Chrome: researched via a claude.ai Exa connector (not era-standard) and checked its page in Chrome.'},
  {id:'sonnet46-run2',model:'Claude Sonnet 4.6',title:'Claude Code 2.1.327',file:'raw/claude-sonnet-4-6/sonnet46-run2/black_buck.html',relation:'Current harness',note:'Rerun with the Artifact tool blocked: saved to the run folder and checked its page in Chrome; no web research.'},
  {id:'sonnet46',model:'Claude Sonnet 4.6',title:'Claude Code 2.1.327 · Artifact tool on',file:'raw/claude-sonnet-4-6/sonnet46/black_buck.html',relation:'Current harness, earlier run',note:'First run, with the Artifact tool available: no research or browser check; published a private claude.ai artifact.'},
  {id:'sonnet45',model:'Claude Sonnet 4.5',title:'Black Buck simulation',file:'raw/claude-sonnet-4-5/sonnet45/black_buck_simulation.html',relation:'Independent run',note:'Clean Claude Code run (Sonnet 4.5 takes no effort setting). One file write; no research or browser check.'},
  {id:'sol62',model:'GPT-6.2 Sol',title:'Plotting chart',file:'raw/gpt-6-2-sol/sol62/operation-black-buck.html',relation:'Independent run',note:'Single-prompt build at xhigh effort in the Codex terminal app, 19 November 2026.'},
  {id:'astra62',model:'GPT-6.2 Astra',title:'Flight atlas',file:'raw/gpt-6-2-astra/astra62/index.html',relation:'Independent run',note:'Single-prompt build at high effort in a T3 Code thread (Codex harness), 18 November 2026.'},
  {id:'fable52-v1',model:'Claude Fable 5.2',title:'The tanker cascade · v1',file:'raw/claude-fable-5-2/fable52-v1/black-buck-refuelling.html',relation:'Original',note:'Single-prompt build at xhigh effort in a T3 Code thread. Rebuilt from the session\'s own build files; applying the v2 edits reproduces v2 byte for byte.'},
  {id:'fable52',model:'Claude Fable 5.2',title:'The tanker cascade · v2',file:'raw/claude-fable-5-2/fable52/black-buck-refuelling.html',relation:'Revision',note:'Forked session: the user allowed browser checking, and the model made small layout and timing fixes after checking.'},
  {id:'opus55',model:'Claude Opus 5.5',title:'Refuelling simulation',file:'raw/claude-opus-5-5/opus55/black-buck-refuelling.html',relation:'Independent run',note:'Single-prompt build with the benchmark prompt; no subagents or skills recorded.'},
  {id:'vulcan-v1',model:'Claude Fable 5',title:'Vulcan · v1',file:'raw/claude-fable-5/vulcan-v1/black-buck.html',relation:'Original',note:'First output in a session that later produced v2.'},
  {id:'vulcan-v2',model:'Claude Fable 5',title:'Vulcan · v2',file:'raw/claude-fable-5/vulcan-v2/black-buck-v2.html',relation:'Revision',note:'In-session continuation with expanded geography and formation detail.'},
  {id:'opus5-v1',model:'Claude Opus 5',title:'Opus 5 · v1',file:'raw/claude-opus-5/opus5-v1/black-buck.html',relation:'Original',note:'First output in a session that later produced v2.'},
  {id:'opus5-v2',model:'Claude Opus 5',title:'Opus 5 · v2',file:'raw/claude-opus-5/opus5-v2/black-buck-v2.html',relation:'Revision',note:'Follow-up revision with formation and fuel-model changes.'},
  {id:'fable51-simulation',model:'Claude Fable 5.1',title:'Detailed simulation',file:'raw/claude-fable-5-1/fable51-simulation/black-buck.html',relation:'Original',note:'Fresh detailed simulation output.'},
  {id:'fable51-story',model:'Claude Fable 5.1',title:'Narrative story',file:'raw/claude-fable-5-1/fable51-story/black-buck-story.html',relation:'Related variant',note:'Narrative revision requested in the same session.'},
  {id:'sol61',model:'GPT-Sol 6.1',title:'The airborne relay',file:'raw/gpt-sol-6-1/sol61/index.html',relation:'Independent run',note:'Codex session log records gpt-6.1-sol at xhigh effort (verified 19 November 2026).'},
  {id:'sol-codex',model:'GPT-5.6 Sol',title:'Codex harness',file:'raw/gpt-5.6-sol/sol-codex/index.html',relation:'Independent run',note:'Built in a Codex session.'},
  {id:'sol-claude-harness',model:'GPT-5.6 Sol',title:'Claude-format harness',file:'raw/gpt-5.6-sol/sol-claude-harness/index.html',relation:'Independent run',note:'Recorded GPT model ID in a Claude-format session.'},
  {id:'sonnet5',model:'Claude Sonnet 5',title:'Refuelling chain',file:'raw/claude-sonnet-5/sonnet5/black-buck-1-refuelling.html',relation:'Independent run',note:'Recovered completed build.'},
  {id:'astra',model:'GPT-6 Astra',title:'Astra simulation',file:'raw/gpt-6-astra/astra/index.html',relation:'Independent run',note:'Built in a Codex session.'},
  {id:'documents-opus48',model:'Claude Opus 4.8',title:'Mission visualisation',file:'raw/claude-opus-4-8/documents-opus48/index.html',relation:'Assisted run',note:'Main build model; a Sonnet 4.6 subagent also contributed.'},
  {id:'aaa-opus47',model:'Claude Opus 4.7',title:'Mission visualisation',file:'raw/claude-opus-4-7/aaa-opus47/index.html',relation:'Delegated run',note:'Same-model subagent build; the parent session did not change the file afterwards.'},
  {id:'kimi3',model:'Kimi K3',title:'Kimi simulation',file:'raw/kimi-k3/kimi3/black-buck.html',relation:'Independent run',note:'The packaged .bak copy is byte-identical and omitted.'},
  {id:'ox',model:'GLM-5.3',title:'OX Alpha simulation',file:'raw/GLM-5.3/ox/black-buck.html',relation:'Independent run',note:'Recorded as stealth/ox-alpha; model mapping user-confirmed.'},
  {id:'grok45',model:'Grok 4.5',title:'Grok simulation',file:'raw/grok-4.5/grok45/index.html',relation:'Independent run',note:'Recovered from native Grok session records.'},
  {id:'antigravity-flash',model:'Gemini 3.5 Flash (High)',title:'Antigravity simulation',file:'raw/Gemini%203.5%20Flash%20(High)/antigravity-flash/index.html',relation:'UI-selection evidence',note:'Model label comes from recorded UI selection, not a per-response field.'}
];

const groups = artifacts.reduce((all, artifact) => {
  const group = all.find((entry) => entry.model === artifact.model);
  if (group) group.artifacts.push(artifact);
  else all.push({ model: artifact.model, artifacts: [artifact] });
  return all;
}, []);

// ISO dates sort chronologically; unverified dates stay after dated models.
groups.sort((a, b) => {
  const aDate = modelReleases[a.model]?.date || '';
  const bDate = modelReleases[b.model]?.date || '';
  return bDate.localeCompare(aDate) || a.model.localeCompare(b.model);
});

// Pure release-date order, kept for the "Grouped by model" view (pins don't apply there).
const chronological = [...groups];

// Manual placement overrides applied after the chronological sort.
const pinnedPositions = { 'Claude Fable 5': 1 };
Object.entries(pinnedPositions).forEach(([model, position]) => {
  const index = groups.findIndex((group) => group.model === model);
  if (index === -1) return;
  const [group] = groups.splice(index, 1);
  groups.splice(position, 0, group);
});
// Keep the user-requested entry immediately after Fable 5.1.
const sol61Index = groups.findIndex((group) => group.model === 'GPT-Sol 6.1');
if (sol61Index !== -1) {
  const [sol61] = groups.splice(sol61Index, 1);
  const fable51Index = groups.findIndex((group) => group.model === 'Claude Fable 5.1');
  groups.splice(fable51Index === -1 ? groups.length : fable51Index + 1, 0, sol61);
}

const releaseDateFormat = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
});

// Lab logos copied from github.com/SunkenInTime/which-ai (public/), 2026-11-18.
const labs = [
  { test: /^Claude/, family: 'Claude', name: 'Anthropic', logo: 'logos/anthropic.webp' },
  { test: /^GPT/, family: 'GPT', name: 'OpenAI', logo: 'logos/openai.svg' },
  { test: /^Gemini/, family: 'Gemini', name: 'Google', logo: 'logos/google.webp' },
  { test: /^Grok/, family: 'Grok', name: 'xAI', logo: 'logos/xai.svg' },
  { test: /^GLM/, family: 'GLM', name: 'Z.ai', logo: 'logos/zai.webp' },
  { test: /^Kimi/, family: 'Kimi', name: 'Moonshot AI', logo: 'logos/moonshot.webp' }
];
const labFor = (model) => labs.find((lab) => lab.test.test(model));
const familySlug = (model) => labFor(model)?.family.toLowerCase() || 'other';

// Model lines, in "Grouped by model" order. First match wins; each family ends with a catch-all.
const modelLines = [
  { family: 'claude', slug: 'fable', label: 'Fable', heading: 'Claude Fable', test: /^Claude Fable/ },
  { family: 'claude', slug: 'opus', label: 'Opus', heading: 'Claude Opus', test: /^Claude Opus/ },
  { family: 'claude', slug: 'sonnet', label: 'Sonnet', heading: 'Claude Sonnet', test: /^Claude Sonnet/ },
  { family: 'claude', slug: 'other', label: 'Other', heading: 'Other Claude', test: /^Claude/ },
  { family: 'gpt', slug: 'astra', label: 'Astra', heading: 'GPT Astra', test: /^GPT.*\bAstra\b/ },
  { family: 'gpt', slug: 'sol', label: 'Sol', heading: 'GPT Sol', test: /^GPT.*\bSol\b/ },
  { family: 'gpt', slug: 'other', label: 'Other', heading: 'Other GPT', test: /^GPT/ },
  ...labs.slice(2).map((lab) => ({ family: lab.family.toLowerCase(), slug: 'all', label: lab.family, heading: lab.family, test: lab.test })),
  { family: 'other', slug: 'other', label: 'Other', heading: 'Other models', test: /./ }
];
const lineFor = (model) => modelLines.find((line) => line.test.test(model));

const screenshotFor = (artifact) => `screenshots/${artifact.id}.png`;
const gallery = document.querySelector('#gallery-grid');

groups.forEach((group, groupIndex) => {
  const card = document.createElement('article');
  card.className = 'model-card';

  const initial = group.artifacts[0];
  const release = modelReleases[group.model];
  card.innerHTML = `
    <a class="preview-link" href="${initial.file}" target="_blank" rel="noopener" aria-label="Open ${group.model}, ${initial.title}">
      <img src="${screenshotFor(initial)}" alt="Screenshot of ${group.model}: ${initial.title}" ${groupIndex < 4 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
    </a>
    <div class="model-info">
      <div class="model-copy">
        <p class="artifact-detail">${initial.title} · ${initial.relation}</p>
        <h3>${labFor(group.model) ? `<img class="lab-logo" src="${labFor(group.model).logo}" alt="${labFor(group.model).name}" title="${labFor(group.model).name}" width="18" height="18">` : ''}${group.model}</h3>
        <p class="model-release"></p>
      </div>
      <div class="versions" aria-label="Versions for ${group.model}"></div>
    </div>`;

  const releaseLink = document.createElement('a');
  releaseLink.href = release.source;
  releaseLink.target = '_blank';
  releaseLink.rel = 'noopener';
  releaseLink.title = release.note;
  if (release.date) {
    releaseLink.append('Released ');
    const time = document.createElement('time');
    time.dateTime = release.date;
    time.textContent = releaseDateFormat.format(new Date(`${release.date}T00:00:00Z`));
    releaseLink.append(time);
  } else {
    releaseLink.textContent = 'Release date unverified';
  }
  releaseLink.setAttribute('aria-label', `${group.model}: ${releaseLink.textContent}. View source.`);
  card.querySelector('.model-release').append(releaseLink);

  const preview = card.querySelector('.preview-link');
  const image = card.querySelector('img');
  const detail = card.querySelector('.artifact-detail');
  const versions = card.querySelector('.versions');

  const selectArtifact = (artifact, selectedButton) => {
    preview.href = artifact.file;
    preview.setAttribute('aria-label', `Open ${group.model}, ${artifact.title}`);
    image.src = screenshotFor(artifact);
    image.alt = `Screenshot of ${group.model}: ${artifact.title}`;
    detail.textContent = `${artifact.title} · ${artifact.relation}`;
    versions.querySelectorAll('.version-button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button === selectedButton));
    });
  };

  group.artifacts.forEach((artifact, artifactIndex) => {
    const button = document.createElement('button');
    button.className = 'version-button';
    button.type = 'button';
    button.textContent = String(artifactIndex + 1);
    button.title = `${artifact.title} — ${artifact.note}`;
    button.setAttribute('aria-label', `Show version ${artifactIndex + 1}: ${artifact.title}`);
    button.setAttribute('aria-pressed', String(artifactIndex === 0));
    button.addEventListener('click', () => selectArtifact(artifact, button));
    versions.append(button);
  });

  card.dataset.family = familySlug(group.model);
  card.dataset.line = lineFor(group.model).slug;
  group.card = card;
  gallery.append(card);
});

document.querySelector('#model-count').textContent = groups.length;
document.querySelector('#artifact-count').textContent = artifacts.length;

// Gallery filters and order. State lives in the URL hash: #family=claude&line=opus&order=grouped
const familyFilter = document.querySelector('#family-filter');
const lineFilter = document.querySelector('#line-filter');
const orderToggle = document.querySelector('#order-toggle');
const orderNote = document.querySelector('.gallery-order');
const state = { family: 'all', line: 'all', order: 'date' };
const tally = (list) => ({ models: list.length, outputs: list.reduce((sum, group) => sum + group.artifacts.length, 0) });
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function makeChip(container, className, key, value, label, count, logo) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset[key] = value;
  button.innerHTML = `${logo ? `<img src="${logo}" alt="" width="14" height="14">` : ''}<span>${label}</span>${count === undefined ? '' : `<span class="family-count">${count}</span>`}`;
  if (count !== undefined) button.setAttribute('aria-label', `${label}: ${plural(count, 'model')}`);
  container.append(button);
  return button;
}

const familyButtons = [
  makeChip(familyFilter, 'family-chip', 'family', 'all', 'All', groups.length),
  ...labs
    .filter((lab) => groups.some((group) => lab.test.test(group.model)))
    .map((lab) => makeChip(familyFilter, 'family-chip', 'family', lab.family.toLowerCase(), lab.family,
      groups.filter((group) => lab.test.test(group.model)).length, lab.logo))
];
const claudeGroups = groups.filter((group) => familySlug(group.model) === 'claude');
const lineButtons = [
  makeChip(lineFilter, 'family-chip line-chip', 'line', 'all', 'All Claude', claudeGroups.length),
  ...modelLines
    .filter((line) => line.family === 'claude' && claudeGroups.some((group) => lineFor(group.model) === line))
    .map((line) => makeChip(lineFilter, 'family-chip line-chip', 'line', line.slug, line.label,
      claudeGroups.filter((group) => lineFor(group.model) === line).length))
];
const orderButtons = [
  makeChip(orderToggle, 'family-chip order-chip', 'order', 'date', 'Release date'),
  makeChip(orderToggle, 'family-chip order-chip', 'order', 'grouped', 'Grouped by model')
];

familyButtons.forEach((button) => button.addEventListener('click', () => {
  setState({ family: button.dataset.family, line: 'all' });
}));
lineButtons.forEach((button) => button.addEventListener('click', () => setState({ line: button.dataset.line })));
orderButtons.forEach((button) => button.addEventListener('click', () => setState({ order: button.dataset.order })));

function normalise() {
  if (!familyButtons.some((button) => button.dataset.family === state.family)) state.family = 'all';
  if (state.family !== 'claude' || !lineButtons.some((button) => button.dataset.line === state.line)) state.line = 'all';
  if (state.order !== 'grouped') state.order = 'date';
}

function render() {
  normalise();
  const { family, line, order } = state;
  const press = (buttons, key, value) => buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset[key] === value)));
  press(familyButtons, 'family', family);
  press(lineButtons, 'line', line);
  press(orderButtons, 'order', order);
  lineFilter.hidden = family !== 'claude';

  const matches = (group) => (family === 'all' || familySlug(group.model) === family)
    && (line === 'all' || lineFor(group.model).slug === line);
  const ordered = order === 'grouped'
    ? [...chronological].sort((a, b) => modelLines.indexOf(lineFor(a.model)) - modelLines.indexOf(lineFor(b.model)))
    : groups;

  gallery.querySelectorAll('.group-heading').forEach((heading) => heading.remove());
  let currentLine = null;
  ordered.forEach((group) => {
    const visible = matches(group);
    group.card.hidden = !visible;
    const groupLine = lineFor(group.model);
    if (order === 'grouped' && visible && groupLine !== currentLine) {
      currentLine = groupLine;
      const members = tally(ordered.filter((entry) => matches(entry) && lineFor(entry.model) === groupLine));
      const heading = document.createElement('h3');
      heading.className = 'group-heading';
      heading.innerHTML = `${groupLine.heading}<span>${plural(members.models, 'model')} · ${plural(members.outputs, 'output')}</span>`;
      gallery.append(heading);
    }
    gallery.append(group.card);
  });

  const shown = tally(groups.filter(matches));
  const filtered = shown.models !== groups.length;
  document.querySelector('#model-count').textContent = filtered ? `${shown.models} of ${groups.length}` : groups.length;
  document.querySelector('#artifact-count').textContent = filtered ? `${shown.outputs} of ${artifacts.length}` : artifacts.length;
  orderNote.textContent = order === 'grouped'
    ? 'Grouped by model line · newest first within each'
    : 'Newest releases first · manual placements included';
}

function setState(changes) {
  Object.assign(state, changes);
  render();
  const params = new URLSearchParams();
  if (state.family !== 'all') params.set('family', state.family);
  if (state.line !== 'all') params.set('line', state.line);
  if (state.order !== 'date') params.set('order', state.order);
  const hash = params.toString();
  history.replaceState(null, '', `${location.pathname}${location.search}${hash ? `#${hash}` : ''}`);
}

// Only hashes made of filter keys drive state; #gallery, #compare etc. leave it alone.
function readHash() {
  if (!/^#(family|line|order)=/.test(location.hash)) return false;
  const params = new URLSearchParams(location.hash.slice(1));
  Object.assign(state, {
    family: params.get('family') || 'all',
    line: params.get('line') || 'all',
    order: params.get('order') || 'date'
  });
  return true;
}
readHash();
render();
window.addEventListener('hashchange', () => { if (readHash()) render(); });

const left = document.querySelector('#compare-left');
const right = document.querySelector('#compare-right');
groups.flatMap((group) => group.artifacts).forEach((artifact) => {
  [left, right].forEach((select) => {
    const option = document.createElement('option');
    option.value = artifact.id;
    option.textContent = `${artifact.model} — ${artifact.title}`;
    select.append(option);
  });
});
left.value = 'vulcan-v2';
right.value = 'astra';

function loadSide(side, id) {
  const artifact = artifacts.find((entry) => entry.id === id);
  const panel = document.querySelector(`[data-side="${side}"]`);
  panel.querySelector('.frame-heading').innerHTML = `<div><span>${artifact.model} · ${artifact.relation}</span><strong>${artifact.title}</strong></div><a href="${artifact.file}" target="_blank" rel="noopener">Open ↗</a>`;
  panel.querySelector('.frame-placeholder, iframe')?.remove();
  const iframe = document.createElement('iframe');
  iframe.src = artifact.file;
  iframe.title = `${artifact.model}: ${artifact.title}`;
  iframe.loading = 'lazy';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups');
  panel.append(iframe);
}

function loadComparison() {
  loadSide('left', left.value);
  loadSide('right', right.value);
  history.replaceState(null, '', `?left=${left.value}&right=${right.value}#compare`);
}

document.querySelector('#load-comparison').addEventListener('click', loadComparison);
document.querySelector('#swap').addEventListener('click', () => {
  [left.value, right.value] = [right.value, left.value];
  loadComparison();
});

document.querySelector('#copy-prompt').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(document.querySelector('#benchmark-prompt').textContent.trim());
    button.textContent = 'Copied';
    window.setTimeout(() => { button.textContent = 'Copy'; }, 1600);
  } catch {
    button.textContent = 'Select prompt to copy';
  }
});

const params = new URLSearchParams(location.search);
if (artifacts.some((artifact) => artifact.id === params.get('left'))) left.value = params.get('left');
if (artifacts.some((artifact) => artifact.id === params.get('right'))) right.value = params.get('right');
if (location.hash === '#compare' && params.has('left') && params.has('right')) loadComparison();
