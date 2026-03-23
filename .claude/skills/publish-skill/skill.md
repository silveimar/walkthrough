---
name: publish-skill
description: Creates a new GitHub repository for a Claude Code skill with proper README and directory structure. Use when you want to package and publish a skill so others can install it. Triggers on "publish skill", "publish this skill", "create skill repo", "package skill", "share this skill".
compatibility: Claude Code CLI. Requires `gh` CLI authenticated with GitHub.
allowed-tools: Bash Read Write Glob Grep Task AskUserQuestion
metadata:
  author: Alexander Opalic
  version: "1.0"
---

# Publish Skill

Package a Claude Code skill into a new GitHub repository with a polished README and proper directory structure — ready for others to install with `npx skills add`.

## Workflow

### Step 1: Gather skill information

Collect everything needed to create the repo. The user may provide this upfront or you may need to ask.

**Required information:**
- **Skill name** — kebab-case repo name (e.g., `walkthrough`, `code-reviewer`)
- **Skill source** — either a path to an existing skill directory or the skill content to package
- **One-line description** — what the skill does in one sentence
- **Detailed description** — 3-5 bullet points of what the skill produces or does
- **Usage examples** — 2-4 example prompts that trigger the skill
- **GitHub visibility** — public (default) or private

If the user points to an existing skill directory (e.g., `.claude/skills/my-skill/`), read the `skill.md` to extract the description, usage triggers, and other metadata automatically. Only ask for what's missing.

If the user describes a skill concept without existing files, ask them to clarify the above before proceeding.

### Step 2: Create the repository structure

Create a new directory at `/Users/alexanderopalic/Projects/mySkills/{skill-name}/` with this structure:

```
{skill-name}/
  README.md
  skills/
    {skill-name}/
      skill.md
      references/          # only if the skill has reference files
        *.md
  examples/                # only if examples are provided
```

**Copy skill files:**
- If the source is an existing skill directory, copy all files from it into `skills/{skill-name}/`
- If the source is provided inline, create the `skill.md` and any reference files

### Step 3: Generate the README

Create a `README.md` following this template. Adapt section content based on the actual skill — do not include sections that don't apply.

```markdown
# {Skill Name}

{One-line description of what the skill does.}

## What it does

{Describe what the skill produces or does:}

- **{Feature 1}** — description
- **{Feature 2}** — description
- **{Feature 3}** — description

## Usage

Trigger the skill with prompts like:

\`\`\`
{example prompt 1}
{example prompt 2}
{example prompt 3}
\`\`\`

{Brief description of what happens when triggered — the workflow steps.}

## Installation

### Quick install

\`\`\`bash
npx skills add https://github.com/alexanderop/{skill-name} --skill {skill-name}
\`\`\`

### Manual install

Copy the `skills/{skill-name}/` directory into your project's `.claude/skills/` folder:

\`\`\`
your-project/
  .claude/
    skills/
      {skill-name}/
        skill.md
\`\`\`

## Structure

\`\`\`
skills/{skill-name}/
  skill.md                      # Main skill definition
  references/                   # Reference files (if any)
\`\`\`

{Brief description of what each key file does.}
```

**README guidelines:**
- Keep it scannable — someone should understand what the skill does in 30 seconds
- Use the same tone as the walkthrough README (direct, practical, no fluff)
- Add an image/screenshot section if the user provides one

### Step 4: Initialize git and publish

Run these commands sequentially:

```bash
cd /Users/alexanderopalic/Projects/mySkills/{skill-name}
git init
git add -A
git commit -m "Initial commit: {skill-name} skill"
gh repo create alexanderop/{skill-name} --public --source=. --push --description "{one-line description}"
```

If the user requested private visibility, use `--private` instead of `--public`.

### Step 5: Report back

Tell the user:
- The repo URL: `https://github.com/alexanderop/{skill-name}`
- The install command: `npx skills add https://github.com/alexanderop/{skill-name} --skill {skill-name}`
- Remind them to add a screenshot/image to the README if they haven't already

## Quality Checklist

Before finishing, verify:
- [ ] `skill.md` has proper frontmatter (name, description, allowed-tools, metadata)
- [ ] README is complete and follows the template
- [ ] Install command in README is correct
- [ ] Directory structure matches the convention
- [ ] Git repo is initialized and pushed to GitHub
- [ ] All files from the source skill are included
- [ ] No secrets or local paths leaked into the repo
