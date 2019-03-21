import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunnableOptions } from './runnable.schema';
import { readFileSync } from 'fs';

export function main(options: RunnableOptions): Rule {
  const fileName: string = getClearName(options.name);
  const runnableName: string =
    fileName.charAt(0).toUpperCase() + fileName.slice(1);

  return (tree: Tree, context: SchematicContext) => {
    tree.overwrite(
      `src/runnables/runnables.service.ts`,
      runnableServiceFileContent(runnableName, fileName),
    );

    tree.overwrite(
      `src/runnables/index.ts`,
      indexFileContent(runnableName, fileName),
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
  const res: string = `import { Runnable } from './runnable.class';
import { RuleResult } from '../rules/ruleResult';
import { render } from 'mustache';
import { CallbackType } from './runnables.service';
import { RunnableDecorator } from './runnable.decorator';

interface ${runnableName}Args {
  arg: any;
}

/**
 * \`runnableName\`Runnable DESCRIPTION.
 */
@RunnableDecorator('${runnableName}Runnable')
export class ${runnableName}Runnable extends Runnable {

  run(
    callbackType: CallbackType,
    ruleResult: RuleResult,
    args: ${runnableName}Args,
  ): void {
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
    'src/runnables/runnables.service.ts',
  ).toString();

  const index1: number = fileContent.indexOf('\nexport enum CallbackType');
  const index2: number = fileContent.indexOf('return runnable;') - 10;

  const leftSide: string = fileContent.substring(0, index1 - 1);
  const newImport: string = `import { ${runnableName}Runnable } from './${fileName}.runnable';
`;
  const betweenSide: string = fileContent.substring(index1, index2);
  const newElse: string = `case '${runnableName}':
        runnable = new ${runnableName}Runnable();
        break;
      `;
  const rightSide: string = fileContent.substring(index2);

  return leftSide + newImport + betweenSide + newElse + rightSide;
}

function indexFileContent(ruleName: string, fileName: string): string {
  const fileContent: string = readFileSync('src/runnables/index.ts').toString();

  const newExport: string = `export { ${ruleName}Runnable } from './${fileName}.runnable';\n`;

  return fileContent + newExport;
}
