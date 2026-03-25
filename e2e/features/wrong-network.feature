Feature: Visitor is on wrong network
  As a connected visitor on an unsupported network
  I want to see clear guidance
  So that I know to switch networks before interacting

  Scenario: Unsupported network shows banner with switch guidance
    Given I am connected on an unsupported network
    Then I should see the unsupported network banner
    And the banner should say "Switch to Ethereum Hoodi to continue"
    And the network chip should show amber styling

  Scenario: Deposit button is disabled on unsupported network
    Given I am connected on an unsupported network
    When I enter "0.1" in the amount input
    Then the Deposit button should be disabled

  Scenario: Withdraw button is disabled on unsupported network
    Given I am connected on an unsupported network
    Then the Withdraw button should be disabled
