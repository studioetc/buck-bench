// First-party release/availability records researched by GPT-5.6 Terra on 2026-09-07.
// Dates reflect the official launch; private partner previews are excluded.
const modelReleases = {
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
  {id:'opus55',model:'Claude Opus 5.5',title:'Refuelling simulation',file:'raw/claude-opus-5-5/opus55/black-buck-refuelling.html',relation:'Independent run',note:'Single-prompt build with the benchmark prompt; no subagents or skills recorded.'},
  {id:'vulcan-v1',model:'Claude Fable 5',title:'Vulcan · v1',file:'raw/claude-fable-5/vulcan-v1/black-buck.html',relation:'Original',note:'First output in a session that later produced v2.'},
  {id:'vulcan-v2',model:'Claude Fable 5',title:'Vulcan · v2',file:'raw/claude-fable-5/vulcan-v2/black-buck-v2.html',relation:'Revision',note:'In-session continuation with expanded geography and formation detail.'},
  {id:'opus5-v1',model:'Claude Opus 5',title:'Opus 5 · v1',file:'raw/claude-opus-5/opus5-v1/black-buck.html',relation:'Original',note:'First output in a session that later produced v2.'},
  {id:'opus5-v2',model:'Claude Opus 5',title:'Opus 5 · v2',file:'raw/claude-opus-5/opus5-v2/black-buck-v2.html',relation:'Revision',note:'Follow-up revision with formation and fuel-model changes.'},
  {id:'fable51-simulation',model:'Claude Fable 5.1',title:'Detailed simulation',file:'raw/claude-fable-5-1/fable51-simulation/black-buck.html',relation:'Original',note:'Fresh detailed simulation output.'},
  {id:'fable51-story',model:'Claude Fable 5.1',title:'Narrative story',file:'raw/claude-fable-5-1/fable51-story/black-buck-story.html',relation:'Related variant',note:'Narrative revision requested in the same session.'},
  {id:'sol-codex',model:'GPT-5.6 Sol',title:'Codex harness',file:'raw/gpt-5.6-sol/sol-codex/index.html',relation:'Independent run',note:'Built in a Codex session.'},
  {id:'sol-claude-harness',model:'GPT-5.6 Sol',title:'Claude-format harness',file:'raw/gpt-5.6-sol/sol-claude-harness/index.html',relation:'Independent run',note:'Recorded GPT model ID in a Claude-format session.'},
  {id:'sonnet5',model:'Claude Sonnet 5',title:'Refuelling chain',file:'raw/claude-sonnet-5/sonnet5/black-buck-1-refuelling.html',relation:'Independent run',note:'Recovered completed build.'},
  {id:'astra',model:'GPT-6 Astra',title:'Astra simulation',file:'raw/gpt-6-astra/astra/index.html',relation:'Independent run',note:'Built in a Codex session.'},
  {id:'documents-opus48',model:'Claude Opus 4.8',title:'Mission visualisation',file:'raw/claude-opus-4-8/documents-opus48/index.html',relation:'Assisted run',note:'Main build model; a Sonnet 4.6 subagent also contributed.'},
  {id:'aaa-opus47',model:'Claude Opus 4.7',title:'Mission visualisation',file:'raw/claude-opus-4-7/aaa-opus47/index.html',relation:'Delegated run',note:'Same-model subagent build with subsequent parent changes.'},
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

// Manual placement overrides applied after the chronological sort.
const pinnedPositions = { 'Claude Fable 5': 1 };
Object.entries(pinnedPositions).forEach(([model, position]) => {
  const index = groups.findIndex((group) => group.model === model);
  if (index === -1) return;
  const [group] = groups.splice(index, 1);
  groups.splice(position, 0, group);
});
const releaseDateFormat = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
});

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
        <h3>${group.model}</h3>
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

  gallery.append(card);
});

document.querySelector('#model-count').textContent = groups.length;
document.querySelector('#artifact-count').textContent = artifacts.length;

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
