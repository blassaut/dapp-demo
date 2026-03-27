Feature: Critical path - full user journey
  As a visitor
  I want to connect, mint, deposit, check the leaderboard, and withdraw
  So that the core app flow works end to end

  Scenario: Complete mint, deposit, leaderboard, withdraw flow
    Given I am on the LockBox app
    When I click "Connect Wallet"
    And I approve the connection in MetaMask
    Then I should see my truncated wallet address
    And I should see my LKBOX balance

    When I enter "0.1" ETH in the mint input
    And I click "Mint LKBOX"
    And I confirm the transaction in MetaMask
    Then I should see my LKBOX balance increase by 100
    And the transaction should appear in history

    When I enter "50" in the deposit input
    And I click "Approve & Deposit"
    And I confirm the approval in MetaMask
    And I confirm the deposit in MetaMask
    Then my locked balance should have increased by 50
    And I should appear on the leaderboard
    And I snapshot my current balances

    When I enter "50" in the withdraw input
    And I click "Withdraw"
    And I confirm the transaction in MetaMask
    Then my locked balance should have decreased by 50
    And my wallet LKBOX balance should increase by 50
