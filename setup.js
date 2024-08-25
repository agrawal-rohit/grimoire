const fs = require("fs");
const { input, confirm } = require("@inquirer/prompts");
const execSync = require("child_process").execSync;

const getGitUsername = () => {
  try {
    return execSync("git config user.name").toString().trim();
  } catch (error) {
    console.error(
      "Error getting git username. Please ensure git is correctly configured.",
      error
    );
    process.exit(1);
  }
};

const getGitEmail = () => {
  try {
    return execSync("git config user.email").toString().trim();
  } catch (error) {
    console.error(
      "Error getting git email. Please ensure git is correctly configured.",
      error
    );
    process.exit(1);
  }
};

const gitUsername = getGitUsername();
const gitEmail = getGitEmail();

const main = async () => {
  const libraryName = await input({
    message: "Library name (as seen on NPM):",
  });
  const libraryDescription = await input({ message: "Library description:" });
  const isReactLibrary = await confirm({
    message: "Is this a ReactJS library?",
    default: false,
  });

  let includeTailwind = false;
  if (isReactLibrary) {
    includeTailwind = await confirm({
      message: "Include Tailwind CSS configuration?",
      default: false,
    });
  }

  const answers = {
    "library-name": libraryName,
    "library-description": libraryDescription,
    "is-react-library": isReactLibrary,
    "include-tailwind": includeTailwind,
  };

  //* Update package.json
  const packageJsonPath = "./package.json";
  fs.readFile(packageJsonPath, (err, data) => {
    if (err) throw err;
    const packageJson = JSON.parse(data);
    packageJson.name = answers["library-name"];
    packageJson.description = answers["library-description"];
    packageJson.author = `${gitUsername} <${gitEmail}>`;

    if (answers["is-react-library"]) {
      packageJson.peerDependencies = {
        react: ">=18",
        "react-dom": ">=18",
      };

      packageJson.devDependencies["@testing-library/jest-dom"] = "^6.2.0";
      packageJson.devDependencies["@testing-library/react"] = "^14.1.2";
      packageJson.devDependencies["@types/react"] = "^18.2.48";
      packageJson.devDependencies["@types/react-dom"] = "^18.2.18";
      packageJson.devDependencies["eslint-plugin-react"] = "^7.33.2";
      packageJson.devDependencies["eslint-plugin-react-hooks"] = "^4.6.0";
      packageJson.devDependencies.react = "^18.2.0";
      packageJson.devDependencies["react-dom"] = "^18.2.0";

      if (answers["include-tailwind"]) {
        packageJson.devDependencies["tailwindcss"] = "^3.4.10";
        packageJson.devDependencies["postcss"] = "^8.4.41";
        packageJson.devDependencies["autoprefixer"] = "^10.4.20";
      }
    }

    fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      (err) => {
        if (err) throw err;
        console.log("package.json updated successfully.");
      }
    );
  });

  //* Configure Tailwind CSS if selected
  if (answers["is-react-library"] && answers["include-tailwind"]) {
    const tailwindConfigPath = "./tailwind.config.js";
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    fs.writeFile(tailwindConfigPath, tailwindConfig, "utf8", (err) => {
      if (err) throw err;
      console.log("Tailwind CSS configuration created successfully.");
    });

    const postcssConfigPath = "./postcss.config.js";
    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

    fs.writeFile(postcssConfigPath, postcssConfig, "utf8", (err) => {
      if (err) throw err;
      console.log("PostCSS configuration created successfully.");
    });

    // Create a CSS file to import Tailwind
    const cssFilePath = "./src/styles.css";
    const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

    fs.writeFile(cssFilePath, cssContent, "utf8", (err) => {
      if (err) throw err;
      console.log("Tailwind CSS import file created successfully.");
    });
  }

  //* Update Code of Conduct
  const cocPath = "./CODE_OF_CONDUCT.md";
  fs.readFile(cocPath, "utf8", (err, data) => {
    if (err) throw err;
    const updatedData = data.replaceAll("<contact-email>", gitEmail);

    fs.writeFile(cocPath, updatedData, "utf8", (err) => {
      if (err) throw err;
      console.log("Code of Conduct updated successfully.");
    });
  });

  //* Update README
  const readmeTemplatePath = "./README.template.md";
  fs.readFile(readmeTemplatePath, "utf8", (err, data) => {
    if (err) throw err;
    let updatedData = data.replaceAll(
      "<library-name>",
      answers["library-name"]
    );
    updatedData = updatedData.replaceAll(
      "<library-description>",
      answers["library-description"]
    );

    fs.writeFile(readmeTemplatePath, updatedData, "utf8", (err) => {
      if (err) throw err;

      //* Delete current README.md
      const readmePath = "./README.md";
      fs.unlink(readmePath, (err) => {
        if (err) throw err;

        //* Rename README.template.md to README.md
        fs.rename(readmeTemplatePath, readmePath, (err) => {
          if (err) throw err;
          console.log("README.md updated successfully.");
        });
      });
    });
  });
};

main().catch((error) => {
  console.error("Error setting up library.", error);
  process.exit(1);
});
