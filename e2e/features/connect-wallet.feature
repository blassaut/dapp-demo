Feature: Visitor connects wallet
  As a visitor
  I want to connect my MetaMask wallet
  So that I can interact with the LockBox

  Scenario: Wallet is available and user connects
    Given I am on the LockBox demo page
    When I click the Connect Wallet button
    And I approve the connection in MetaMask
    Then I should see my truncated wallet address
    And the network chip should show the current network

  Scenario: Wallet is available but user cancels connection
    Given I am on the LockBox demo page
    When I click the Connect Wallet button
    And I close the MetaMask connection prompt
    Then the app should remain in disconnected state
    And the Connect Wallet button should still be visible

  Scenario: No wallet is installed
    Given MetaMask is not installed
    And I am on the LockBox demo page
    When I click the Connect Wallet button
    Then I should see "MetaMask not detected. Install MetaMask to continue."
