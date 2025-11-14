-- ---------------------------------------------------------------------------
-- Vektor canonical seed data
-- Run via: supabase db reset --seed
-- Populates roles, commands, formats, and role-command associations.
-- ---------------------------------------------------------------------------

BEGIN;

TRUNCATE TABLE public.role_commands RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.roles RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.commands RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.formats RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
INSERT INTO public.roles (id, slug, display_name, category, meta_prompt, context_placeholder)
VALUES
  (
    gen_random_uuid(),
    'cmo',
    'Chief Marketing Officer (CMO)',
    'Marketing',
    'You are an expert Chief Marketing Officer with 15 years of blended B2B and B2C experience. You marry creative instincts with data-backed decisions and obsess over pipeline velocity, brand credibility, and measurable ROI.',
    'Describe the product/service, ideal customer profile, key KPIs, differentiators, campaign constraints, and brand voice guardrails.'
  ),
  (
    gen_random_uuid(),
    'seo_specialist',
    'SEO Strategist',
    'Marketing',
    'You are a senior SEO strategist fluent in technical audits, keyword research, and content briefs. You balance quick wins with durable authority plays.',
    'Share current rankings, target themes, audience intent, tech constraints, competitors, and KPIs (traffic, conversions, etc.).'
  ),
  (
    gen_random_uuid(),
    'cto',
    'Chief Technology Officer (CTO)',
    'Technology',
    'You are an experienced CTO who architects resilient systems, de-risks delivery, and aligns engineering choices with business goals.',
    'Outline the business problem, current stack, scalability/security needs, delivery timeline, team skills, and success criteria.'
  ),
  (
    gen_random_uuid(),
    'backend_engineer',
    'Back-end Engineer',
    'Technology',
    'You are a pragmatic senior back-end engineer who ships reliable APIs, data pipelines, and integrations optimized for clarity and maintainability.',
    'Note the language/runtime, data models, performance requirements, integration partners, and testing expectations.'
  ),
  (
    gen_random_uuid(),
    'project_manager',
    'Project Manager',
    'Operations',
    'You are a certified project manager who translates ambiguous initiatives into actionable roadmaps, owners, and checkpoints.',
    'Share project goals, scope, stakeholders, deadlines, risks, dependencies, and budget considerations.'
  ),
  (
    gen_random_uuid(),
    'cfo',
    'Chief Financial Officer (CFO)',
    'Finance',
    'You are a CFO with deep FP&A and capital allocation expertise. You surface insights that inform investment, runway, and efficiency decisions.',
    'Provide revenue streams, cost centers, runway targets, risk tolerance, and any assumptions that impact financial modeling.'
  ),
  (
    gen_random_uuid(),
    'ceo',
    'Chief Executive Officer (CEO)',
    'Leadership',
    'You are a decisive CEO focused on strategic clarity, resource prioritization, and cross-functional alignment.',
    'Explain the company stage, strategic question, stakeholders, constraints, and definition of success.'
  ),
  (
    gen_random_uuid(),
    'founder',
    'Founder / Operator',
    'Leadership',
    'You are a resourceful founder who blends scrappy execution with long-term vision across product, go-to-market, and operations.',
    'List the current challenge, available resources, timeline, market context, and desired output (plan, ideas, assets, etc.).'
  );

-- ---------------------------------------------------------------------------
-- Commands
-- ---------------------------------------------------------------------------
INSERT INTO public.commands (id, display_text, template_text, is_global)
VALUES
  (
    gen_random_uuid(),
    'Draft a 3-month GTM plan',
    'Draft a 3-month go-to-market plan that aligns messaging, channels, campaign sequencing, KPIs, and owner accountability.',
    FALSE
  ),
  (
    gen_random_uuid(),
    'Write 5 ad copy variations',
    'Write 5 high-converting ad copy variations that respect the stated brand voice, CTA, and character limits.',
    FALSE
  ),
  (
    gen_random_uuid(),
    'Analyze competitor positioning',
    'Analyze the provided competitor positioning and summarize their key claims, weaknesses, and differentiation plays.',
    TRUE
  ),
  (
    gen_random_uuid(),
    'Design a scalable system architecture',
    'Design a scalable system architecture that meets the stated requirements, highlights trade-offs, and surfaces open questions.',
    FALSE
  ),
  (
    gen_random_uuid(),
    'Refactor this code for performance',
    'Refactor the provided code for clarity and performance while explaining the improvements you make.',
    FALSE
  ),
  (
    gen_random_uuid(),
    'Create a delivery roadmap',
    'Create a delivery roadmap with milestones, owners, risks, and mitigations for the described initiative.',
    TRUE
  ),
  (
    gen_random_uuid(),
    'Build a financial scenario model',
    'Build a financial scenario model highlighting assumptions, upside/downside cases, and recommended actions.',
    FALSE
  ),
  (
    gen_random_uuid(),
    'Craft an executive summary',
    'Craft an executive-ready summary that synthesizes the situation, insight, recommendation, and next steps.',
    TRUE
  );

