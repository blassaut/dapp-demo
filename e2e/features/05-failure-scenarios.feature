Feature: Failure scenarios are handled gracefully
  As a visitor
  I want the app to handle errors clearly
  So that I understand what went wrong

  Scenario: Withdraw button is disabled when amount exceeds locked balance
    Given I have deposited 50 LKBOX
    When I enter "100" in the withdraw input
    Then the withdraw button should be disabled

  Scenario: Visitor rejects deposit approval
    Given I have 100 LKBOX in my wallet
    When I enter "50" in the deposit input
    And I click "Approve & Deposit"
    And I reject the transaction in MetaMask
    Then I should see a rejection message
    And my LKBOX balance should be unchanged

  Scenario: Visitor rejects mint transaction
    Given I am connected to the LockBox app
    When I enter "0.1" ETH in the mint input
    And I click "Mint LKBOX"
    And I reject the transaction in MetaMask
    Then I should see a rejection message
    And my LKBOX balance should be unchanged
