import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RuleOptions } from './rule.schema';
import { readFileSync } from 'fs';

export function main(options: RuleOptions): Rule {
  const fileName: string = getClearName(options.name);
  const ruleName: string = fileName.charAt(0).toUpperCase() + fileName.slice(1);

  return (tree: Tree, context: SchematicContext) => {
    tree.overwrite(`src/rules/index.ts`, indexFileContent(ruleName, fileName));

    // Create the Rule file
    tree.create(
      `src/rules/${fileName}.rule.ts`,
      ruleFileContent(ruleName, fileName),
    );

    // Create the Rule Test file
    return tree.create(
      `src/rules/${fileName}.rule.spec.ts`,
      ruleTestFileContent(ruleName, fileName),
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

function ruleFileContent(ruleName: string, fileName: string): string {
  const res: string = `import { Rule } from './rule.class';
import { RuleResult } from './ruleResult';
import { GitEventEnum } from '../webhook/utils.enum';
import { Webhook } from '../webhook/webhook';
import { RuleDecorator } from './rule.decorator';

interface ${ruleName}Options {
  opt: any;
}

/**
 * \`${ruleName}Rule\` DESCRIPTION.
 * @return return a \`RuleResult\` object
 */
@RuleDecorator('${fileName}')
export class ${ruleName}Rule extends Rule {
  options: ${ruleName}Options;
  events = [GitEventEnum.Undefined];

  async validate(
    webhook: Webhook,
    ruleConfig: ${ruleName}Rule,
  ): Promise<RuleResult> {
    const ruleResult: RuleResult = new RuleResult(webhook.getGitApiInfos());

    // ...

    return Promise.resolve(ruleResult);
  }
}
`;

  return res;
}

function indexFileContent(ruleName: string, fileName: string): string {
  const fileContent: string = readFileSync('src/rules/index.ts').toString();

  const newExport: string = `export { ${ruleName}Rule } from './${fileName}.rule';\n`;

  return fileContent + newExport;
}

function ruleTestFileContent(ruleName: string, fileName: string): string {
  return `import { Test, TestingModule } from '@nestjs/testing';
import { GithubService } from '../github/github.service';
import { GitlabService } from '../gitlab/gitlab.service';
import { Webhook } from '../webhook/webhook';
import { RuleResult } from '../rules/ruleResult';
import { HttpService } from '@nestjs/common';
import {
  MockHttpService,
  MockGitlabService,
  MockGithubService,
} from '../__mocks__/mocks';
import { ${ruleName}Rule } from './${fileName}.rule';

describe('RulesService', () => {
  let app: TestingModule;
  let githubService: GithubService;
  let gitlabService: GitlabService;
  let webhook: Webhook;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        { provide: HttpService, useClass: MockHttpService },
        { provide: GitlabService, useClass: MockGitlabService },
        { provide: GithubService, useClass: MockGithubService },
      ],
    }).compile();

    githubService = app.get(GithubService);
    gitlabService = app.get(GitlabService);
    webhook = new Webhook(gitlabService, githubService);
    // custom your webhook object

  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ${ruleName} Rule
  describe('${fileName} Rule', () => {
    it('should do something', async () => {
      // Implements your tests here
      const ${fileName}Rule = new ${ruleName}Rule();
      ${fileName}Rule.options = {
        opt: '',
      };
      jest.spyOn(${fileName}Rule, 'validate');

      const result: RuleResult = await ${fileName}Rule.validate(webhook, ${fileName}Rule);
      const expectedResult = {};

      expect(result.validated).toBe(BOOLEAN);
      expect(result.data).toEqual(expectedResult);
    });
  });
});
`;
}
