Feature: Failure scenarios are handled gracefully
  As a visitor
  I want the app to handle errors clearly
  So that I understand what went wrong

  Scenario: Visitor rejects deposit approval
    Given I have 100 LKBOX in my wallet
    When I enter "50" in the deposit input
    And I click "Approve & Deposit"
    And I reject the transaction in MetaMask
    Then I should see a rejection message
    And my LKBOX balance should be unchanged
