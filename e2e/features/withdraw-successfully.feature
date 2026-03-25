Feature: Visitor withdraws successfully
  As a connected visitor with a locked balance
  I want to withdraw my ETH
  So that I can see the full round-trip flow

  Scenario: User withdraws and balance decreases
    Given I am connected on the supported network
    And I have already deposited successfully
    When I enter "0.1" in the amount input
    And I click the Withdraw button
    And I approve the transaction in MetaMask
    Then the status panel should show "Processing withdrawal..."
    And after confirmation the locked balance should decrease
    And the status should show a withdrawal confirmation message

  Scenario: Withdraw button disabled when amount exceeds balance
    Given I am connected on the supported network
    And my locked balance shows "0.0 ETH"
    When I enter "1.0" in the amount input
    Then the Withdraw button should be disabled
