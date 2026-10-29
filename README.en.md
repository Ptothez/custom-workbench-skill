# Build a Workbench for Your Work

[简体中文](README.md) | [English](README.en.md)

Have several projects and conversations, and want to see where things stand and what to do next? This skill helps your AI turn scattered files and business records into a workbench you can browse, navigate, and update.

It starts with your existing projects and records, then designs pages, connects data, and checks the result against real tasks. It can also improve an existing workbench: navigation, tasks, or access to business administration pages. It is not a ready-made desktop application. Your AI must implement it in your environment.


When feedback should guide future work, preserve the original comments, record what was done, and validate reusable rules before activating them. Do not copy the author's projects, personal layout, or preferences.

## Install

```bash
npx -y skills add Ptothez/custom-workbench-skill -g --all
```

Then ask:

> Build a workbench showing the current progress of my projects, the most important next steps, and links to continue the work.

Provide existing files or system entry points. The AI should read available material first and ask only about gaps that affect the design.

## What It Does

- Establish what you need to see, where records come from, and who updates them.
- Design around actual projects rather than forcing every task into one template.
- Show concrete next actions with working entry points.
- Check navigation, parent-page returns, old links, and mobile layouts.
- Test whether the displayed progress matches real business cases.

Updates must be implemented for your environment. Installing the skill does not automatically synchronize chats or create background jobs. External accounts should only be connected with your authorization.

## Development Checks

Requires a Skills-capable AI client. Examples and validation scripts use Node.js; the application can use your existing technology stack. Current version: 1.3.0.

```bash
node skills/custom-workbench/scripts/test-validate-workbench-spec.mjs
node skills/custom-workbench/scripts/test-decision-contract.mjs
node skills/custom-workbench/scripts/test-navigation-contract.mjs
```

These checks validate configuration and rules. An implemented workbench still needs real data, interaction checks, and visual inspection. This repository contains no author's private business data.

## License

MIT; see [LICENSE](LICENSE).
