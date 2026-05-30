import type { AnalyzeResponse, DiagramResponse, SuggestionsResponse } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseOwnerRepo(url: string): { owner: string; repo: string } {
  try {
    const u = new URL(url);
    const [, owner, repo] = u.pathname.split('/');
    return { owner: owner ?? 'unknown', repo: repo ?? 'unknown' };
  } catch {
    return { owner: 'unknown', repo: 'unknown' };
  }
}

// ─── Per-repo mock profiles ───────────────────────────────────────────────────

interface MockProfile {
  stack: AnalyzeResponse['stack'];
  summary: string;
  modules: AnalyzeResponse['modules'];
  entry_points: string[];
  request_flow: string;
  mermaid: string;
  suggestions: SuggestionsResponse['suggestions'];
}

const PROFILES: Record<string, MockProfile> = {
  'tiangolo/fastapi': {
    stack: {
      languages: ['Python'],
      frameworks: ['FastAPI', 'Starlette', 'Pydantic'],
      databases: ['SQLAlchemy (optional)'],
      infra: ['Docker', 'GitHub Actions'],
      test_frameworks: ['pytest'],
      package_manager: 'pip',
    },
    summary:
      'FastAPI is a modern, high-performance Python web framework for building APIs with automatic OpenAPI and JSON Schema documentation. It is built on top of Starlette for the web layer and Pydantic for data validation, achieving one of the fastest Python benchmarks available.',
    modules: [
      { name: 'fastapi',      path: 'fastapi/',          description: 'Core framework package — routing, dependency injection, and app lifecycle.' },
      { name: 'routing',      path: 'fastapi/routing.py', description: 'APIRouter class that groups path operations and mounts sub-applications.' },
      { name: 'params',       path: 'fastapi/params.py',  description: 'Declarative request parameter definitions: Query, Path, Body, Header, Cookie.' },
      { name: 'security',     path: 'fastapi/security/',  description: 'OAuth2, HTTP Basic, API Key authentication scheme helpers.' },
      { name: 'middleware',   path: 'fastapi/middleware/', description: 'CORS, GZip, HTTPS-redirect, and trusted-host middleware integrations.' },
      { name: 'testclient',   path: 'fastapi/testclient.py', description: 'Synchronous test client wrapping httpx for pytest integration.' },
    ],
    entry_points: ['fastapi/__init__.py', 'fastapi/applications.py'],
    request_flow: 'HTTP request → Starlette ASGI → FastAPI router → dependency injection → path operation → Pydantic validation → response serialization',
    mermaid: `graph TD
  Client[HTTP Client]
  ASGI[Starlette ASGI Layer]
  Router[FastAPI Router]
  DI[Dependency Injection]
  Handler[Path Operation Handler]
  Pydantic[Pydantic Validation]
  Response[JSON Response]
  Client --> ASGI
  ASGI --> Router
  Router --> DI
  DI --> Handler
  Handler --> Pydantic
  Pydantic --> Response`,
    suggestions: [
      { category: 'performance',  severity: 'medium', title: 'Enable response model caching',        detail: 'Repeated Pydantic serialization of the same model shapes can be cached with response_model_include/exclude.',          file_hint: 'fastapi/routing.py' },
      { category: 'security',     severity: 'high',   title: 'Audit default CORS policy',            detail: 'CORSMiddleware defaults allow all origins when misconfigured. Verify allow_origins is explicitly set in production.',  file_hint: 'fastapi/middleware/cors.py' },
      { category: 'quality',      severity: 'medium', title: 'Add type stubs for untyped internals', detail: 'Several internal helpers lack full typing coverage, reducing IDE support for downstream users.',                        file_hint: 'fastapi/_compat.py' },
      { category: 'scalability',  severity: 'low',    title: 'Document BackgroundTasks limits',      detail: 'BackgroundTasks run in-process on the same event loop. Heavy tasks should be offloaded to a task queue like Celery.', file_hint: 'fastapi/background.py' },
      { category: 'quality',      severity: 'low',    title: 'Expand exception handler examples',    detail: 'HTTPException and RequestValidationError handlers are not demonstrated in the main README, only in docs site.',         file_hint: 'README.md' },
    ],
  },

  'vercel/next.js': {
    stack: {
      languages: ['TypeScript', 'JavaScript'],
      frameworks: ['Next.js', 'React', 'Turbopack'],
      databases: [],
      infra: ['Vercel', 'Docker', 'GitHub Actions'],
      test_frameworks: ['Jest', 'Playwright'],
      package_manager: 'pnpm',
    },
    summary:
      'Next.js is a React framework for building full-stack web applications. It provides file-system-based routing, server and client components, server actions, built-in image/font optimisation, and both static and dynamic rendering strategies.',
    modules: [
      { name: 'packages/next',     path: 'packages/next/',       description: 'Core Next.js runtime — server, client, and build pipeline.' },
      { name: 'app-router',        path: 'packages/next/src/server/app-render/', description: 'App Router rendering engine, RSC streaming, and Suspense boundaries.' },
      { name: 'turbopack',         path: 'packages/next/src/build/swc/',          description: 'Turbopack integration layer and SWC transform bindings.' },
      { name: 'image-component',   path: 'packages/next/src/client/image.tsx',    description: 'Optimised <Image> component with lazy loading and WebP conversion.' },
      { name: 'server-actions',    path: 'packages/next/src/server/app-render/action-handler.ts', description: 'Server Actions handler, form mutation pipeline, and revalidation.' },
    ],
    entry_points: ['packages/next/src/server/next.ts', 'packages/next/src/cli/next-dev.ts'],
    request_flow: 'Browser → Vercel Edge Network → Next.js server → App Router → React Server Components → Streaming HTML → Client hydration',
    mermaid: `graph TD
  Browser[Browser]
  Edge[Edge Network / CDN]
  NextServer[Next.js Server]
  AppRouter[App Router]
  RSC[React Server Components]
  ClientBundle[Client Bundle]
  Browser --> Edge
  Edge --> NextServer
  NextServer --> AppRouter
  AppRouter --> RSC
  RSC --> ClientBundle
  ClientBundle --> Browser`,
    suggestions: [
      { category: 'performance',  severity: 'high',   title: 'Turbopack still opt-in for production', detail: 'Turbopack is stable for dev but not yet default for production builds. Teams should test bundle output before switching.', file_hint: 'packages/next/src/build/index.ts' },
      { category: 'security',     severity: 'medium', title: 'Server Action CSRF surface',             detail: 'Server Actions are protected by SameSite cookies but external forms can still attempt requests. Add origin validation.',    file_hint: 'packages/next/src/server/app-render/action-handler.ts' },
      { category: 'scalability',  severity: 'medium', title: 'ISR revalidation stampede',              detail: 'Many simultaneous stale requests trigger concurrent revalidation. A singleflight pattern would reduce origin load.',         file_hint: 'packages/next/src/server/lib/incremental-cache/' },
      { category: 'quality',      severity: 'low',    title: 'Deprecate pages/api in favour of route handlers', detail: 'pages/api is still supported but route handlers in the App Router are the recommended pattern going forward.' },
    ],
  },

  'expressjs/express': {
    stack: {
      languages: ['JavaScript'],
      frameworks: ['Express'],
      databases: [],
      infra: ['npm', 'GitHub Actions'],
      test_frameworks: ['Mocha', 'Supertest'],
      package_manager: 'npm',
    },
    summary:
      'Express is a minimal, unopinionated Node.js web framework. It provides a thin layer over Node\'s http module with routing, middleware composition, and request/response helpers — deliberately leaving architecture decisions to the consumer.',
    modules: [
      { name: 'lib/application', path: 'lib/application.js', description: 'The Express app object — settings, mounting, and HTTP verb methods.' },
      { name: 'lib/router',      path: 'lib/router/',        description: 'Core routing engine — Route and Layer classes, middleware stack traversal.' },
      { name: 'lib/request',     path: 'lib/request.js',     description: 'Extended IncomingMessage with helpers: params, query, body, ip, accepts.' },
      { name: 'lib/response',    path: 'lib/response.js',    description: 'Extended ServerResponse with send, json, redirect, render, cookie, download.' },
      { name: 'lib/middleware',  path: 'lib/middleware/',    description: 'Built-in middleware: init (attach req.app) and query (parse query string).' },
    ],
    entry_points: ['lib/express.js', 'index.js'],
    request_flow: 'HTTP request → Node http.Server → Express app → global middleware stack → Router → matched Route → route-level middleware → handler → res.send()',
    mermaid: `graph TD
  HTTP[HTTP Request]
  NodeServer[Node http.Server]
  App[Express Application]
  GlobalMW[Global Middleware Stack]
  Router[Express Router]
  Route[Matched Route]
  Handler[Route Handler]
  Response[HTTP Response]
  HTTP --> NodeServer
  NodeServer --> App
  App --> GlobalMW
  GlobalMW --> Router
  Router --> Route
  Route --> Handler
  Handler --> Response`,
    suggestions: [
      { category: 'security',    severity: 'high',   title: 'Add helmet.js security headers',   detail: 'Express sets no security headers by default. helmet() adds CSP, HSTS, X-Frame-Options, and 10+ other protections with one line.', file_hint: 'lib/application.js' },
      { category: 'security',    severity: 'high',   title: 'Enable rate limiting',              detail: 'No rate limiting is included. express-rate-limit should be applied globally or per-route before public deployment.',               file_hint: 'lib/router/index.js' },
      { category: 'performance', severity: 'medium', title: 'Compress responses',                detail: 'The compression middleware is not bundled. Gzip/Brotli via the compression package significantly reduces transfer sizes.',          file_hint: 'lib/application.js' },
      { category: 'quality',     severity: 'medium', title: 'Migrate to ES modules',             detail: 'Express 4 uses CommonJS. Express 5 (RC) still uses CJS. A dual ESM/CJS build would improve tree-shaking and modern toolchain compat.' },
      { category: 'scalability', severity: 'low',    title: 'Document cluster usage',            detail: 'Express is single-threaded per process. The README does not explain Node cluster or PM2 usage for multi-core production deployments.' },
    ],
  },
};

