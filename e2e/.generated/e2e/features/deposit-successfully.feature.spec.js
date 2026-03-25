// Generated from: e2e/features/deposit-successfully.feature
import { test } from "../../../steps/fixtures.ts";

test.describe('Visitor deposits successfully', () => {

  test('User deposits and balance updates', async ({ Given, When, Then, And, page, wallet }) => { 
    await Given('I am connected on the supported network', null, { page, wallet }); 
    await And('my locked balance shows "0.0 ETH"', null, { page }); 
    await When('I enter "0.1" in the amount input', null, { page }); 
    await And('I click the Deposit button', null, { page }); 
    await And('I approve the transaction in MetaMask', null, { wallet }); 
    await Then('the status panel should show "Processing deposit..."', null, { page }); 
    await And('after confirmation the locked balance should update', null, { page }); 
    await And('the status should show a deposit confirmation message', null, { page }); 
  });

  test('User deposits twice and balance accumulates', async ({ Given, When, Then, And, page, wallet }) => { 
    await Given('I am connected on the supported network', null, { page, wallet }); 
    await And('I have already deposited successfully', null, { page, wallet }); 
    await When('I enter "0.2" in the amount input', null, { page }); 
    await And('I click the Deposit button', null, { page }); 
    await And('I approve the transaction in MetaMask', null, { wallet }); 
    await Then('after confirmation the locked balance should be higher than before', null, { page }); 
  });

  test('Amount input resets after successful deposit', async ({ Given, When, Then, And, page, wallet }) => { 
    await Given('I am connected on the supported network', null, { page, wallet }); 
    await When('I enter "0.1" in the amount input', null, { page }); 
    await And('I click the Deposit button', null, { page }); 
    await And('I approve the transaction in MetaMask', null, { wallet }); 
    await Then('after confirmation the amount input should be empty', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/deposit-successfully.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am connected on the supported network","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And my locked balance shows \"0.0 ETH\"","stepMatchArguments":[{"group":{"start":24,"value":"\"0.0 ETH\"","children":[{"start":25,"value":"0.0 ETH","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When I enter \"0.1\" in the amount input","stepMatchArguments":[{"group":{"start":8,"value":"\"0.1\"","children":[{"start":9,"value":"0.1","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"And I click the Deposit button","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"And I approve the transaction in MetaMask","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then the status panel should show \"Processing deposit...\"","stepMatchArguments":[{"group":{"start":29,"value":"\"Processing deposit...\"","children":[{"start":30,"value":"Processing deposit...","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And after confirmation the locked balance should update","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And the status should show a deposit confirmation message","stepMatchArguments":[]}]},
  {"pwTestLine":17,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Context","textWithKeyword":"Given I am connected on the supported network","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Context","textWithKeyword":"And I have already deposited successfully","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I enter \"0.2\" in the amount input","stepMatchArguments":[{"group":{"start":8,"value":"\"0.2\"","children":[{"start":9,"value":"0.2","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"And I click the Deposit button","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"And I approve the transaction in MetaMask","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then after confirmation the locked balance should be higher than before","stepMatchArguments":[]}]},
  {"pwTestLine":26,"pickleLine":24,"tags":[],"steps":[{"pwStepLine":27,"gherkinStepLine":25,"keywordType":"Context","textWithKeyword":"Given I am connected on the supported network","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"When I enter \"0.1\" in the amount input","stepMatchArguments":[{"group":{"start":8,"value":"\"0.1\"","children":[{"start":9,"value":"0.1","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":29,"gherkinStepLine":27,"keywordType":"Action","textWithKeyword":"And I click the Deposit button","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"And I approve the transaction in MetaMask","stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"Then after confirmation the amount input should be empty","stepMatchArguments":[]}]},
]; // bdd-data-end