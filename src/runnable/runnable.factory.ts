import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunnableOptions } from './runnable.schema';
import { readFileSync } from 'fs';

export function main(options: RunnableOptions): Rule {
  const fileName: string = getClearName(options.name);
  const runnableName: string =
    fileName.charAt(0).toUpperCase() + fileName.slice(1);

  return (tree: Tree, context: SchematicContext) => {
    tree.overwrite(
      `src/runnables/index.ts`,
      indexFileContent(runnableName, fileName),
    );

    // Create the Runnable file
    tree.create(
      `src/runnables/${fileName}.runnable.ts`,
      runnableFileContent(runnableName, fileName),
    );

    // Create the Runnable Test file
    return tree.create(
      `src/runnables/${fileName}.runnable.spec.ts`,
      runnableTestFileContent(runnableName, fileName),
    );
  };
}

function getClearName(name: string) {
  let old: string = '';
  do {
    old = name;
    name = name.replace(RegExp(/(-.)/), s => {
      return s[1].toUpperCase();
    });
  } while (old !== name);
  return name;
}

function runnableFileContent(runnableName: string, fileName: string): string {
  const res: string = `import { Runnable } from './runnable.class';
import { RuleResult } from '../rules/ruleResult';
import { render } from 'mustache';
import { CallbackType } from './runnables.service';
import { RunnableDecorator } from './runnable.decorator';

interface ${runnableName}Args {
  arg: any;
}

/**
 * \`${runnableName}Runnable\` DESCRIPTION.
 */
@RunnableDecorator('${runnableName}Runnable')
export class ${runnableName}Runnable extends Runnable {

  async run(
    callbackType: CallbackType,
    ruleResult: RuleResult,
    args: ${runnableName}Args,
  ): Promise<void> {
    const data = ruleResult.data as any;
    // ...

  }
}
`;

  return res;
}

function indexFileContent(ruleName: string, fileName: string): string {
  const fileContent: string = readFileSync('src/runnables/index.ts').toString();

  const newExport: string = `export { ${ruleName}Runnable } from './${fileName}.runnable';\n`;

  return fileContent + newExport;
}

function runnableTestFileContent(
  runnableName: string,
  fileName: string,
): string {
  return `import { Test, TestingModule } from '@nestjs/testing';
import { GithubService } from '../github/github.service';
import { GitlabService } from '../gitlab/gitlab.service';
import { GitTypeEnum } from '../webhook/utils.enum';
import { CallbackType } from './runnables.service';
import { RuleResult } from '../rules/ruleResult';
import { GitApiInfos } from '../git/gitApiInfos';
import { MockGitlabService, MockGithubService } from '../__mocks__/mocks';
import { ${runnableName}Runnable } from './${fileName}.runnable';

describe('UpdateIssueRunnable', () => {
  let app: TestingModule;

  let githubService: GithubService;
  let gitlabService: GitlabService;

  let ${fileName}Runnable: ${runnableName}Runnable;

  let args: any;
  let ruleResult: RuleResult;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        ${runnableName}Runnable,
        { provide: GitlabService, useClass: MockGitlabService },
        { provide: GithubService, useClass: MockGithubService },
      ],
    }).compile();

    githubService = app.get(GithubService);
    gitlabService = app.get(GitlabService);
    ${fileName}Runnable = app.get(${runnableName}Runnable);

    const myGitApiInfos = new GitApiInfos();
    myGitApiInfos.repositoryFullName = 'bastienterrier/test_webhook';
    myGitApiInfos.git = GitTypeEnum.Undefined;

    args = { some: 'arg' };

    ruleResult = new RuleResult(myGitApiInfos);
    ruleResult.validated = false;
    ruleResult.data = {
      some: 'data',
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('${fileName} Runnable', () => {
    it('should do something', () => {
      ${fileName}Runnable.run(CallbackType.Both, ruleResult, args);
    });
  });
});
`;
}
