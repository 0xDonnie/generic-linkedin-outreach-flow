# Project-local Claude Code skills

Skills in this folder are loaded by Claude Code when the user opens this repo. They make Claude precise on project-specific workflows.

## Available skills

| File | Triggers on |
|---|---|
| [`kpi-dashboard/SKILL.md`](./kpi-dashboard/SKILL.md) | "come va?", "dashboard", "mostra KPI", "quanti invii oggi?", warmup/accept-rate questions, Metabase start/stop |

## How Claude Code picks up these skills

Claude Code reads skills from `.claude/skills/` at the project root. So after cloning this repo:

```powershell
# One-time, from project root
Copy-Item -Recurse skills .claude\skills    # or use a symlink if you prefer
```

(On macOS/Linux: `cp -r skills .claude/skills/` or `ln -s $(pwd)/skills .claude/skills`.)

**Why `skills/` and not directly `.claude/skills/`?** The authoring machine's sandbox blocks writes into `.claude/` (it's where Claude Code keeps user-level preferences). This repo ships them under `skills/` and the user adopts them with one copy command. Claude Code picks them up on next startup.

If you ever modify a skill — edit it in `skills/` and re-run the copy. Or just work directly inside `.claude/skills/` once it exists and forget this whole directory.

## Writing new skills

Front-matter shape:

```markdown
---
name: kebab-case-name
description: What the skill is about + phrases/topics that should trigger it. Claude uses this to decide when to load the skill — be specific about triggers.
---

# Skill body in Markdown

Instructions for Claude when this skill is active.
```

Keep skills **focused on one concern**. A skill that tries to do 4 things will be loaded less reliably than 4 skills each doing one thing.
