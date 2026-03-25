// Generated from: e2e/features/reject-transaction.feature
import { test } from "../../../steps/fixtures.ts";

test.describe('Visitor rejects transaction', () => {

  test('User rejects a deposit transaction', async ({ Given, When, Then, And, page, wallet }) => { 
    await Given('I am connected on the supported network', null, { page, wallet }); 
    await And('I enter "0.5" in the amount input', null, { page }); 
    await When('I click the Deposit button', null, { page }); 
    await And('I reject the transaction in MetaMask', null, { wallet }); 
    await Then('the status panel should show "Transaction rejected"', null, { page }); 
    await And('the amount input should still contain "0.5"', null, { page }); 
    await And('the Deposit button should be enabled', null, { page }); 
  });

  test('User rejects a withdrawal transaction', async ({ Given, When, Then, And, page, wallet }) => { 
    await Given('I am connected on the supported network', null, { page, wallet }); 
    await And('I have already deposited successfully', null, { page, wallet }); 
    await When('I enter "0.1" in the amount input', null, { page }); 
    await And('I click the Withdraw button', null, { page }); 
    await And('I reject the transaction in MetaMask', null, { wallet }); 
    await Then('the status panel should show "Transaction rejected"', null, { page }); 
    await And('my locked balance should be unchanged', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/reject-transaction.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am connected on the supported network","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I enter \"0.5\" in the amount input","stepMatchArguments":[{"group":{"start":8,"value":"\"0.5\"","children":[{"start":9,"value":"0.5","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When I click the Deposit button","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"And I reject the transaction in MetaMask","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then the status panel should show \"Transaction rejected\"","stepMatchArguments":[{"group":{"start":29,"value":"\"Transaction rejected\"","children":[{"start":30,"value":"Transaction rejected","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And the amount input should still contain \"0.5\"","stepMatchArguments":[{"group":{"start":38,"value":"\"0.5\"","children":[{"start":39,"value":"0.5","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And the Deposit button should be enabled","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Context","textWithKeyword":"Given I am connected on the supported network","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Context","textWithKeyword":"And I have already deposited successfully","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"When I enter \"0.1\" in the amount input","stepMatchArguments":[{"group":{"start":8,"value":"\"0.1\"","children":[{"start":9,"value":"0.1","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"And I click the Withdraw button","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"And I reject the transaction in MetaMask","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Then the status panel should show \"Transaction rejected\"","stepMatchArguments":[{"group":{"start":29,"value":"\"Transaction rejected\"","children":[{"start":30,"value":"Transaction rejected","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":23,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"And my locked balance should be unchanged","stepMatchArguments":[]}]},
]; // bdd-data-end