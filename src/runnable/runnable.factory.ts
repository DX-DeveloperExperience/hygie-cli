import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunnableOptions } from './runnable.schema';
import { readFileSync } from 'fs';

export function main(options: RunnableOptions): Rule {
  const fileName: string = getClearName(options.name);
  const runnableName: string =
    fileName.charAt(0).toUpperCase() + fileName.slice(1);

  return (tree: Tree, context: SchematicContext) => {
    tree.overwrite(
      `src/runnables/runnable.ts`,
      runnableServiceFileContent(runnableName, fileName),
    );

    // Create the Runnable file
    return tree.create(
      `src/runnables/${fileName}.runnable.ts`,
      runnableFileContent(runnableName, fileName),
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
  const res: string = `import { RunnableInterface } from './runnable.interface';
import { RuleResult } from '../rules/ruleResult';
import { render } from 'mustache';

interface ${runnableName}Args {
}
export class ${runnableName}Runnable implements RunnableInterface {
  name: string = '${runnableName}';

  run(ruleResult: RuleResult, args: ${runnableName}Args): void {

    // ...

  }
}
`;

  return res;
}

function runnableServiceFileContent(
  runnableName: string,
  fileName: string,
): string {
  const fileContent: string = readFileSync(
    'src/runnables/runnable.ts',
  ).toString();

  const index1: number = fileContent.indexOf('\n@Injectable()');
  const index2: number = fileContent.indexOf('return runnable;') - 10;

  const leftSide: string = fileContent.substring(0, index1 - 1);
  const newImport: string = `import { ${runnableName} } from './${fileName}.runnable';
`;
  const betweenSide: string = fileContent.substring(index1, index2);
  const newElse: string = `case '${runnableName}':
        runnable = new ${runnableName}Runnable();
        break;
      `;
  const rightSide: string = fileContent.substring(index2);

  return leftSide + newImport + betweenSide + newElse + rightSide;
}
