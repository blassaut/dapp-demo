Feature: Visitor withdraws LKBOX
  As a visitor with a locked balance
  I want to withdraw my LKBOX
  So that I get my tokens back

  Scenario: Full round-trip flow
    Given I have deposited 50 LKBOX
    When I enter "50" in the withdraw input
    And I click "Withdraw"
    And I confirm the transaction in MetaMask
    Then my locked balance should be 0
    And my wallet LKBOX balance should increase by 50

  Scenario: Withdraw updates on-chain state correctly
    Given I have withdrawn all my LKBOX
    Then the contract token balance should equal 0
