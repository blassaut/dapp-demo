Feature: Visitor mints LKBOX tokens
  As a connected visitor
  I want to mint LKBOX by sending ETH
  So that I can use the LockBox app

  Scenario: Visitor rejects mint transaction
    Given I am connected to the LockBox app
    When I enter "0.1" ETH in the mint input
    And I click "Mint LKBOX"
    And I reject the transaction in MetaMask
    Then I should see a rejection message
    And my LKBOX balance should be unchanged