// ─── Default fallback for any unknown repo ───────────────────────────────────

function buildGenericProfile(owner: string, repo: string): MockProfile {
  return {
    stack: {
      languages: ['TypeScript', 'Python'],
      frameworks: ['Express', 'FastAPI'],
      databases: ['PostgreSQL', 'Redis'],
      infra: ['Docker', 'GitHub Actions'],
      test_frameworks: ['Jest', 'pytest'],
      package_manager: 'npm',
    },
    summary: `${owner}/${repo} is a full-stack web application. The repository contains a TypeScript frontend and Python backend communicating over a REST API, with PostgreSQL for persistent storage and Redis for caching and session management.`,
    modules: [
      { name: 'api',       path: 'src/api/',      description: 'REST API route definitions and controller logic.' },
      { name: 'services',  path: 'src/services/', description: 'Business logic layer, decoupled from HTTP transport.' },
      { name: 'models',    path: 'src/models/',   description: 'Database models and ORM schema definitions.' },
      { name: 'auth',      path: 'src/auth/',     description: 'Authentication middleware, JWT helpers, and session management.' },
      { name: 'utils',     path: 'src/utils/',    description: 'Shared helper functions, validation, and formatting utilities.' },
      { name: 'config',    path: 'src/config/',   description: 'Environment variable loading and application configuration.' },
    ],
    entry_points: ['src/index.ts', 'src/app.ts', 'main.py'],
    request_flow: 'HTTP request → API Gateway → Auth middleware → Route handler → Service layer → ORM → PostgreSQL',
    mermaid: `graph TD
  Client[Client]
  Gateway[API Gateway]
  Auth[Auth Middleware]
  Router[Route Handler]
  Service[Service Layer]
  ORM[ORM / Query Builder]
  DB[(PostgreSQL)]
  Cache[(Redis Cache)]
  Client --> Gateway
  Gateway --> Auth
  Auth --> Router
  Router --> Service
  Service --> ORM
  Service --> Cache
  ORM --> DB`,
    suggestions: [
      { category: 'security',    severity: 'high',   title: 'Enable rate limiting',            detail: 'No rate limiting detected. Apply per-IP throttling at the API gateway or application layer before deployment.',           file_hint: 'src/api/index.ts' },
      { category: 'security',    severity: 'high',   title: 'Verify CORS configuration',       detail: 'Ensure allow_origins is not set to * in production and reflects only expected frontend domains.',                       file_hint: 'src/app.ts' },
      { category: 'performance', severity: 'medium', title: 'Add database connection pooling',  detail: 'Verify that your ORM is configured with a connection pool (pool_size, max_overflow) to handle concurrent requests.',    file_hint: 'src/config/database.ts' },
      { category: 'performance', severity: 'medium', title: 'Cache frequently-read endpoints',  detail: 'Redis is present but caching strategy is not evident. Add short TTL caching for read-heavy, rarely-changing endpoints.' },
      { category: 'quality',     severity: 'medium', title: 'No tests detected',               detail: 'No test framework configuration found. Add unit tests for service layer and integration tests for critical API routes.' },
      { category: 'scalability', severity: 'low',    title: 'Consider horizontal scaling plan', detail: 'Ensure session state is externalised to Redis (not in-memory) so multiple instances can be run behind a load balancer.' },
    ],
  };
}

