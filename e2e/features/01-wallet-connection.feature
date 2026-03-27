Feature: Visitor connects wallet
  As a visitor
  I want to connect my MetaMask wallet
  So that I can interact with LockBox

  Scenario: Wallet connects successfully
    Given I am on the LockBox app
    When I click "Connect Wallet"
    And I approve the connection in MetaMask
    Then I should see my truncated wallet address
    And I should see my LKBOX balance

  Scenario: Wrong network shows switch prompt
    Given I am connected with the wrong network
    Then I should see the "Switch to Hoodi" button
    And deposit and withdraw buttons should be disabled

  Scenario: Switching network enables the app
    Given I am on the wrong network
    When I click "Switch to Hoodi"
    Then the network badge should show "Ethereum Hoodi"
    And all actions should be available
