// Generated from: e2e/features/connect-wallet.feature
import { test } from "../../../steps/fixtures.ts";

test.describe('Visitor connects wallet', () => {

  test('Wallet is available and user connects', async ({ Given, When, Then, And, page, wallet }) => { 
    await Given('I am on the LockBox demo page', null, { page }); 
    await When('I click the Connect Wallet button', null, { page }); 
    await And('I approve the connection in MetaMask', null, { wallet }); 
    await Then('I should see my truncated wallet address', null, { page }); 
    await And('the network chip should show the current network', null, { page }); 
  });

  test('Wallet is available but user cancels connection', async ({ Given, When, Then, And, page, wallet }) => { 
    await Given('I am on the LockBox demo page', null, { page }); 
    await When('I click the Connect Wallet button', null, { page }); 
    await And('I close the MetaMask connection prompt', null, { wallet }); 
    await Then('the app should remain in disconnected state', null, { page }); 
    await And('the Connect Wallet button should still be visible', null, { page }); 
  });

  test('No wallet is installed', async ({ Given, When, Then, And, page }) => { 
    await Given('MetaMask is not installed', null, { page }); 
    await And('I am on the LockBox demo page', null, { page }); 
    await When('I click the Connect Wallet button', null, { page }); 
    await Then('I should see "MetaMask not detected. Install MetaMask to continue."', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/connect-wallet.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the LockBox demo page","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When I click the Connect Wallet button","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"And I approve the connection in MetaMask","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then I should see my truncated wallet address","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And the network chip should show the current network","stepMatchArguments":[]}]},
  {"pwTestLine":14,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Context","textWithKeyword":"Given I am on the LockBox demo page","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I click the Connect Wallet button","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"And I close the MetaMask connection prompt","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"Then the app should remain in disconnected state","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And the Connect Wallet button should still be visible","stepMatchArguments":[]}]},
  {"pwTestLine":22,"pickleLine":20,"tags":[],"steps":[{"pwStepLine":23,"gherkinStepLine":21,"keywordType":"Context","textWithKeyword":"Given MetaMask is not installed","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":22,"keywordType":"Context","textWithKeyword":"And I am on the LockBox demo page","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When I click the Connect Wallet button","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then I should see \"MetaMask not detected. Install MetaMask to continue.\"","stepMatchArguments":[{"group":{"start":13,"value":"\"MetaMask not detected. Install MetaMask to continue.\"","children":[{"start":14,"value":"MetaMask not detected. Install MetaMask to continue.","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end