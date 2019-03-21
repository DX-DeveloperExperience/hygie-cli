import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RuleOptions } from './rule.schema';
import { readFileSync } from 'fs';

export function main(options: RuleOptions): Rule {
  const fileName: string = getClearName(options.name);
  const ruleName: string = fileName.charAt(0).toUpperCase() + fileName.slice(1);

  return (tree: Tree, context: SchematicContext) => {
    tree.overwrite(`src/rules/index.ts`, indexFileContent(ruleName, fileName));

    // Create the Rule file
    return tree.create(
      `src/rules/${fileName}.rule.ts`,
      ruleFileContent(ruleName, fileName),
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
 * \`${ruleName}Rule\` DESCRIPTION
 * @return return a \`RuleResult\` object
 */
@RuleDecorator('${fileName}')
export class ${ruleName}Rule extends Rule {
  options: ${ruleName}Options;
  events = [GitEventEnum.SELECT_EVENT];

  validate(webhook: Webhook, ruleConfig: ${ruleName}Rule): RuleResult {
    const ruleResult: RuleResult = new RuleResult(webhook.getGitApiInfos());

    // ...

    return ruleResult;
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
