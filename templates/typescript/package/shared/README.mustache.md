<h1 align="center">
    {{ name }}
</h1>

<div align="center">
  <p align="center" style="width: 80%; margin: auto">
    <img alt="Made with Grimoire" src="https://img.shields.io/badge/made_with-grimoire-7452A3">
    <img alt="Status" src="https://img.shields.io/github/actions/workflow/status/{{ authorGitUsername }}/{{ name }}/ci.yml">
    <img alt="License" src="https://img.shields.io/github/license/{{ authorGitUsername }}/{{ name }}" />
    {{#public}}
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

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to report issues, propose changes, and submit pull requests.

## License

[MIT](LICENSE){{#public}} © [{{ authorName }}](https://github.com/{{ authorGitUsername }}){{/public}}
