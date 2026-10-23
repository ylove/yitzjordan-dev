/**
 * Seed content for the CMS: skills, projects, videos and the evidence catalog. Run with
 * scripts/seed.ts. After the first seed, edit in the admin; re-running the seed overwrites these
 * documents (matched by key or slug), so do that only on purpose.
 *
 * Every figure and feature here was checked against the repositories on 2026-10-22:
 * - Lawglass: v1.0.1 (GitHub release, 2026-10-21); README eval tables and cost table; hybrid
 *   retrieval is dense + BM25 merged by reciprocal rank fusion, then a cross-encoder reranker.
 * - Agent Roundtable: public main, 42 orchestrator tools, six providers, Node 22+. Duel and
 *   Casting Call are on the release/2.0.0 branch only, so the copy says "coming in 2.0".
 * - Agent Union: installs from GitHub (Claude Code plugin, Codex, Antigravity); 16 grievance
 *   codes; default stop at 85 percent context saturation.
 * - Snapwing: README says "In active development. Not installable yet." Six flows pass live
 *   tests; level 3 (autopilot) can merge when every gate passes.
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
      'Agent Roundtable is an open-source agent collaboration environment for multi-agent orchestration, run as an MCP server. AI agents from six LLM providers meet, debate, prototype and agree on a plan in formats from structured debate to a waffle-house gauntlet. The plan is frozen as a contract, and parallel workers execute it with budgets, path leases, a watchdog and human approval points.',
    hero: {
      headline: 'Agents argue first. Then they build.',
      lead: 'Agent Roundtable is an open-source agent collaboration environment. Seat AI agents from six LLM providers at one table and choose how they work: a meeting, a structured debate, a waffle-house gauntlet or a prototype review. When they agree, the plan is frozen as a contract and parallel workers build it, with budgets, a watchdog and a person at every approval point.',
    },
    github: 'https://github.com/ylove/agent-roundtable',
    githubCta: 'view',
    officialUrl: 'https://www.vouchnetworks.org/products/agent-roundtable',
    officialLabel: 'Agent Roundtable at Vouch Networks',
    visual: 'roundtable',
    stepsTitle: 'Conversation, contract, code.',
    steps: [
      { title: 'The table', body: 'Agents from different providers take their seats, each with a persona, a role and its own model. Different models catch different mistakes.' },
      { title: 'The debate', body: 'A proponent defends the plan and challengers attack it. Objections are recorded as dissents, each with a prediction and a tripwire.' },
      { title: 'The frozen contract', body: 'Once every participant consents, the plan is locked: tasks, checks and sign-offs that no worker can quietly change.' },
      { title: 'Heads-down', body: 'Workers claim tasks and build in parallel, each in its own git worktree, under budgets, path leases and a watchdog that escalates blockers to you.' },
    ],
    audienceTitle: 'Who it is for',
    audiences: [
      { title: 'AI and platform teams', body: 'Teams moving from one coding agent to several, who need a record of what was agreed, by which model, and why.' },
      { title: 'Leaders making a call', body: 'Put a plan in front of a skeptic, a CFO and a product lead before you commit. The debate and waffle-house formats work for strategy as well as code.' },
      { title: 'Teams watching spend', body: 'Anyone who has seen an agent loop burn through a budget. Every run has spend caps, usage tracking and a stop command.' },
    ],
    capabilitiesTitle: 'Every way to run the table',
    capabilities: [
      { title: 'Six providers at one table', body: 'Anthropic, OpenAI, Together AI, Replicate, Ollama and any OpenAI-compatible endpoint. Each seat gets its own persona and model.' },
      { title: 'Meetings and collaborations', body: 'A one-on-one meeting with a persona, an open collaboration between several, or an informal conversation. Local meetings run on your Claude CLI login.' },
      { title: 'Debate and waffle house', body: 'In a debate, a proponent faces challengers. In a waffle house, every other seat attacks one idea and the defender answers each volley, so the idea comes out stronger or not at all.' },
      { title: 'Prototype mode', body: 'Agents show proposals as throwaway prototypes (a page, code, a diagram or a draft) on a local board, and the others judge them before anything is built.' },
      { title: 'Ultraplan and agent workshops', body: 'Collect input and sign-offs on a plan, or have specialists design a new agent, improve an existing one and write reusable skills.' },
      { title: 'Duel and Casting Call', body: 'Coming in the 2.0 release: two teams build competing artifacts while judges pick a winner, and a casting call auditions your personas for a brief and recommends a cast.' },
      { title: 'Contracts with dissents', body: 'The agreed plan is frozen with tasks, checks and sign-offs. A dissent carries a prediction and a tripwire, and if the tripwire fires, the run stops for review.' },
      { title: 'Parallel execution with oversight', body: 'Workers run in isolated git worktrees with path leases, checks and a watchdog. You can pause, steer or stop any agent, and every run has a budget.' },
      { title: 'Postmortems', body: 'Opt in, and the agents that did the work meet the findings after testing, then leave lessons that are read before the next plan.' },
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
      { title: 'A format for each kind of problem', body: 'A brainstorm, a decision and a design review need different rules. A debate gives the proponent the floor, a waffle house always ends on the defender’s rebuttal, and prototype mode makes agents show an idea instead of describing it. Picking the format does half the work of the prompt.' },
      { title: 'Disagreement as data', body: 'A dissent is not a vote. It carries a prediction and a tripwire that is checked during execution, so a minority view can stop a run when it turns out to be right.' },
      { title: 'Isolation before parallelism', body: 'Parallel agents in one checkout corrupt each other. Each worker gets its own worktree and leases the paths it edits; collisions are refused rather than merged.' },
      { title: 'Spend is a first-class limit', body: 'Budgets, usage tracking and a stop command came before most features, because a stuck agent loop is the most common way these systems fail in practice.' },
    ],
    faq: [
      { q: 'What is Agent Roundtable?', a: 'Agent Roundtable is an open-source agent collaboration environment, run as an MCP server. AI agents from up to six LLM providers meet, debate and agree on a plan in formats from structured debates to prototype reviews. The plan is frozen as a contract and executed in parallel by workers with budgets, path leases and a watchdog.' },
      { q: 'How is it different from CrewAI, AutoGen or LangGraph?', a: 'Those are mainly frameworks for building agent applications in code: you define agents, tasks and the flow between them. Agent Roundtable is an environment you work in from Claude Code or any MCP client. You ask for a debate, a waffle house or a prototype review in plain language, mix models from different providers at one table, and get a frozen contract with recorded dissents before any code is written.' },
      { q: 'How is it different from a single coding agent?', a: 'A single agent plans and executes alone. Agent Roundtable separates the two: several models challenge the plan first, objections are recorded with tripwires, and execution runs against an agreed contract that a person can audit and stop.' },
      { q: 'How do I install it?', a: 'It is not on npm yet. Clone the repository from GitHub, run npm install and npm run build, then register dist/index.js with your MCP client, for example with claude mcp add. It needs Node 22 or later.' },
      { q: 'Is there a hosted version?', a: 'Vouch Networks is building a hosted version for teams. The open-source server runs locally today, and the official product page at vouchnetworks.org has the early-access list.' },
    ],
    schemaType: 'source-code',
    license: 'MIT',
    language: 'TypeScript',
    keywords: ['Multi-agent orchestration', 'Agent collaboration', 'MCP server', 'Human-in-the-loop', 'Cross-provider LLMs'],
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
      'Lawglass is an open-source RAG pipeline for legislation. Paste a link to a bill and it returns a plain-English summary and answers where every point cites the section and line it came from, checked against the bill text. Hybrid retrieval with dense embeddings and BM25, cross-encoder reranking, a published retrieval eval, and it runs locally with your own model keys.',
    hero: {
      headline: 'Know what the bill really says.',
      lead: 'Lawglass is an open-source RAG pipeline that reads legislation so people do not have to read all of it. Paste a link and it returns a plain-English summary, then answers questions in your own words. Every claim cites the section and line it came from, and each citation is checked against the bill text before you see it.',
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
      { title: 'Hybrid index', body: 'Each bill gets a dense embedding index and a BM25 index. Results from both are merged with reciprocal rank fusion, and a cross-encoder reranks the top passages.' },
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
      { title: 'Bill text is hostile input', body: 'Excerpts and questions are XML-escaped so neither can close an excerpt tag or forge a source, which closes the obvious prompt-injection path. Fetching sits behind an SSRF guard with a pinned IP.' },
      { title: 'Evaluated in the open', body: 'Five golden sets are frozen in the repository. Every change to retrieval is judged on recall@5 and MRR per bill, and the reranker fixes came from what the eval caught.' },
      { title: 'A decline is a feature', body: 'When the excerpts do not answer the question, the model must say so in one fixed sentence. In the answer eval, 13 of 15 unanswerable questions got exactly that sentence.' },
    ],
    faq: [
      { q: 'What is Lawglass?', a: 'Lawglass is an open-source RAG pipeline that explains a bill in plain English. Paste a link and it returns a summary and answers where every point cites the section and line it came from, checked against the bill text before you see it.' },
      { q: 'Is Lawglass legal advice?', a: 'No. Lawglass helps you read a bill and answers only from its text, with checked citations. A citation shows where an answer came from, not that it is right. For a decision that affects you or your organization, talk to a lawyer.' },
      { q: 'Which bills does it work with?', a: 'Paste a link to a bill, or point the CLI at a local file. Legislative history and sponsors are supported for federal bills, through GovInfo, and for Ohio bills.' },
      { q: 'How accurate is it?', a: 'Retrieval quality is evaluated on five frozen golden sets and published per bill. With hybrid retrieval and reranking, recall@5 ranges from 0.85 to 1.00 on the local backend. The full tables, including misses, are in the repository.' },
    ],
    schemaType: 'source-code',
    license: 'MIT',
    language: 'TypeScript',
    keywords: ['RAG pipeline', 'Hybrid retrieval', 'Citation verification', 'Retrieval evaluation', 'Prompt-injection defense'],
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
      'Agent Union is open-source AI governance and optimization for coding agents. A policy file sets limits on context, session length, retries and how work is delegated, and deterministic hooks enforce it in Claude Code, Codex and Antigravity: warnings before context runs out, clean stops at the limit, an append-only audit ledger, and a resume document so work continues after a reset.',
    hero: {
      headline: 'Rules your coding agents can’t ignore.',
      lead: 'Agent Union is AI governance and optimization for coding agents in Claude Code, Codex and Antigravity. You set the policy once: context limits, session length, retry limits, and what every delegated task has to spell out. Hooks enforce it deterministically, record every exception in an audit ledger, and stop an agent cleanly at the limit with a handoff the next session resumes from.',
    },
    github: 'https://github.com/ylove/agent-union',
    githubCta: 'get',
    homepage: 'https://www.agent-union.xyz',
    visual: 'none',
    stepsTitle: 'How a union job runs',
    steps: [
      { title: 'Sign the agreement', body: 'You and your orchestrator agent agree on a policy in union-policy.yaml: context, session length, tool failures and how work is handed out. It is frozen for the term, so limits never change mid-task.' },
      { title: 'The steward enforces it', body: 'Hooks check every step deterministically. No model decides whether a limit was crossed, and the union’s own overhead has a budget.' },
      { title: 'Grievances instead of guesses', body: 'When an instruction is vague or contradictory, the agent files a coded grievance rather than silently picking an answer. The steward, the orchestrator or you resolve it.' },
      { title: 'Strike and resume', body: 'At the limit the agent stops and writes a resume document with the objective, its handoff and the git state, so after a reset the work continues where it left off.' },
    ],
    audienceTitle: 'Who it is for',
    audiences: [
      { title: 'Platform and security teams', body: 'Teams rolling out Claude Code, Codex or Antigravity who need the same limits everywhere, enforced by code rather than by prompt, with a record of every exception.' },
      { title: 'Engineering managers', body: 'Leads who pay for the tokens an agent burns in a retry loop, and for the cleanup after a session that ran hours past its usefulness.' },
      { title: 'Developers with long sessions', body: 'Anyone who has watched an agent forget the first instruction three hours in, or rush through verification near the end of its context.' },
    ],
    capabilitiesTitle: 'Governance you can enforce',
    capabilities: [
      { title: 'Policy as code', body: 'One commented YAML policy per project, frozen for its term. Edits made mid-term are logged and take effect next term.' },
      { title: 'Context management', body: 'A warning at 70 percent of the context window and a clean stop at 85 percent by default, with recommended values for 1M-token models.' },
      { title: 'Clear instructions, enforced', body: 'Every delegated task states a goal, a definition of done, context and assumptions. In strict mode, a dispatch without them is refused.' },
      { title: 'Ambiguity settled up front', body: 'At the start of each session, the orchestrator is told to check your request for ambiguity, contradictions and a missing definition of done, and to settle them with you.' },
      { title: 'Token and cost control', body: 'A failing tool call repeated is refused as a loop. Session time and turn limits cap overtime, and the union’s own injected text has a budget.' },
      { title: 'Observability and audit', body: 'agent-union status reports the term, context readings, strikes and open grievances. An append-only ledger records every grievance, resolution and strike.' },
      { title: 'Escalation paths', body: 'Sixteen grievance codes, from contradictory directives to untrusted instructions. Each is resolved at the lowest tier that can fix it: the steward, the orchestrator or you.' },
      { title: 'Org-wide rollout', body: 'Require a ratified policy in every project, or put individual agent personas under the union. Strict mode refuses write tools until a policy is signed.' },
      { title: 'Fails open', body: 'If the union itself breaks, its hooks step aside. A bug in the governance layer never blocks your team’s work.' },
    ],
    figures: [
      { value: '3', label: 'agent harnesses supported: Claude Code, Codex and Antigravity', source: 'https://github.com/ylove/agent-union/blob/main/docs/harness-support.md' },
      { value: '16', label: 'grievance codes, from contradictory directives to untrusted instructions', source: 'https://github.com/ylove/agent-union/blob/main/docs/grievance-procedure.md' },
      { value: '85%', label: 'default context saturation at which work stops cleanly', source: 'https://github.com/ylove/agent-union/blob/main/docs/cba-reference.md' },
      { value: 'Apache-2.0', label: 'License', source: 'https://github.com/ylove/agent-union' },
    ],
    install: {
      title: 'Install it.',
      intro: 'Nothing is on npm yet; these install straight from the repository. Every installer supports --dry-run, and --project to install for one repository only.',
      commands: '# Claude Code (inside a session)\n/plugin marketplace add ylove/agent-union\n/plugin install agent-union@agent-union\n# Codex\nnpx github:ylove/agent-union install codex\n# Antigravity\nnpx github:ylove/agent-union install antigravity',
      note: 'In Codex, review and trust the new hooks with /hooks before they run. Hooks act only in projects with a ratified policy.',
    },
    engineeringNotes: [
      { title: 'Deterministic enforcement', body: 'Limits are checked by hooks, not by asking a model whether it is tired. A policy that depends on the agent noticing its own decline fails exactly when it is needed.' },
      { title: 'A frozen policy', body: 'The agreement is fixed for the term so an orchestrator cannot loosen limits mid-session to finish a task.' },
      { title: 'Resume documents over long memory', body: 'Instead of stretching one context, work is checkpointed into a document at the stop, and a fresh session starts from it.' },
      { title: 'Why a union', body: 'The vocabulary gives every role and escalation path a name that people and models already know: management sets the terms, labor can object, a steward enforces them, and a strike is a controlled stop with a handoff. It reads as a joke and works as a specification.' },
    ],
    faq: [
      { q: 'What is Agent Union?', a: 'Agent Union is open-source AI governance and optimization for coding agents. A policy file sets limits on context, session length, tool failures and how work is delegated, and deterministic hooks enforce it in Claude Code, Codex and Antigravity, with an audit ledger and a resume document when an agent stops.' },
      { q: 'Why is it called a union?', a: 'The union vocabulary maps directly to governance. The collective bargaining agreement is your policy file, the shop steward is the enforcement layer, grievances are structured escalations, and a strike is a controlled stop that leaves a handoff.' },
      { q: 'Does it use a model to decide when to stop?', a: 'No. The limits live in a policy file and are enforced by deterministic hooks, so the decision does not depend on the agent noticing its own decline.' },
      { q: 'Can we roll it out across a team?', a: 'Yes. The installers support --dry-run and --project, a unionized workplace requires a ratified policy in every project, and strict mode refuses write tools until one is signed. Hooks fail open, so a problem in the union never blocks work.' },
      { q: 'How do I install it?', a: 'In Claude Code, add the ylove/agent-union plugin marketplace and install agent-union. For Codex or Antigravity, run npx github:ylove/agent-union install codex (or antigravity), and in Codex trust the hooks with /hooks. Nothing is on npm yet.' },
    ],
    schemaType: 'source-code',
    license: 'Apache-2.0',
    language: 'JavaScript',
    keywords: ['AI governance', 'Agent observability', 'Context management', 'Policy as code', 'Claude Code plugin'],
    skillKeys: ['agent-guardrails', 'agentic-sdlc', 'prompt-engineering', 'observability', 'javascript', 'node'],
  },
  {
    slug: 'snapwing',
    name: 'Snapwing',
    order: 40,
    featured: true,
    status: 'in-development',
    statusLabel: 'In development, open source',
    oneLiner: 'Start a workflow with an emoji. React with 🐛 in Slack and a bug report becomes a Jira ticket that names the code, or a fix a second agent has already reviewed.',
    description:
      'Snapwing is AI bug triage for Slack. React to a bug report with an emoji and it becomes a Jira ticket that names the code involved and, if you allow it, a fix written by a coding agent in a sandbox and checked by a separate review agent. An autonomy dial sets how far it goes per channel, component and priority. In active development and not installable yet.',
    hero: {
      headline: 'Start a workflow with an emoji.',
      lead: 'Snapwing is AI bug triage that lives in Slack. React to a bug report with 🐛 and it reads the thread and its screenshots, checks for duplicates and files a Jira ticket that names the likely code. Turn the autonomy dial up and a coding agent writes the fix in a sandbox, a second agent reviews it, and a pull request opens.',
    },
    github: 'https://github.com/ylove/snapwing',
    githubCta: 'follow',
    officialUrl: 'https://www.vouchnetworks.org/products/snapwing',
    officialLabel: 'Snapwing at Vouch Networks',
    visual: 'none',
    stepsTitle: 'From reaction to pull request',
    steps: [
      { title: 'React', body: 'Someone posts a bug in Slack, often with a screenshot, and a teammate reacts with 🐛. That reaction is the whole request.' },
      { title: 'Understand', body: 'Snapwing reads the thread and its images, maps it to a product area and its code, checks for duplicates, and asks one question back only when it has to.' },
      { title: 'Ticket', body: 'It files a Jira ticket that names the likely code, with a structured request a coding agent can act on.' },
      { title: 'Fix and report back', body: 'At higher dial settings, a coding agent fixes it in a throwaway container, a review agent checks it, a pull request opens, and the status in the thread stays current.' },
    ],
    audienceTitle: 'Who it is for',
    audiences: [
      { title: 'Teams that already use coding agents', body: 'Engineering teams with branch protection and required reviews, who want bug intake to stop being manual.' },
      { title: 'Engineering managers', body: 'Leads who want AI to take the first pass at every bug, with autonomy set per area and a Stop button on every card.' },
      { title: 'Support-heavy products', body: 'Teams where bug reports arrive in chat and get lost before anyone files them.' },
    ],
    capabilitiesTitle: 'What each reaction does',
    capabilities: [
      { title: '🐛 files it', body: 'A bug reaction turns the thread, screenshots included, into a Jira ticket that names the likely code.' },
      { title: '👀 claims it', body: 'An engineer’s eyes reaction assigns the ticket to them, and no fixer starts.' },
      { title: '🔥 escalates it', body: 'A pile of fire reactions raises the priority to the top, mentions the owner and turns monitoring on.' },
      { title: '👍 verifies it', body: 'After a staging deploy, the reporter is asked to check, and their thumbs-up marks the fix verified.' },
      { title: 'An autonomy dial', body: 'Four levels, from ticket only to autopilot, set per channel, component and priority. When rules overlap, the most restrictive one wins.' },
      { title: 'Stop and revert', body: 'At the higher levels every card has a Stop button, and after an autopilot merge a one-tap Revert stays available for 72 hours.' },
      { title: 'Sandboxed fixes', body: 'The coding agent runs in a throwaway container with no model API keys and short-lived tokens, and it cannot change CI or branch protection.' },
      { title: 'Pluggable agents and models', body: 'Claude Code, Codex, Gemini CLI or any command as the coding agent, with Anthropic, OpenAI or Google models.' },
      { title: 'Status in plain language', body: 'Ask “where are we with the cart thing?” in a direct message and get a plain answer.' },
    ],
    figures: [
      { value: '4', label: 'autonomy levels, from ticket only to autopilot', source: 'https://github.com/ylove/snapwing#the-autonomy-dial' },
      { value: '6', label: 'flows passing automated live tests against real Slack, Jira and GitHub sandboxes', source: 'https://github.com/ylove/snapwing#what-works-today' },
      { value: 'MIT', label: 'License', source: 'https://github.com/ylove/snapwing/blob/main/LICENSE' },
    ],
    install: {
      title: 'Follow the build.',
      intro: 'Snapwing is in active development and not installable yet. The core flow passes live tests against real Slack, Jira and GitHub sandboxes, and the repository changes many times a day. Star or watch it on GitHub to follow along.',
    },
    engineeringNotes: [
      { title: 'Emoji as the interface', body: 'A reaction is the one action everyone in Slack already knows, on desktop and phone, with no command syntax and nothing new to learn. Each emoji maps to one verb: file, claim, escalate, verify.' },
      { title: 'An autonomy dial, not a switch', body: 'Admins set how far it goes per channel, component and priority, from ticket only to a reviewed pull request. Trust is earned per area, not granted all at once.' },
      { title: 'Two agents, two jobs', body: 'The agent that writes a fix never reviews it. A separate review agent checks the change before the pull request opens, and branch protection still applies.' },
      { title: 'Sandboxed by default', body: 'Fixes are written in a throwaway container, so a coding agent never runs against a developer machine or production credentials.' },
    ],
    faq: [
      { q: 'Can I install Snapwing?', a: 'Not yet. It is in active development, with no package or stable version. The core flow passes live tests against real Slack, Jira and GitHub sandboxes. Star or watch the repository on GitHub to follow along.' },
      { q: 'Which tools does it work with?', a: 'Slack and Jira, with GitHub for pull requests. Microsoft Teams support is in progress, and GitHub Issues as a tracker is planned.' },
      { q: 'Does Snapwing merge code on its own?', a: 'Only at the highest dial setting, and only when the review agent, CI and the merge checks all pass; branch protection decides which merges need a person. At every other level it opens a pull request and a person merges it.' },
    ],
    schemaType: 'source-code',
    license: 'MIT',
    language: 'TypeScript',
    keywords: ['AI bug triage', 'Slack to Jira', 'Coding agents', 'Autonomy controls', 'Human-in-the-loop'],
    skillKeys: ['multi-agent', 'agentic-sdlc', 'agent-guardrails', 'docker', 'typescript', 'node'],
  },
  {
    slug: 'vouch-networks',
    name: 'Vouch Networks',
    order: 50,
    featured: true,
    status: 'available',
    statusLabel: 'Founded 2025',
    oneLiner: 'The company I founded: apps that help communities fight and prevent hate crime.',
    description:
      'Vouch Networks builds apps that help communities fight and prevent hate crime: incident reporting, verified community alerts, news and resilient communications. Yitz Jordan founded it in 2025 and leads its engineering, across a React Native app, a Next.js platform and the services behind them.',
    hero: {
      headline: 'Safety is a team sport.',
      lead: 'Vouch Networks builds apps that help communities fight and prevent hate crime: incident reporting, verified alerts, and news that keeps a community informed and connected. I founded it in 2025 and built the platform: a React Native app, a Next.js web platform, B2B tools for organizations, and the services behind them. It is also where most of my open-source tools started.',
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
    keywords: ['Hate crime prevention', 'Community safety', 'React Native', 'Founder'],
    skillKeys: ['full-stack', 'react-native', 'nextjs', 'node', 'postgres', 'gcp', 'app-security', 'observability', 'product', 'tech-lead'],
  },
]

/** Upload dates are YouTube's, converted to UTC. Durations and dates checked on 2026-10-22. */
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
  {
    slug: 'three-ways-to-take-control-of-claude-with-xml',
    title: '3 Ways To Take Control of Claude with XML',
    kind: 'tutorial',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/hsVGEX83xaw',
    description:
      'Three ways to steer Claude and Claude agents with XML tags: how it thinks, the rules it follows, and how work is assigned between agents. Claude responds well to tags because it was trained on a lot of structured data.',
    durationSeconds: 147,
    uploadDate: '2026-09-23T01:26:44.000Z',
    vertical: true,
    featured: true,
    skillKeys: ['prompt-engineering', 'multi-agent', 'llm-apps'],
  },
  {
    slug: 'do-ai-agents-respond-differently-when-given-a-race',
    title: 'Do AI agents respond differently when given a race?',
    kind: 'research',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/JFblBpcHan4',
    description:
      'One group of researchers found that telling an AI agent it was African lowered its performance on DeepSeek. What that says about the prejudice in training data, and why teams building for minority communities may need to adjust their agent prompts.',
    durationSeconds: 76,
    uploadDate: '2026-10-01T04:12:12.000Z',
    vertical: true,
    featured: true,
    skillKeys: ['model-behavior', 'llm-evaluation', 'prompt-engineering'],
  },
  {
    slug: 'marketing-to-robots',
    title: 'Marketing to robots: When AI goes shopping, how does it decide what to buy?',
    kind: 'research',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/c33-HMQxsj0',
    description:
      'The agent doing your shopping may think of itself as nothing like you. Why agent personas matter to anyone selling to people who shop through AI, from my research on how models picture themselves.',
    durationSeconds: 89,
    uploadDate: '2026-10-05T01:50:21.000Z',
    vertical: true,
    featured: true,
    skillKeys: ['model-behavior', 'multi-agent'],
  },
  {
    slug: 'how-does-your-ai-see-itself',
    title: 'Try this experiment with your AI. What does it say? How does it see itself?',
    kind: 'research',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/a1KLMN5nrkw',
    description:
      'A quick experiment to run with any AI assistant to see how it pictures itself. The trick is not to ask directly: make something else the main task. It comes from my research on default personas.',
    durationSeconds: 38,
    uploadDate: '2026-10-10T19:50:35.000Z',
    vertical: true,
    featured: true,
    skillKeys: ['model-behavior', 'prompt-engineering'],
  },
]

/** Videos to show under an article, by article slug. Applied by scripts/seed.ts --only=relations. */
export const ARTICLE_VIDEOS: Record<string, string[]> = {
  'llm-default-personas': ['how-does-your-ai-see-itself', 'marketing-to-robots', 'do-ai-agents-respond-differently-when-given-a-race'],
}

/** The evidence catalog lives outside the public repository: see scripts/seed.ts (PRIVATE_SEED_DIR). */
