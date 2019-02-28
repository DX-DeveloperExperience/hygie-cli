"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function main(options) {
    const fileName = getClearName(options.name);
    const ruleName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    return (tree, context) => {
        tree.overwrite(`src/rules/rules.service.ts`, ruleServiceFileContent(ruleName, fileName));
        return tree.create(`src/rules/${fileName}.rule.ts`, ruleFileContent(ruleName, fileName));
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
function ruleFileContent(ruleName, fileName) {
    const res = `import { Rule } from './rule.class';
import { RuleResult } from './ruleResult';

interface ${ruleName}Options {

}

export class ${ruleName}Rule extends Rule {
  name = '${fileName}';
  options: ${ruleName}Options;

  validate(): RuleResult {
    const ruleResult: RuleResult = new RuleResult();

    return ruleResult;
  }
}`;
    return res;
}
function ruleServiceFileContent(ruleName, fileName) {
    const fileContent = fs_1.readFileSync('src/rules/rules.service.ts').toString();
    const index1 = fileContent.indexOf('\n@Injectable()');
    const index2 = fileContent.indexOf('rule.name = r.name;');
    const leftSide = fileContent.substring(0, index1 - 1);
    const newImport = `import { ${ruleName} } from './${fileName}.rule';
`;
    const betweenSide = fileContent.substring(index1, index2);
    const newElse = `else if (r.name === '${fileName}') {
        rule = new ${ruleName}Rule(webhook);
      }
      `;
    const rightSide = fileContent.substring(index2);
    return leftSide + newImport + betweenSide + newElse + rightSide;
}
//# sourceMappingURL=rule.factory.js.map