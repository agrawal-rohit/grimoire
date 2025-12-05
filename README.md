<div align="center">
  <img src="https://cdn.rohit.build/oss/grimoire/logo.png" alt="Grimoire" style="width: 30%; margin: auto" />
</div>

<br />

<div align="center">
  <p align="center" style="width: 80%; margin: auto">
    <img alt="Status" src="https://img.shields.io/github/actions/workflow/status/agrawal-rohit/grimoire/ci.yml">
    <img alt="Coverage" src="https://img.shields.io/codacy/coverage/039fa9ecca5d4927aace0faedc3e24bf">
    <img alt="Downloads" src="https://img.shields.io/npm/dt/grimoire">
    <img alt="Biome" src="https://img.shields.io/badge/code_style-biome-60a5fa">
    <img alt="License" src="https://img.shields.io/github/license/agrawal-rohit/grimoire" />
  </p>
</div>

<div align="center">
  <p>✨ An opinionated <strong>book of spells</strong> for modern developers ✨</p>
</div>

<br />

`grimoire` is a CLI tool that takes care of the common [yak-shaving](https://softwareengineering.stackexchange.com/a/388236) operations in modern software development through opinionated templates and tooling configurations. Building something with code is nothing short of magic, `grimoire` is essentially my personal book of magic spells _(I used to be a try-hard [Wizard101](https://www.wizard101.com/) player back in the day, which should explain all the magic metaphors)_

**Why build `grimoire`?**

I found myself spending a criminal amount of time configuring every new library, monorepo, or microservice with _"just the right tooling setup"_ before I could start writing the logic that really mattered. Add on the fact that different languages serve a particular use-case better than others _(with each language having it's own tooling ecosystem that keeps evolving)_ - the eventual ["choice paralysis"](https://en.wikipedia.org/wiki/Analysis_paralysis) was too annoying to deal with everyday.

## Table of Contents

* [Features](#features)
* [Supported Languages](#supported-languages)
  * [Typescript](#typescript)
* [Usage](#usage)
  * [Requirements](#requirements)
  * [Quickstart](#quickstart)
  * [Spells](#spells)
    * [Summoning](#summoning)
    * [Examples](#examples)
* [Commands Reference](#commands-reference)
  * [`summon <resource>`](#summon-resource)
    * [`package`](#package)
* [Contributing](#contributing)
* [License](#license)

## Features

`grimoire` sets you up with several best practices adopted in modern software development with pre-configured tooling that should cover most use-cases. `grimoire` achieves this through:

* Automatic dependency upgrades using [dependabot][]
* Automatic builds, tests, and releases with [github actions][github-actions]
* Automatically generated Readme with badges through [shields.io][shields]
* Automatically generated MIT license with [spdx][spdx-license-list]
* Automatically generated community files _(contribution guidelines, issue templates, and pull request checklists)_
* A pre-configured [release process](#CONTRIBUTING.md#release-process) for preview and production releases
* Sensible [templates][] for common use cases encountered in modern development

[github-actions]: https://github.com/features/actions
[shields]: https://shields.io/
[spdx-license-list]: https://github.com/sindresorhus/spdx-license-list
[templates]: templates/
[dependabot]: https://github.com/dependabot

## Supported Languages

In addition to the general tooling listed above, `grimoire` also configures language-specific tooling to enable unit testing, type-safety, consistent code linting/formatting, and _much more_. It currently supports the following languages:

### Typescript

Great choice when building for the web _(UI libraries and frameworks for the browser. Can also be a good server-side language when executed in a JS runtime like [node][], [bun][], or [deno][])_.

* Unit testing with [vitest][]
* Commit linting with [commitlint][]
* Pre-commit checks with [husky][]
* Pre-configured package bundling using [tsdown][]
* Fast and disk-efficient dependency management using [pnpm][]
* Type-safety using [typescript][]
* Code linting and formatting with [biome][]
* Automated changelog generation using [git-cliff][]
* Tag-driven releases with version management and package publishing to [npm][]

[vitest]: https://vitest.dev/
[commitlint]: https://github.com/marionebl/commitlint
[husky]: https://github.com/typicode/husky
[biome]: https://biomejs.dev/
[git-cliff]: https://git-cliff.org/
[typescript]: https://github.com/microsoft/TypeScript
[node]: https://nodejs.org
[bun]: https://bun.sh/
[deno]: https://deno.com/
[tsdown]: https://tsdown.dev/
[npm]: https://www.npmjs.com/
[pnpm]: https://pnpm.io/
[npx]: https://www.npmjs.com/package/npx

> [!NOTE]
> Support for other languages is still in the works

## Usage

### Requirements

[Node.js v20+][node]

### Quickstart

You can run via [npx][] (no install required):

```bash
npx grimoire@latest --help
```

Or install globally:

```bash
npm i -g grimoire
```

Then run:

```bash
grimoire --help
```

### Spells

#### Summoning

**Summoning** creates a new project from opinionated templates so you can start writing code without worrying about the tooling, tests, and CI. You can summon a resource using the following command:

```bash
npx grimoire@latest summon <resource>
```

The details for summon command and the list of supported resources are provided in the [summoning command reference](#summon-resource).

> [!IMPORTANT]
> Some workflows in the generated projects require repository secrets to be set in the GitHub project _(Settings → Secrets and variables → Actions)_. Make sure to set them to prevent [github action][github-actions] failures before releasing your code out in the world.

`grimoire` uses a simple tag-driven release workflow for stress-free delivery (This same workflow is configured for projects summoned with `grimoire`). See the [release process](CONTRIBUTING.md#release-process) section in [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Examples

#### Create a public NPM package

```bash
npx grimoire@latest summon package \
  --name my-package \
  --lang typescript \
  --template default \
  --public
```

#### Create a private internal Typescript library

```bash
npx grimoire@latest summon package \
  --name internal-utils \
  --lang typescript \
  --template default
```

## Commands Reference

### <span id="summon-resource"></span>`summon <resource>`

API reference for the summon command. For an overview, see [Spells](#spells) → [Summoning](#summoning).

#### <span id="package"></span>`package`

Scaffold a new `package` for one of the [supported languages](#supported-languages) with sensible defaults and development best practices.
If you're new to `grimoire`, I would recommend using the interactive CLI for a guided experience.

```bash
npx grimoire@latest summon package
```

Once you're acquainted, you can skip through most prompts by providing the values through the CLI flags directly.

  ```bash
  npx grimoire@latest summon package \
    --name my-lib \
    --lang typescript \
    --template default \
    --public
  ```

**Supported Flags**

- `--name <project-name>`: Name of the package
- `--lang <language>`: Programming language that the package is built for _(for example, `typescript`)_.
- `--template <template-name>`: The starter template for this package _(for example, `default`, `react`, etc.)_
- `--public`: Whether the package should be optimised for publishing and contributions _(sets up public registry configuration, release workflows, and community files for open-source collaboration)_.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to report issues, propose changes, and submit pull requests.

If you create a project with grimoire, you can show support by adding this badge to your README:

![Made with Grimoire](https://img.shields.io/badge/made_with-grimoire-7452A3)

```html
<a href="https://github.com/agrawal-rohit/grimoire"><img alt="Made with Grimoire" src="https://img.shields.io/badge/made_with-grimoire-7452A3"></a>
```

## License

[MIT](LICENSE) © [Rohit Agrawal](https://rohit.build/)
