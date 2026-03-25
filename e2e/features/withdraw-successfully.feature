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
    Then after confirmation the locked balance should decrease
    And the status should show a withdrawal confirmation message
    And the transaction history should be visible
    And the history should have grown by 1

  Scenario: Withdraw button disabled when amount exceeds balance
    Given I am connected on the supported network
    When I enter "99999" in the amount input
    Then the Withdraw button should be disabled

  Scenario: Withdraw hint shows max balance
    Given I am connected on the supported network
    And I have already deposited successfully
    When I enter "99999" in the amount input
    Then I should see the withdraw hint showing the max locked balance
