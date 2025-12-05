<div align="center">
  <h1>{{ name }}</h1>
</div>

<div align="center">
  <p align="center" style="width: 80%; margin: auto">
    <a href="https://github.com/agrawal-rohit/grimoire"><img alt="Made with Grimoire" src="https://img.shields.io/badge/made_with-grimoire-7452A3"></a>
    <img alt="License" src="https://img.shields.io/github/license/{{ authorGitUsername }}/{{ name }}" />
    {{#public}}
    <img alt="Status" src="https://img.shields.io/github/actions/workflow/status/{{ authorGitUsername }}/{{ name }}/ci.yml">
    <img alt="Downloads" src="https://img.shields.io/npm/dt/{{ name }}">
    <img alt="NPM version" src="https://img.shields.io/npm/v/{{ name }}">
    <img alt="NPM bundle size" src="https://img.shields.io/bundlephobia/min/{{ name }}">
    {{/public}}
  </p>
</div>

<br />

_[A package that does...]_

## Table of Contents

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
{{#templateHasPlayground}}
* [Playground](#playground)
{{/templateHasPlayground}}
* [Contributing](#contributing)
* [License](#license)

## Features

_[This package provides so many great features...]_

## Installation

`{{ name }}` can be installed using your favorite package manager.

```bash
$ npm install --save {{ name }}
# or
$ yarn add {{ name }}
# or
$ pnpm add {{ name }}
# or
$ bun add {{ name }}
```

## Usage

_[This package can be used as follows...]_

{{#templateHasPlayground}}
## Playground

Run the local playground to try changes quickly:

```bash
pnpm dev
```

The playground watches the source and reloads on changes.
{{/templateHasPlayground}}

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to report issues, propose changes, and submit pull requests.

## License

[MIT](LICENSE){{#public}} © [{{ authorName }}](https://github.com/{{ authorGitUsername }}){{/public}}
