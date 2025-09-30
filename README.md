<h1 align="center">
  <img src="https://cdn.rohit.build/work%3Agrimoire%3Alogo.png" alt="Grimoire" style="width: 40%; margin: auto" />
</h1>

<div align="center">
  <p align="center" style="width: 80%; margin: auto">
    <img alt="Workflow Status" src="https://img.shields.io/github/actions/workflow/status/agrawal-rohit/grimoire/ci.yml">
    <img alt="Coverage" src="https://img.shields.io/codacy/coverage/039fa9ecca5d4927aace0faedc3e24bf">
    <img alt="Downloads" src="https://img.shields.io/npm/dt/grimoire">
    <img alt="Checked with Biome" src="https://img.shields.io/badge/code_style-biome-60a5fa">
    <img alt="License" src="https://img.shields.io/github/license/agrawal-rohit/grimoire" />
  </p>
</div>

<div align="center">
  ✨ An opinionated <strong>book of spells</strong> for modern developers ✨
</div>

<div align="center">
  <sub>
    Developers are the wizards of the 21st century — this is my personal spellbook.
  </sub>
</div>

<br />

## Table of Contents

* [Features](#features)
* [Requirements](#requirements)
* [Usage](#usage)
  * [Installation](#installation)
  * [Branching Strategy](#branching-strategy)
* [Commands](#commands)
  * [`summon <resource>`](#summon-resource)
    * [`package`](#package)
* [Contributing](#contributing)
* [License](#license)

## Features

* Unit testing with [vitest][]
* Commit linting with [commitlint][]
* Pre-commit checks with [husky][]
* Pre-configured package bundling using [tsdown][]
* Fast and disk-efficient dependency management using [pnpm][]
* First class type-safety using [typescript][]
* Code linting and formatting with [biome][]
* Code coverage tracking and static code analysis checks using [codacy][]
* Automatic dependency upgrades using [dependabot]
* Automatic builds, tests, and releases with [github actions][github-actions]
* Automatically generated Readme with badges through [shields.io][shields]
* Automatically generated MIT license with [spdx][spdx-license-list]
* Automatically generated community files _(contribution guidelines, issue templates, and pull request checklists)_
* Version management and package publishing using [semantic release][semantic-release]
* Sensible [templates][] for common use cases encountered in modern development
* Gitflow-inspired [branching strategy][#branching-strategy] for preview and production releases

## Requirements

[Node.js v20+][node]

## Usage

### Installation

The easiest way to run the command is through [npx][]:

```bash
npx grimoire@latest --help
```

## Commands

### <span id="summon-resource"></span>`summon <resource>`

#### <span id="package"></span>`package`

```bash
npx grimoire@latest --help
```

## License

[MIT](LICENSE) © [Rohit Agrawal](https://rohit.build/)

[vitest]: https://vitest.dev/
[commitlint]: https://github.com/marionebl/commitlint
[husky]: https://github.com/typicode/husky
[biome]: https://biomejs.dev/
[codacy]: https://www.codacy.com/
[github-actions]: https://github.com/features/actions
[semantic-release]: https://github.com/semantic-release/semantic-release
[shields]: https://shields.io/
[spdx-license-list]: https://github.com/sindresorhus/spdx-license-list
[templates]: templates/
[typescript]: https://github.com/microsoft/TypeScript
[dependabot]: https://github.com/dependabot
[node]: https://nodejs.org
[tsdown]: https://tsdown.dev/
[pnpm]: https://pnpm.io/
