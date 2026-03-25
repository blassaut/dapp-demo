Feature: Visitor rejects transaction
  As a connected visitor
  I want to reject a transaction in my wallet
  So that the app recovers gracefully

  Scenario: User rejects a deposit transaction
    Given I am connected on the supported network
    And I enter "0.5" in the amount input
    When I click the Deposit button
    And I reject the transaction in MetaMask
    Then the status panel should show "Transaction rejected"
    And the amount input should still contain "0.5"
    And the Deposit button should be enabled

  Scenario: User rejects a withdrawal transaction
    Given I am connected on the supported network
    And I have already deposited successfully
    When I enter "0.1" in the amount input
    And I click the Withdraw button
    And I reject the transaction in MetaMask
    Then the status panel should show "Transaction rejected"
    And my locked balance should be unchanged
