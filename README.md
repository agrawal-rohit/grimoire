# NPM Library Template

This template is designed to get you setup with best practices and integrated tools for your new NPM library, so you can just focus on shipping some awesome code!

# TO DO

- [x] Semantic-release integration
- [x] Add commit linting
- [x] Add husky pre-commit hooks
- [x] Add Github actions workflow
- [x] Add NVM
- [x] Add biome linting and formatting
- [x] Add CONTRIBUTING
- [x] Add LICENSE
- [ ] Update README
- [ ] Add tests
- [x] Add issue template
- [x] Add PR template
- [x] Add Dependabot management
- [ ] Make the branch rulesets as a copy-able JSON

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Preparation](#preparation)
  - [Initialization](#initialization)
  - [CI/CD Setup](#cicd-setup)
  - [Making Commits](#making-commits)
- [How to Contribute](#how-to-contribute)
- [License](#license)

## Features

This template includes a variety of features to streamline your development and deployment process and ensure high-quality code:

- :rocket: **Automated Releases**: CHANGELOG generation and release management with [semantic-release](https://github.com/semantic-release/semantic-release) for better efficiency.
- :deciduous_tree: **Release Lifecycle Branches**: The template is pre-configured with the following branches, each serving a specific purpose in the release lifecycle:
  - `main`: This is the production release branch. Any changes pushed to this branch will trigger a build and publish process, resulting in a new version of the library being published to NPM. This branch should only contain stable, tested code.
  - `beta`: This is the pre-release branch. Changes pushed here will trigger a build and publish process, but the resulting library version will be marked as a beta version on NPM. This allows users to test new features and fixes before they are included in a stable release.
  - `next`: This is the development branch. It's where all the new features, improvements, and fixes are initially pushed. This branch may not always be stable and is used for testing new code before it's merged into the `beta` branch. It's important to note that while this branch is used for development, it should still be kept as stable as possible to facilitate testing and integration.
- :pencil2: **Commit Linting**: Enforced style with [commitizen](https://github.com/commitizen/cz-cli) and [husky pre-commit hooks](https://github.com/typicode/husky) to ensure that all commits follow a consistent style.
- :gear: **CI/CD**: Github Actions workflow that automates the testing, building, and publishing processes, ensuring that your library is always up-to-date and ready for use.
- :book: **TypeScript**: Full [TypeScript](https://github.com/microsoft/TypeScript) integration to provide static typing, making your code more robust and less prone to runtime errors.
- :hammer_and_wrench: **Code Quality**: ESLint, Prettier, and NVM configurations for maintaining a high standard of code quality.
- :scroll: **Documentation**: Auto-generated Code of Conduct, Contributing Guidelines, LICENSE, and README that provide important information for contributors and users of your library.
- :memo: **Issue Templates**: Predefined templates for Bug Reports and Feature Requests that help maintain a consistent structure for issues.
- :shield: **Security**: SAST with [Dependabot](https://github.com/dependabot) for automated security checks to identify and fix security vulnerabilities early in the development process.
- :test_tube: **Testing**: Unit testing setup with [Jest](https://github.com/jestjs/jest) for thorough testing of your code to catch and fix bugs before they reach production.
- :art: **Tailwind CSS Support**: Optional integration with [Tailwind CSS](https://tailwindcss.com/) for React libraries, providing a utility-first CSS framework that can be composed to build any design, directly in your markup.

## Getting Started

### Preparation

To get started, clone this repository and reset the git history, or use this repository as a template to create a new one.

Enable the library's release management by uncommenting the `"publish"` job in the `.github/workflows/Publish.yml` file.

### Initialization

To set up your library, you will need to run the initialization commands provided below. This initialization process is crucial as it sets up the basic structure of your library and installs necessary dependencies. During the initialization process, you will be prompted to provide:

- The library's name as it will appear on NPM. This name should be unique and descriptive, helping users to find your library easily.
- A description for the library. This should be a brief summary of what your library does and its key features.
- Whether the library is a ReactJS library. If it is, additional dependencies and configurations for React will be set up.
- If it's a ReactJS library, whether you want to set up Tailwind CSS configuration. This will add Tailwind CSS support to your React library.

You can initialize your library using your preferred package manager as shown below:

```bash
pnpm install --dev
pnpm run init
pnpm install
```

After running these commands, your library will be set up and ready for development. You can start adding your code in the `src` directory.

### CI/CD Setup

To set up continuous integration and delivery (CI/CD), you will need to configure the following action secrets in your repository settings. These environment variables are crucial for the proper functioning of the CI/CD pipeline and the successful deployment of your library:

- `CODACY_PROJECT_TOKEN`: This token is used for collecting coverage metrics with Codacy. This token can be found in the Codacy project settings under the 'Integrations' tab.
- `NPM_TOKEN`: This token is necessary for publishing your package to NPM. This should be a Classic token with the "Automation" permission.

It is essential to ensure that the GitHub Actions workflow has **'Read and write permissions'** within the repository settings. This permission allows [semantic-release](https://github.com/semantic-release/semantic-release) to add tags and create GitHub releases. You can verify and change this setting by navigating to:

`Repository Settings -> Actions -> General -> Workflow permissions`

### Making Commits

For making commits, I recommend following the conventional commits format since it provides an easy way of parsing the commit log by [semantic-release](https://github.com/semantic-release/semantic-release) for auto-generating the CHANGELOG and the Github release descriptions. To make this process easier, I've included `commitizen` and `cz-conventional-changelog` in the template.

To make a commit, stage your changes and run the following command:

```bash
pnpm run cz
```

This command will start an interactive prompt to generate the commit message. Follow the prompts and provide the necessary information. This will ensure that your commit message follows the conventional commits format.

## How to Contribute

Apes together strong. If you'd like to help out, please read the [Contributing Guide](CONTRIBUTING.md) to get started.

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code as you see fit.
