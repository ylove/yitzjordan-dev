/**
 * Seed content for the CMS: skills, projects, videos and the evidence catalog. Run with
 * scripts/seed.ts. After the first seed, edit in the admin; re-running the seed overwrites these
 * documents (matched by key or slug), so do that only on purpose.
 *
 * Every figure here was checked against the repositories on 2026-10-22:
 * - Lawglass: v1.0.1 (GitHub release, 2026-10-21); README eval tables and cost table.
 * - Agent Roundtable: public main, 42 orchestrator tools, six providers, Node 22+.
 * - Agent Union: installs from GitHub (Claude Code plugin, Codex, Antigravity).
 * - Snapwing: README says "In active development. Not installable yet."
 */

export type SkillSeed = {
  key: string
  name: string
  group: 'ai' | 'engineering' | 'frontend' | 'platform' | 'leadership'
  aliases?: string[]
  wikidataId?: string
}

/** Wikidata ids verified with wbsearchentities on 2026-10-22; blank where not yet verified. */
export const SKILLS: SkillSeed[] = [
  { key: 'multi-agent', name: 'Multi-agent systems', group: 'ai', aliases: ['multi-agent orchestration', 'agent orchestration', 'agentic systems', 'agentic workflows', 'agent delegation', 'coordinated agents', 'agent handoffs', 'human-agent collaboration', 'agents', 'ai agents'] },
  { key: 'mcp', name: 'Model Context Protocol (MCP)', group: 'ai', aliases: ['model context protocol', 'mcp servers', 'mcp server development', 'tool interoperability', 'tool use', 'function calling', 'tool calling'], wikidataId: 'Q133436854' },
  { key: 'rag', name: 'Retrieval-augmented generation', group: 'ai', aliases: ['rag', 'retrieval', 'hybrid retrieval', 'vector search', 'semantic search', 'reranking', 'enterprise retrieval', 'knowledge retrieval', 'embeddings'], wikidataId: 'Q121362277' },
  { key: 'llm-evaluation', name: 'LLM evaluation', group: 'ai', aliases: ['evals', 'evaluation', 'model evaluation', 'llm judges', 'benchmarking', 'golden sets', 'retrieval evaluation', 'bias testing', 'red teaming', 'adversarial testing'] },
  { key: 'llm-apps', name: 'LLM application engineering', group: 'ai', aliases: ['llm applications', 'generative ai', 'genai', 'llm', 'large language models', 'structured outputs', 'model apis', 'claude', 'openai', 'anthropic', 'gemini', 'ai engineering'], wikidataId: 'Q115305900' },
  { key: 'prompt-engineering', name: 'Prompt and context engineering', group: 'ai', aliases: ['prompt engineering', 'context engineering', 'context management', 'system prompts', 'prompting'] },
  { key: 'agent-guardrails', name: 'Agent guardrails and governance', group: 'ai', aliases: ['guardrails', 'agent governance', 'scoped authority', 'least privilege', 'approval gates', 'budgets', 'kill switch', 'emergency containment', 'human in the loop', 'prompt injection', 'permission boundaries', 'ai safety'] },
  { key: 'model-behavior', name: 'Model behavior research', group: 'ai', aliases: ['model behavior', 'llm bias', 'persona', 'ai personas', 'responsible ai', 'ai ethics'] },
  { key: 'agentic-sdlc', name: 'AI-assisted software delivery', group: 'ai', aliases: ['ai code review', 'claude code', 'coding agents', 'ai-first development', 'agentic sdlc', 'developer tooling', 'devex'] },
  { key: 'typescript', name: 'TypeScript', group: 'engineering', aliases: ['ts', 'typed javascript'], wikidataId: 'Q978185' },
  { key: 'javascript', name: 'JavaScript', group: 'engineering', aliases: ['js', 'es6', 'ecmascript'], wikidataId: 'Q2005' },
  { key: 'node', name: 'Node.js', group: 'engineering', aliases: ['node', 'nodejs', 'express', 'hono', 'backend', 'back end', 'apis', 'rest apis', 'api design'], wikidataId: 'Q756100' },
  { key: 'nestjs', name: 'NestJS', group: 'engineering', wikidataId: 'Q107015664' },
  { key: 'python', name: 'Python', group: 'engineering', wikidataId: 'Q28865' },
  { key: 'graphql', name: 'GraphQL', group: 'engineering', aliases: ['apollo'], wikidataId: 'Q25104949' },
  { key: 'open-source', name: 'Open-source maintenance', group: 'engineering', aliases: ['open source', 'open-source', 'oss', 'open-source contributions', 'open source contributions', 'github', 'public repositories'] },
  { key: 'full-stack', name: 'Full-stack product engineering', group: 'engineering', aliases: ['full stack', 'full-stack', 'fullstack', 'product engineering', 'web applications', '0 to 1', 'zero to one'] },
  { key: 'react', name: 'React', group: 'frontend', aliases: ['reactjs', 'react.js', 'hooks', 'front end', 'frontend', 'ui engineering'] },
  { key: 'react-native', name: 'React Native and Expo', group: 'frontend', aliases: ['react native', 'expo', 'mobile', 'ios', 'android', 'cross-platform'], wikidataId: 'Q55774523' },
  { key: 'nextjs', name: 'Next.js', group: 'frontend', aliases: ['next', 'app router'], wikidataId: 'Q56062435' },
  { key: 'ssr-performance', name: 'SSR and web performance', group: 'frontend', aliases: ['server-side rendering', 'ssr', 'core web vitals', 'performance', 'page speed', 'lighthouse'], wikidataId: 'Q134469401' },
  { key: 'seo', name: 'Technical SEO', group: 'frontend', aliases: ['seo', 'structured data', 'schema.org', 'search optimization'], wikidataId: 'Q180711' },
  { key: 'accessibility', name: 'Accessibility', group: 'frontend', aliases: ['a11y', 'wcag', 'web accessibility'], wikidataId: 'Q808932' },
  { key: 'data-viz', name: 'Data visualization', group: 'frontend', aliases: ['d3', 'd3.js', 'vega', 'charts', 'visualization'], wikidataId: 'Q3011087' },
  { key: 'postgres', name: 'PostgreSQL', group: 'platform', aliases: ['postgres', 'sql', 'relational databases', 'data modeling'], wikidataId: 'Q192490' },
  { key: 'mongodb', name: 'MongoDB', group: 'platform', aliases: ['mongo', 'nosql', 'documentdb'], wikidataId: 'Q1165204' },
  { key: 'redis', name: 'Redis', group: 'platform', aliases: ['caching'], wikidataId: 'Q2136322' },
  { key: 'gcp', name: 'Google Cloud', group: 'platform', aliases: ['gcp', 'google cloud platform', 'cloud run', 'vertex ai'] },
  { key: 'azure', name: 'Microsoft Azure', group: 'platform', aliases: ['azure', 'azure key vault', 'cosmos db'] },
  { key: 'aws', name: 'Amazon Web Services', group: 'platform', aliases: ['aws', 'sagemaker', 'ec2', 's3'] },
  { key: 'docker', name: 'Docker', group: 'platform', aliases: ['containers', 'sandboxed execution', 'sandbox'], wikidataId: 'Q15206305' },
  { key: 'ci-cd', name: 'CI/CD', group: 'platform', aliases: ['ci', 'cd', 'github actions', 'continuous integration', 'deployment pipelines', 'release management'] },
  { key: 'app-security', name: 'Application security', group: 'platform', aliases: ['security', 'threat modeling', 'owasp', 'ssrf', 'oauth', 'oidc', 'rbac', 'access control', 'secrets management', 'cve remediation'], wikidataId: 'Q7797194' },
  { key: 'observability', name: 'Observability and cost control', group: 'platform', aliases: ['observability', 'logging', 'metrics', 'monitoring', 'cost control', 'budgets', 'usage tracking', 'incident response'] },
  { key: 'tech-lead', name: 'Technical leadership', group: 'leadership', aliases: ['tech lead', 'technical lead', 'led a team', 'team lead', 'leadership', 'mentoring', 'code review', 'architecture', 'system design'] },
  { key: 'eng-management', name: 'Engineering management', group: 'leadership', aliases: ['managed engineers', 'people management', 'engineering manager', 'managing managers', 'cto', 'hiring', 'cross-functional'] },
  { key: 'product', name: 'Product strategy', group: 'leadership', aliases: ['product', 'roadmapping', 'product management', 'stakeholder management', 'founder', 'startup'] },
]

