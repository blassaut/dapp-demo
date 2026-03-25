// Generated from: e2e/features/wrong-network.feature
import { test } from "../../../steps/fixtures.ts";

test.describe('Visitor is on wrong network', () => {

  test('Unsupported network shows banner with switch guidance', async ({ Given, Then, And, page, wallet }) => { 
    await Given('I am connected on an unsupported network', null, { page, wallet }); 
    await Then('I should see the unsupported network banner', null, { page }); 
    await And('the banner should say "Switch to Ethereum Hoodi to continue"', null, { page }); 
    await And('the network chip should show amber styling', null, { page }); 
  });

  test('Deposit button is disabled on unsupported network', async ({ Given, When, Then, page, wallet }) => { 
    await Given('I am connected on an unsupported network', null, { page, wallet }); 
    await When('I enter "0.1" in the amount input', null, { page }); 
    await Then('the Deposit button should be disabled', null, { page }); 
  });

  test('Withdraw button is disabled on unsupported network', async ({ Given, Then, page, wallet }) => { 
    await Given('I am connected on an unsupported network', null, { page, wallet }); 
    await Then('the Withdraw button should be disabled', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/wrong-network.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am connected on an unsupported network","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then I should see the unsupported network banner","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And the banner should say \"Switch to Ethereum Hoodi to continue\"","stepMatchArguments":[{"group":{"start":22,"value":"\"Switch to Ethereum Hoodi to continue\"","children":[{"start":23,"value":"Switch to Ethereum Hoodi to continue","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"And the network chip should show amber styling","stepMatchArguments":[]}]},
  {"pwTestLine":13,"pickleLine":12,"tags":[],"steps":[{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Context","textWithKeyword":"Given I am connected on an unsupported network","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"When I enter \"0.1\" in the amount input","stepMatchArguments":[{"group":{"start":8,"value":"\"0.1\"","children":[{"start":9,"value":"0.1","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then the Deposit button should be disabled","stepMatchArguments":[]}]},
  {"pwTestLine":19,"pickleLine":17,"tags":[],"steps":[{"pwStepLine":20,"gherkinStepLine":18,"keywordType":"Context","textWithKeyword":"Given I am connected on an unsupported network","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then the Withdraw button should be disabled","stepMatchArguments":[]}]},
]; // bdd-data-end