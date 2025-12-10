<div align="center">
  <h1>{{ name }}</h1>
</div>

<div align="center">
  <p align="center" style="width: 80%; margin: auto">
    <a href="https://github.com/agrawal-rohit/grimoire"><img alt="Made with Grimoire" src="https://img.shields.io/badge/made_with-grimoire-7452A3"></a>
    {{#public}}
    <img alt="Status" src="https://img.shields.io/github/actions/workflow/status/{{ authorGitUsername }}/{{ name }}/ci.yml">
    <img alt="Downloads" src="https://img.shields.io/npm/dt/{{ name }}">
    <img alt="NPM version" src="https://img.shields.io/npm/v/{{ name }}">
    <img alt="NPM bundle size" src="https://img.shields.io/bundlephobia/min/{{ name }}">
    {{/public}}
    <img alt="License" src="https://img.shields.io/github/license/{{ authorGitUsername }}/{{ name }}" />
  </p>

[Installation](#installation) • {{#public}}[Demo](#demo) • {{/public}}[Usage](#usage) • [Contributing](#contributing) • [License](#license)

</div>

<br />

_[A package that does...]_

## Installation

`{{ name }}` can be installed using [npm](https://www.npmjs.com/) (or your favorite package manager):

```bash
$ npm install {{ name }}
```

{{#public}}
## Demo

_[Images, videos, or interactive demo links...]_

{{/public}}
## Usage

_[This package can be used as follows...]_


## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to report issues, propose changes, and submit pull requests.

## License

[MIT](LICENSE){{#public}} © [{{ authorName }}](https://github.com/{{ authorGitUsername }}){{/public}}