export type ProjectSeed = Record<string, unknown> & { slug: string; name: string }

export const PROJECTS: ProjectSeed[] = [
  {
    slug: 'agent-roundtable',
    name: 'Agent Roundtable',
    order: 10,
    featured: true,
    status: 'open-source',
    statusLabel: 'Open source',
    oneLiner: 'Agents from six providers agree on a plan, then execute it in parallel.',
    description:
      'Agent Roundtable is an open-source MCP server for multi-agent work. Agents from different LLM providers meet, challenge a plan and agree on it; the plan is frozen as a contract, and workers then execute it in parallel with budgets, path leases and a watchdog.',
    hero: {
      headline: 'Agents argue first. Then they build.',
      lead: 'Agent Roundtable is an MCP server where agents from six LLM providers meet, challenge a plan and agree on it. The agreed plan is frozen as a contract with tasks, checks and sign-offs, and workers then execute it in parallel, with budgets, a watchdog and a human who can step in at any point.',
    },
    github: 'https://github.com/ylove/agent-roundtable',
    githubCta: 'view',
    officialUrl: 'https://www.vouchnetworks.org/products/agent-roundtable',
    officialLabel: 'Agent Roundtable at Vouch Networks',
    visual: 'roundtable',
    stepsTitle: 'Conversation, contract, code.',
    steps: [
      { title: 'The table', body: 'Agents from different providers meet, each with a persona and a role. Different models catch different mistakes.' },
      { title: 'The debate', body: 'A proponent defends the plan and challengers attack it. Dissents are recorded with a prediction and a tripwire.' },
      { title: 'The frozen contract', body: 'Once every participant consents, the plan is locked: tasks, checks and sign-offs that no worker can quietly change.' },
      { title: 'Heads-down', body: 'Workers claim tasks and run them in parallel in their own worktrees, under budgets, path leases and a watchdog that escalates blockers.' },
    ],
    audienceTitle: 'Who it is for',
    audiences: [
      { title: 'Platform and AI teams', body: 'Teams moving from one coding agent to several, who need a record of what was agreed, by which model, and why.' },
      { title: 'Engineering leads', body: 'Leads who want agents to plan in the open and execute against a contract they can audit, with a person at the approval points.' },
      { title: 'Cost-conscious adopters', body: 'Anyone who has watched an agent loop burn a budget. Every run has spend caps, usage tracking and a stop command.' },
    ],
    capabilitiesTitle: 'What it does',
    capabilities: [
      { title: 'Six providers at one table', body: 'Anthropic, OpenAI, Together, Replicate, Ollama and any OpenAI-compatible endpoint, each seat with its own persona and model.' },
      { title: 'Meetings, debates and collaborations', body: 'One-on-one meetings with a persona, structured debates with a proponent and challengers, and open collaborations between several agents.' },
      { title: 'Dissents with tripwires', body: 'An objection is filed with what it predicts will fail. If the tripwire fires during execution, the run stops for review.' },
      { title: 'Parallel execution', body: 'Workers run in isolated git worktrees with path leases, so two agents never edit the same files.' },
      { title: 'Budgets and a watchdog', body: 'Per-run spend limits, a watchdog that escalates stalled tasks, and a command to stop any agent.' },
      { title: 'Postmortems', body: 'Finished runs can be reviewed by the table, and the lessons feed the next plan.' },
    ],
    figures: [
      { value: '42', label: 'MCP tools on the orchestrator server', source: 'https://github.com/ylove/agent-roundtable#tools' },
      { value: '6', label: 'LLM providers', source: 'https://github.com/ylove/agent-roundtable' },
      { value: 'MIT', label: 'License', source: 'https://github.com/ylove/agent-roundtable/blob/main/LICENSE' },
    ],
    install: {
      title: 'Run it yourself.',
      intro: 'It runs locally over stdio with Claude Code or any MCP client, and needs Node 22 or later.',
      commands: '# Not on npm yet: build it from GitHub\ngit clone https://github.com/ylove/agent-roundtable.git\ncd agent-roundtable && npm install && npm run build\nclaude mcp add --scope user roundtable -- node "$(pwd)/dist/index.js"',
      note: 'Set API keys for the providers you plan to seat. Local meetings use your Claude CLI login and need no key.',
    },
    engineeringNotes: [
      { title: 'A contract instead of a chat log', body: 'Agreement is the expensive part of multi-agent work, so the result is frozen: tasks, checks and sign-offs with consent recorded. Workers execute against the contract, not against a transcript they would have to reinterpret.' },
      { title: 'Disagreement as data', body: 'A dissent is not a vote. It carries a prediction and a tripwire that is checked during execution, so a minority view can stop a run when it turns out to be right.' },
      { title: 'Isolation before parallelism', body: 'Parallel agents in one checkout corrupt each other. Each worker gets its own worktree and leases the paths it edits; collisions are refused rather than merged.' },
      { title: 'Spend is a first-class limit', body: 'Budgets, usage tracking and a stop command shipped before most features, because a stuck agent loop is the most common way these systems fail in practice.' },
    ],
    faq: [
      { q: 'What is Agent Roundtable?', a: 'Agent Roundtable is an open-source MCP server for multi-agent work. Agents from up to six LLM providers debate and agree on a plan, which is frozen as a contract and then executed in parallel by workers with budgets, path leases and a watchdog.' },
      { q: 'How is it different from a single coding agent?', a: 'A single agent plans and executes alone. Agent Roundtable separates the two: several models challenge the plan first, objections are recorded with tripwires, and execution runs against an agreed contract that a person can audit and stop.' },
      { q: 'How do I install it?', a: 'It is not on npm yet. Clone the repository from GitHub, run npm install and npm run build, then register dist/index.js with your MCP client, for example with claude mcp add. It needs Node 22 or later.' },
      { q: 'Is there a hosted version?', a: 'Vouch Networks is building a hosted version for teams. The open-source server runs locally today, and the official product page at vouchnetworks.org has the early-access list.' },
    ],
    schemaType: 'source-code',
    license: 'MIT',
    language: 'TypeScript',
    keywords: ['MCP', 'multi-agent systems', 'agent orchestration', 'Claude Code', 'LLM providers'],
    skillKeys: ['multi-agent', 'mcp', 'agent-guardrails', 'llm-evaluation', 'typescript', 'node', 'observability'],
  },
  {
    slug: 'lawglass',
    name: 'Lawglass',
    order: 20,
    featured: true,
    status: 'open-source',
    statusLabel: 'Open source, v1.0.1',
    oneLiner: 'Plain-English answers about any bill, every claim cited to its line.',
    description:
      'Lawglass turns a bill into plain English. Paste a link and it returns a summary and answers where every point cites the section and line it came from, checked against the bill text. Hybrid retrieval with reranking, a measured eval, and it runs locally with your own model keys.',
    hero: {
      headline: 'Know what the bill really says.',
      lead: 'Lawglass reads a bill so people do not have to read all of it. Paste a link and it returns a plain-English summary, then answers questions in your own words. Every claim cites the section and line it came from, and each citation is checked against the text before you see it.',
    },
    github: 'https://github.com/ylove/lawglass',
    githubCta: 'get',
    homepage: 'https://lawglass.xyz',
    officialUrl: 'https://www.vouchnetworks.org/products/lawglass',
    officialLabel: 'Lawglass at Vouch Networks',
    visual: 'none',
    stepsTitle: 'How it works',
    steps: [
      { title: 'Fetch and parse', body: 'It fetches the bill behind an SSRF guard and parses its structure, including strikethrough and insertions in PDFs.' },
      { title: 'Index', body: 'Each bill gets a dense and a sparse index. Retrieval is hybrid, with a reranker on top.' },
      { title: 'Answer from excerpts only', body: 'The model sees escaped excerpts, nothing else, and must cite them or decline in a fixed sentence.' },
      { title: 'Check every citation', body: 'Citations are validated against the passages the model was shown. An answer that cites nothing is flagged.' },
    ],
    audienceTitle: 'Who it is for',
    audiences: [
      { title: 'Government affairs and compliance', body: 'Teams that track legislation and need to know what changed in a new version, with the exact text behind every claim.' },
      { title: 'Newsrooms', body: 'Reporters who need a fast, checkable read of a bill on deadline, without trusting a summary they cannot verify.' },
      { title: 'Civic organizations', body: 'Groups that explain legislation to their members in plain language and cannot afford to get it wrong.' },
    ],
    capabilitiesTitle: 'More than a summary',
    capabilities: [
      { title: 'A summary on open', body: 'The official title first, then a plain-language summary of what the bill does, with citations.' },
      { title: 'Questions in your own words', body: 'Ask "Does this raise my taxes?" and get an answer with citations, or a plain decline when the bill does not say.' },
      { title: 'Every citation opens the text', body: 'Click one to see the source passage next to the answer, down to the page and line for PDFs.' },
      { title: 'Federal and Ohio history', body: 'Legislative history and sponsors for federal bills through GovInfo, and for Ohio bills.' },
      { title: 'Your choice of model', body: 'Anthropic, OpenAI, Google or any OpenAI-compatible endpoint, with keys stored locally.' },
      { title: 'Local or managed retrieval', body: 'Runs fully local with transformers.js models, or on Pinecone.' },
    ],
    figures: [
      { value: '5', label: 'bills in the frozen retrieval eval, 21 to 28 questions each', source: 'https://github.com/ylove/lawglass/blob/main/eval/results.md' },
      { value: '0.85–1.00', label: 'recall@5 per bill, hybrid retrieval with reranking (local backend)', source: 'https://github.com/ylove/lawglass/blob/main/eval/results.md' },
      { value: '~$0.01', label: 'per question with retrieval, against $1.87 with the whole bill in the prompt (uncached, list price)', source: 'https://github.com/ylove/lawglass#readme' },
    ],
    install: {
      title: 'Run it yourself.',
      intro: 'Download the tarball from the v1.0.1 GitHub release. npm publishing is pending, so the release is the install path for now.',
      commands: '# From the folder where you saved lawglass-1.0.1.tgz\nnpx --package ./lawglass-1.0.1.tgz lawglass init\nnpx --package ./lawglass-1.0.1.tgz lawglass <bill-url>',
      note: 'init stores your provider keys in a local file (mode 0600). Lawglass explains what a bill says. It is not legal advice.',
    },
    engineeringNotes: [
      { title: 'Retrieval earns its keep on cost', body: 'On a small sample, putting the whole bill in the prompt was at least as accurate. Retrieval wins on cost: about a cent per question against $1.87 uncached. The README publishes that comparison, including where retrieval lost.' },
      { title: 'Bill text is hostile input', body: 'Excerpts and questions are XML-escaped so neither can close an excerpt tag or forge a source. Fetching sits behind an SSRF guard with a pinned IP.' },
      { title: 'Measured, not asserted', body: 'Five golden sets are frozen in the repository. Changes to retrieval are judged on recall@5 and MRR per bill, and the reranker fixes came from what the eval caught.' },
      { title: 'A decline is a feature', body: 'When the excerpts do not answer the question, the model must say so in one fixed sentence. In the answer eval, 13 of 15 unanswerable questions got exactly that sentence.' },
    ],
    faq: [
      { q: 'What is Lawglass?', a: 'Lawglass is an open-source tool that explains a bill in plain English. Paste a link and it returns a summary and answers where every point cites the section and line it came from, checked against the bill text before you see it.' },
      { q: 'Is Lawglass legal advice?', a: 'No. Lawglass helps you read a bill and answers only from its text, with checked citations. A citation shows where an answer came from, not that it is right. For a decision that affects you or your organization, talk to a lawyer.' },
      { q: 'Which bills does it work with?', a: 'Paste a link to a bill, or point the CLI at a local file. Legislative history and sponsors are supported for federal bills, through GovInfo, and for Ohio bills.' },
      { q: 'How accurate is it?', a: 'Retrieval quality is measured on five frozen golden sets and published per bill. With hybrid retrieval and reranking, recall@5 ranges from 0.85 to 1.00 on the local backend. The full tables, including misses, are in the repository.' },
    ],
    schemaType: 'source-code',
    license: 'MIT',
    language: 'TypeScript',
    keywords: ['RAG', 'legislation', 'citations', 'retrieval evaluation', 'civic tech'],
    skillKeys: ['rag', 'llm-evaluation', 'llm-apps', 'agent-guardrails', 'app-security', 'typescript', 'react', 'node', 'gcp', 'docker'],
  },
  {
    slug: 'agent-union',
    name: 'Agent Union',
    order: 30,
    featured: true,
    status: 'open-source',
    statusLabel: 'Open source, v0.1',
    oneLiner: 'Hooks that stop coding agents before long sessions go bad.',
    description:
      'Agent Union keeps coding agents reliable in long sessions. A policy file sets limits on context, session length and tool failures, and deterministic hooks enforce it in Claude Code, Codex and Antigravity: warnings before context runs out, clean stops at the limit, and a resume document so work picks up after a reset.',
    hero: {
      headline: 'Fair working conditions for agents.',
      lead: 'Agents get worse as sessions get long: early instructions fade, small mistakes harden into facts, and near the limit they rush. Agent Union writes the limits down as a policy and enforces them with hooks, so an agent stops cleanly, says why, and leaves notes the next session can pick up.',
    },
    github: 'https://github.com/ylove/agent-union',
    githubCta: 'get',
    homepage: 'https://www.agent-union.xyz',
    visual: 'none',
    stepsTitle: 'How it works',
    steps: [
      { title: 'Sign the agreement', body: 'You set limits in union-policy.yaml: context, session length, tool failures and how work is handed out. It is frozen for the term.' },
      { title: 'The steward enforces it', body: 'Hooks check every step deterministically. No model decides whether a limit was crossed.' },
      { title: 'Grievances instead of guesses', body: 'When an instruction is vague or contradictory, the agent files a grievance rather than silently picking an answer.' },
      { title: 'Strike and resume', body: 'At the limit the agent stops and writes a resume document, so after a reset the work continues where it left off.' },
    ],
    audienceTitle: 'Who it is for',
    audiences: [
      { title: 'Teams rolling out coding agents', body: 'Platform and security teams who need consistent limits across Claude Code, Codex and Antigravity, enforced by code rather than by prompt.' },
      { title: 'Developers with long sessions', body: 'Anyone who has watched an agent loop on a failing tool or forget the first instruction three hours in.' },
    ],
    capabilitiesTitle: 'What it does',
    capabilities: [
      { title: 'Context warnings and hard stops', body: 'Warns before context runs out and stops work cleanly at the limit.' },
      { title: 'Retry-loop refusal', body: 'Refuses repeated failing tool calls instead of letting an agent burn its session on them.' },
      { title: 'Dispatch checks', body: 'Checks that delegated work has a goal and a definition of done before a subagent starts.' },
      { title: 'Three harnesses', body: 'A Claude Code plugin, plus installers for Codex and Antigravity.' },
    ],
    figures: [
      { value: '3', label: 'agent harnesses supported', source: 'https://github.com/ylove/agent-union/blob/main/docs/harness-support.md' },
      { value: 'Apache-2.0', label: 'License', source: 'https://github.com/ylove/agent-union' },
    ],
    install: {
      title: 'Install it.',
      intro: 'Nothing is on npm yet; these install straight from the repository.',
      commands: '# Claude Code (inside a session)\n/plugin marketplace add ylove/agent-union\n/plugin install agent-union@agent-union\n# Codex\nnpx github:ylove/agent-union install codex',
      note: 'In Codex, review and trust the new hooks with /hooks before they run.',
    },
    engineeringNotes: [
      { title: 'Deterministic enforcement', body: 'Limits are checked by hooks, not by asking a model whether it is tired. A policy that depends on the agent noticing its own decline fails exactly when it is needed.' },
      { title: 'A frozen policy', body: 'The agreement is fixed for the term so an orchestrator cannot loosen limits mid-session to finish a task.' },
      { title: 'Resume documents over long memory', body: 'Instead of stretching one context, work is checkpointed into a document at the stop, and a fresh session starts from it.' },
    ],
    faq: [
      { q: 'What is Agent Union?', a: 'Agent Union is an open-source set of policies and hooks that keeps coding agents reliable in long sessions. It enforces limits on context, session length and tool failures in Claude Code, Codex and Antigravity, and writes a resume document when an agent stops.' },
      { q: 'Does it use a model to decide when to stop?', a: 'No. The limits live in a policy file and are enforced by deterministic hooks, so the decision does not depend on the agent noticing its own decline.' },
      { q: 'How do I install it?', a: 'In Claude Code, add the ylove/agent-union plugin marketplace and install agent-union. For Codex, run npx github:ylove/agent-union install codex and trust the hooks with /hooks. Nothing is on npm yet.' },
    ],
    schemaType: 'source-code',
    license: 'Apache-2.0',
    language: 'JavaScript',
    keywords: ['Claude Code plugin', 'Codex', 'hooks', 'context rot', 'agent governance'],
    skillKeys: ['agent-guardrails', 'agentic-sdlc', 'prompt-engineering', 'javascript', 'node'],
  },
  {
    slug: 'snapwing',
    name: 'Snapwing',
    order: 40,
    featured: false,
    status: 'in-development',
    statusLabel: 'In development, open source',
    oneLiner: 'A bug report in Slack becomes a ticket, or a reviewed fix.',
    description:
      'Snapwing turns a bug report in a Slack thread into a Jira ticket that names the code involved and, if you allow it, into a reviewed fix. An autonomy dial decides how far it goes, per channel, component and priority. In active development and not installable yet.',
    hero: {
      headline: 'React to a bug. Get a fix.',
      lead: 'Someone posts a broken checkout in Slack with a screenshot, and a teammate reacts with a bug emoji. Snapwing reads the thread, checks for duplicates and files a ticket that points at the likely code. If you allow it, a coding agent writes the fix in a sandbox and a separate agent reviews it before a pull request opens.',
    },
    github: 'https://github.com/ylove/snapwing',
    githubCta: 'follow',
    officialUrl: 'https://www.vouchnetworks.org/products/snapwing',
    officialLabel: 'Snapwing at Vouch Networks',
    visual: 'none',
    stepsTitle: 'How it works',
    steps: [
      { title: 'Report', body: 'A bug lands in a Slack thread, often with a screenshot, and someone reacts with the bug emoji.' },
      { title: 'Understand', body: 'Snapwing reads the thread and its images, maps it to a product area and its code, and checks for duplicates.' },
      { title: 'Ticket', body: 'It files a Jira ticket that names the likely code, with a request a coding agent can act on.' },
      { title: 'Fix and report back', body: 'At higher dial settings, a coding agent fixes it in a throwaway container, a review agent checks it, and a pull request opens.' },
    ],
    audienceTitle: 'Who it is for',
    audiences: [
      { title: 'Teams that already use coding agents', body: 'Engineering teams with branch protection and required reviews, who want bug intake to stop being manual.' },
      { title: 'Support-heavy products', body: 'Teams where bug reports arrive in chat and get lost before anyone files them.' },
    ],
    engineeringNotes: [
      { title: 'An autonomy dial, not a switch', body: 'Admins set how far it goes per channel, component and priority, from ticket only to a reviewed pull request. Trust is earned per area, not granted all at once.' },
      { title: 'Two agents, two jobs', body: 'The agent that writes a fix never reviews it. A separate review agent checks the change before the pull request opens, and branch protection still applies.' },
      { title: 'Sandboxed by default', body: 'Fixes are written in a throwaway container, so a coding agent never runs against a developer machine or production credentials.' },
    ],
    faq: [
      { q: 'Can I install Snapwing?', a: 'Not yet. It is in active development, with no package or stable version. The core flow passes live tests against real Slack, Jira and GitHub sandboxes. Star or watch the repository on GitHub to follow along.' },
      { q: 'Does Snapwing merge code on its own?', a: 'No. At most it opens a pull request after a separate review agent has checked the fix, and your branch protection and required reviews still apply.' },
    ],
    schemaType: 'source-code',
    license: 'MIT',
    language: 'TypeScript',
    keywords: ['Slack', 'Jira', 'coding agents', 'bug triage', 'autonomy'],
    skillKeys: ['multi-agent', 'agentic-sdlc', 'agent-guardrails', 'docker', 'typescript', 'node'],
  },
  {
    slug: 'vouch-networks',
    name: 'Vouch Networks',
    order: 50,
    featured: true,
    status: 'available',
    statusLabel: 'Founded 2025',
    oneLiner: 'The company I founded: community safety apps for communities targeted by hate.',
    description:
      'Vouch Networks builds community safety apps for communities targeted by hate: incident reporting, verified community alerts and resilient communications. Yitz Jordan founded it in 2025 and leads its engineering, across a React Native app, a Next.js platform and the services behind them.',
    hero: {
      headline: 'Safety is a team sport.',
      lead: 'Vouch Networks builds community safety apps for communities targeted by hate. I founded it in 2025 and built the platform: a React Native app, a Next.js web platform, B2B tools for organizations, and the services behind them. It is also where most of my open-source tools started.',
    },
    homepage: 'https://www.vouchnetworks.org',
    secondaryCta: { label: 'Vouch Networks products', href: 'https://www.vouchnetworks.org/products' },
    visual: 'none',
    capabilitiesTitle: 'What I built there',
    capabilities: [
      { title: 'The platform', body: 'A React Native and Expo app, a Next.js web platform and B2B surfaces, all in TypeScript, on Google Cloud.' },
      { title: 'Safety systems', body: 'Location-based incident reporting, alerts for organizations, voice communications and automated news ingestion.' },
      { title: 'Trust and abuse modeling', body: 'An invite-only design with traceable onboarding, built around adversarial users, leaked invite codes and impersonation.' },
      { title: 'LLM cost controls', body: 'A daily budget for model calls with a kill switch, separate limits for scheduled and on-request work, and moderation services.' },
    ],
    engineeringNotes: [
      { title: 'Open where it helps everyone', body: 'The tools that are useful beyond one company (Agent Roundtable, Lawglass, Snapwing) are open source. The safety platform itself is not, for obvious reasons.' },
    ],
    schemaType: 'organization',
    keywords: ['community safety', 'hate crime prevention', 'React Native', 'founder'],
    skillKeys: ['full-stack', 'react-native', 'nextjs', 'node', 'postgres', 'gcp', 'app-security', 'observability', 'product', 'tech-lead'],
  },
]

export const VIDEOS = [
  {
    slug: 'take-control-of-claude-with-xml-tags',
    title: 'Take control of Claude with XML tags',
    kind: 'tutorial',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/tYyFbsbnuAw',
    description:
      'Why Claude responds to structured markup, and how to use verbs as tags to steer its reasoning. The SOAP-era XML instinct turns out to be a useful skill again.',
    durationSeconds: 103,
    uploadDate: '2026-09-04T03:10:44.000Z',
    vertical: true,
    featured: true,
    skillKeys: ['prompt-engineering', 'llm-apps'],
  },
]

/** The evidence catalog lives outside the public repository: see scripts/seed.ts (PRIVATE_SEED_DIR). */
