import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RuleOptions } from './rule.schema';
import { readFileSync } from 'fs';

export function main(options: RuleOptions): Rule {
  const fileName: string = getClearName(options.name);
  const ruleName: string = fileName.charAt(0).toUpperCase() + fileName.slice(1);

  return (tree: Tree, context: SchematicContext) => {
    tree.overwrite(
      `src/rules/rules.service.ts`,
      ruleServiceFileContent(ruleName, fileName),
    );

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

interface ${ruleName}Options {
  opt: string;
}

export class ${ruleName}Rule extends Rule {
  name = '${fileName}';
  options: ${ruleName}Options;

  validate(): RuleResult {
    const ruleResult: RuleResult = new RuleResult();

    return ruleResult;
  }
}
`;

  return res;
}

function ruleServiceFileContent(ruleName: string, fileName: string): string {
  const fileContent: string = readFileSync(
    'src/rules/rules.service.ts',
  ).toString();

  const index1: number = fileContent.indexOf('\n@Injectable()');
  const index2: number = fileContent.indexOf('rule.name = r.name;');

  const leftSide: string = fileContent.substring(0, index1 - 1);
  const newImport: string = `import { ${ruleName}Rule } from './${fileName}.rule';
`;
  const betweenSide: string = fileContent.substring(index1, index2);
  const newElse: string = `else if (r.name === '${fileName}') {
        rule = new ${ruleName}Rule(webhook);
      }
      `;
  const rightSide: string = fileContent.substring(index2);

  return leftSide + newImport + betweenSide + newElse + rightSide;
}