// ─── Public mock API ─────────────────────────────────────────────────────────

export function getMockAnalyze(repoUrl: string): AnalyzeResponse {
  const { owner, repo } = parseOwnerRepo(repoUrl);
  const key = `${owner}/${repo}`;
  const profile = PROFILES[key] ?? buildGenericProfile(owner, repo);

  return {
    repo_name: key,
    stack: profile.stack,
    summary: profile.summary,
    modules: profile.modules,
    entry_points: profile.entry_points,
    request_flow: profile.request_flow,
    ai_used: false,
  };
}

export function getMockDiagram(repoUrl: string): DiagramResponse {
  const { owner, repo } = parseOwnerRepo(repoUrl);
  const key = `${owner}/${repo}`;
  const profile = PROFILES[key] ?? buildGenericProfile(owner, repo);

  // Build nodes/edges from the mermaid string using a simple inline parse
  // (avoids circular dep with mermaid-to-flow which imports DiagramNode)
  const mermaid = profile.mermaid;
  const nodeMap = new Map<string, string>();
  const rawEdges: Array<{ source: string; target: string }> = [];

  const edgeRegex = /^\s*(\w+)(?:\[([^\]]*)\])?\s*--[->]+\s*(\w+)(?:\[([^\]]*)\])?/;
  for (const line of mermaid.split('\n')) {
    const m = line.match(edgeRegex);
    if (!m) continue;
    const [, sid, slabel, tid, tlabel] = m;
    if (!nodeMap.has(sid)) nodeMap.set(sid, slabel ?? sid);
    if (!nodeMap.has(tid)) nodeMap.set(tid, tlabel ?? tid);
    rawEdges.push({ source: sid, target: tid });
  }

  const ids = Array.from(nodeMap.keys());
  const ROW_H = 120;
  const CENTER_X = 300;
  const useColumns = ids.length > 6;
  const COL_X = [180, 480];

  const nodes = ids.map((id, i) => ({
    id,
    label: nodeMap.get(id)!,
    type: 'editableNode',
    position: useColumns
      ? { x: COL_X[i % 2], y: Math.floor(i / 2) * ROW_H + 50 }
      : { x: CENTER_X, y: i * ROW_H + 50 },
  }));

  const edges = rawEdges.map((e, i) => ({
    id: `e-${i}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
  }));

  return { mermaid_source: mermaid, nodes, edges, ai_used: false };
}

export function getMockSuggestions(repoUrl: string): SuggestionsResponse {
  const { owner, repo } = parseOwnerRepo(repoUrl);
  const key = `${owner}/${repo}`;
  const profile = PROFILES[key] ?? buildGenericProfile(owner, repo);
  return { suggestions: profile.suggestions, ai_used: false };
}
