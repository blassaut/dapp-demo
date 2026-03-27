Feature: Visitor deposits LKBOX
  As a visitor with LKBOX tokens
  I want to deposit them into LockBox
  So that they are locked in the contract

  Scenario: Visitor deposits successfully after approval
    Given I have 100 LKBOX in my wallet
    When I enter "50" in the deposit input
    And I click "Approve & Deposit"
    And I confirm the approval in MetaMask
    And I confirm the deposit in MetaMask
    Then my locked balance should show 50 LKBOX
    And my wallet LKBOX balance should decrease by 50

  Scenario: Deposit updates on-chain state correctly
    Given I have deposited 50 LKBOX
    Then the contract token balance should equal 50 LKBOX
    And my locked balance should equal 50 LKBOX
