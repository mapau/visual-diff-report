# About

Simple cli tool that generates an html report off a folder structure
With baseline, comparison and diff *.png images.

![Example](example.jpeg)

[Npm package](https://www.npmjs.com/package/visual-diff-html-report)


By default the cli can be pointed to an output folder structure generated by the [@web/test-runner-visual-regression plugin](https://www.npmjs.com/package/@web/test-runner-visual-regression).

It can also be configured to pick up custom folder structures though.

Does currently NOT produce diff images but assumes they are already produced


# Usage
```

# basic usage (assumes folder structure as produced by @web/test-runner-visual-regression)
npx visual-diff-html-report --rootDir=test-data --outDir=./.tmp/cli/a

# pass in path to file (config must be default export)
npx visual-diff-html-report --config path to config

# print cli help
npx visual-diff-html-report --help
```

# Configuration Options

Up to date config file is [here](./src/generate.ts).

Sample config:

```ts

/**
 * main config options
 */
export interface VisualDiffReportConfig {
  /**
   * title of report
   */
  reportTitle: string;

  /**
   * root directory where images are found
   */
  rootDir: string;

  /**
   * optional
   * output directory (defaults to root dir)
   */
  outDir?: string;

  /**
   * optional
   * enable verbose logging
   */
  verbose?: boolean;

  /**
   * optional
   * additional FastGlobOptions to discover image files
   */
  globImagesOptions?: FastGlobOptions;

  /**
   * optional
   * glob pattern for image files
   */
  globImages?: string | string[]; // relative to root dir

  /**
   * optional
   * function must return true for paths of "baseline" images
   */
  isBaseline?: (path: string) => boolean;

  /**
   * optional
   * function must return true for paths of "current" images
   */
  isCurrent?: (path: string) => boolean;

  /**
   * optional
   * function must map "baseline" image to corresponding "current" image
   */
  baselineToCurrent?: (baselinePath: string) => string;

  /**
   * optional
   * function must map "current" image to corresponding "baseline" image
   */
  currentToBaseline?: (currentPath: string) => string;

  /**
   * optional
   * function must map "baseline" image to corresponding "diff" image
   */
  baselineToDiff: (currentPath: string) => string;

  /**
   * optional
   * map path to an a array of strings used for organizing the image list in folders
   */
  fold: (path: string) => string[];
}
```