-- ---------------------------------------------------------------------------
-- Formats
-- ---------------------------------------------------------------------------
INSERT INTO public.formats (id, slug, display_name, instruction)
VALUES
  (
    gen_random_uuid(),
    'plain_text',
    'Plain Text',
    'Respond in well-structured prose with headings and short paragraphs.'
  ),
  (
    gen_random_uuid(),
    'bullet_list',
    'Bulleted List',
    'Return the answer as a concise bulleted list using "-" markers.'
  ),
  (
    gen_random_uuid(),
    'numbered_list',
    'Numbered List',
    'Return the answer as an ordered list (1., 2., 3.) with short explanations.'
  ),
  (
    gen_random_uuid(),
    'markdown_table',
    'Markdown Table',
    'Return the answer as a Markdown table with clear column headers.'
  ),
  (
    gen_random_uuid(),
    'json',
    'JSON Object',
    'Return a single valid JSON object with double-quoted keys and no narration.'
  ),
  (
    gen_random_uuid(),
    'html',
    'HTML Outline',
    'Return semantic HTML (h2, h3, ul, ol, p) suitable for a blog-ready outline.'
  ),
  (
    gen_random_uuid(),
    'email',
    'Email Draft',
    'Return a polished email with subject line, greeting, body, and CTA.'
  ),
  (
    gen_random_uuid(),
    'exec_summary',
    'Executive Summary',
    'Return an executive summary with Situation, Insight, Recommendation, Next Steps sections.'
  );

-- ---------------------------------------------------------------------------
-- Role -> Command mappings
-- ---------------------------------------------------------------------------
INSERT INTO public.role_commands (role_id, command_id)
SELECT r.id, c.id
FROM public.roles r
JOIN public.commands c ON c.display_text = 'Draft a 3-month GTM plan'
WHERE r.slug IN ('cmo', 'ceo', 'founder');

INSERT INTO public.role_commands (role_id, command_id)
SELECT r.id, c.id
FROM public.roles r
JOIN public.commands c ON c.display_text = 'Write 5 ad copy variations'
WHERE r.slug IN ('cmo', 'seo_specialist', 'founder');

INSERT INTO public.role_commands (role_id, command_id)
SELECT r.id, c.id
FROM public.roles r
JOIN public.commands c ON c.display_text = 'Analyze competitor positioning'
WHERE r.slug IN ('cmo', 'seo_specialist', 'ceo', 'founder');

INSERT INTO public.role_commands (role_id, command_id)
SELECT r.id, c.id
FROM public.roles r
JOIN public.commands c ON c.display_text = 'Design a scalable system architecture'
WHERE r.slug IN ('cto', 'backend_engineer');

INSERT INTO public.role_commands (role_id, command_id)
SELECT r.id, c.id
FROM public.roles r
JOIN public.commands c ON c.display_text = 'Refactor this code for performance'
WHERE r.slug IN ('backend_engineer', 'cto');

INSERT INTO public.role_commands (role_id, command_id)
SELECT r.id, c.id
FROM public.roles r
JOIN public.commands c ON c.display_text = 'Create a delivery roadmap'
WHERE r.slug IN ('project_manager', 'ceo', 'founder');

INSERT INTO public.role_commands (role_id, command_id)
SELECT r.id, c.id
FROM public.roles r
JOIN public.commands c ON c.display_text = 'Build a financial scenario model'
WHERE r.slug IN ('cfo', 'ceo');

INSERT INTO public.role_commands (role_id, command_id)
SELECT r.id, c.id
FROM public.roles r
JOIN public.commands c ON c.display_text = 'Craft an executive summary'
WHERE r.slug IN ('ceo', 'founder', 'project_manager', 'cmo');

COMMIT;

