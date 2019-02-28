"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function main(options) {
    const fileName = getClearName(options.name);
    const runnableName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    return (tree, context) => {
        tree.overwrite(`src/runnables/runnable.ts`, runnableServiceFileContent(runnableName, fileName));
        return tree.create(`src/runnables/${fileName}.runnable.ts`, runnableFileContent(runnableName, fileName));
    };
}
exports.main = main;
function getClearName(name) {
    let old = '';
    do {
        old = name;
        name = name.replace(RegExp(/(-.)/), s => {
            return s[1].toUpperCase();
        });
    } while (old !== name);
    return name;
}
function runnableFileContent(runnableName, fileName) {
    const res = `import { RunnableInterface } from './runnable.interface';
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
function runnableServiceFileContent(runnableName, fileName) {
    const fileContent = fs_1.readFileSync('src/runnables/runnable.ts').toString();
    const index1 = fileContent.indexOf('\n@Injectable()');
    const index2 = fileContent.indexOf('return runnable;') - 10;
    const leftSide = fileContent.substring(0, index1 - 1);
    const newImport = `import { ${runnableName} } from './${fileName}.runnable';
`;
    const betweenSide = fileContent.substring(index1, index2);
    const newElse = `case '${runnableName}':
        runnable = new ${runnableName}Runnable();
        break;
      `;
    const rightSide = fileContent.substring(index2);
    return leftSide + newImport + betweenSide + newElse + rightSide;
}
//# sourceMappingURL=runnable.factory.js.map