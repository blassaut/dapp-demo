Feature: Visitor deposits successfully
  As a connected visitor on a supported network
  I want to deposit ETH into the LockBox
  So that I can see the on-chain deposit flow

  Scenario: User deposits and balance updates
    Given I am connected on the supported network
    And my locked balance shows "0.0 ETH"
    When I enter "0.1" in the amount input
    And I click the Deposit button
    And I approve the transaction in MetaMask
    Then the status panel should show "Processing deposit..."
    And after confirmation the locked balance should update
    And the status should show a deposit confirmation message

  Scenario: User deposits twice and balance accumulates
    Given I am connected on the supported network
    And I have already deposited successfully
    When I enter "0.2" in the amount input
    And I click the Deposit button
    And I approve the transaction in MetaMask
    Then after confirmation the locked balance should be higher than before

  Scenario: Amount input resets after successful deposit
    Given I am connected on the supported network
    When I enter "0.1" in the amount input
    And I click the Deposit button
    And I approve the transaction in MetaMask
    Then after confirmation the amount input should be empty
