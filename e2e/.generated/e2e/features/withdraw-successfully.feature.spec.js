// Generated from: e2e/features/withdraw-successfully.feature
import { test } from "../../../steps/fixtures.ts";

test.describe('Visitor withdraws successfully', () => {

  test('User withdraws and balance decreases', async ({ Given, When, Then, And, page, wallet }) => { 
    await Given('I am connected on the supported network', null, { page, wallet }); 
    await And('I have already deposited successfully', null, { page, wallet }); 
    await When('I enter "0.1" in the amount input', null, { page }); 
    await And('I click the Withdraw button', null, { page }); 
    await And('I approve the transaction in MetaMask', null, { wallet }); 
    await Then('the status panel should show "Processing withdrawal..."', null, { page }); 
    await And('after confirmation the locked balance should decrease', null, { page }); 
    await And('the status should show a withdrawal confirmation message', null, { page }); 
  });

  test('Withdraw button disabled when amount exceeds balance', async ({ Given, When, Then, And, page, wallet }) => { 
    await Given('I am connected on the supported network', null, { page, wallet }); 
    await And('my locked balance shows "0.0 ETH"', null, { page }); 
    await When('I enter "1.0" in the amount input', null, { page }); 
    await Then('the Withdraw button should be disabled', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/withdraw-successfully.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am connected on the supported network","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I have already deposited successfully","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When I enter \"0.1\" in the amount input","stepMatchArguments":[{"group":{"start":8,"value":"\"0.1\"","children":[{"start":9,"value":"0.1","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"And I click the Withdraw button","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"And I approve the transaction in MetaMask","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then the status panel should show \"Processing withdrawal...\"","stepMatchArguments":[{"group":{"start":29,"value":"\"Processing withdrawal...\"","children":[{"start":30,"value":"Processing withdrawal...","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And after confirmation the locked balance should decrease","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And the status should show a withdrawal confirmation message","stepMatchArguments":[]}]},
  {"pwTestLine":17,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Context","textWithKeyword":"Given I am connected on the supported network","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Context","textWithKeyword":"And my locked balance shows \"0.0 ETH\"","stepMatchArguments":[{"group":{"start":24,"value":"\"0.0 ETH\"","children":[{"start":25,"value":"0.0 ETH","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I enter \"1.0\" in the amount input","stepMatchArguments":[{"group":{"start":8,"value":"\"1.0\"","children":[{"start":9,"value":"1.0","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Then the Withdraw button should be disabled","stepMatchArguments":[]}]},
]; // bdd-data-end