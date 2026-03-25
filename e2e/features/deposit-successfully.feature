Feature: Visitor deposits successfully
  As a connected visitor on a supported network
  I want to deposit ETH into the LockBox
  So that I can see the on-chain deposit flow

  Scenario: User deposits and balance updates
    Given I am connected on the supported network
    When I enter "0.1" in the amount input
    And I click the Deposit button
    And I approve the transaction in MetaMask
    Then after confirmation the locked balance should update
    And the status should show a deposit confirmation message
    And the transaction history should be visible
    And the history should have grown by 1

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

  Scenario: Deposit button disabled when amount exceeds wallet balance
    Given I am connected on the supported network
    When I enter "999999" in the amount input
    Then the Deposit button should be disabled
    And I should see the deposit hint showing the max wallet balance

  Scenario: Contract balance updates after deposit
    Given I am connected on the supported network
    When I enter "0.1" in the amount input
    And I click the Deposit button
    And I approve the transaction in MetaMask
    Then the contract balance should show a non-zero value
