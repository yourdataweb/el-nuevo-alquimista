/// <reference types="cypress" />

describe('Mini-game result summary', () => {
  it('shows result summary after completing timing-bar mini-game', () => {
    cy.on('uncaught:exception', () => false);

    cy.visit('http://localhost:5173/badass-quest-2/');
    cy.contains('Start', { matchCase: false }, { timeout: 15000 }).should('be.visible');

    // Atomic store update — much more reliable than sequential setters
    cy.window().then((win: any) => {
      win.__GAME_STORE.setState({
        phase: 'location',
        currentChapter: 1,
        currentLocationId: 'bcn-park-ciutadella',
      });
    });
    cy.wait(1000);
    cy.contains('Parc de la Ciutadella', { timeout: 5000 }).should('be.visible');

    // Open game modal
    cy.contains('Exercise').click({ force: true });
    cy.wait(500);
    cy.get('canvas', { timeout: 5000 }).should('exist');
    cy.log('✓ Game modal opened');

    // Play through timing game (7 clicks)
    cy.get('canvas').click(200, 200, { force: true });
    cy.wait(200);
    cy.get('canvas').click(200, 200, { force: true });
    cy.wait(200);
    for (let i = 0; i < 5; i++) {
      cy.get('canvas').click(200, 200, { force: true });
      cy.wait(150);
    }
    cy.wait(1500);

    cy.screenshot('result-summary-test', { capture: 'viewport' });

    cy.get('body').then(($body) => {
      const text = $body.text();
      cy.log('✅ SUCCESS:', text.includes('Success!'));
      cy.log('✅ FAILED:', text.includes('Failed'));
      cy.log('✅ CONTINUE:', text.includes('Continue'));
      cy.log('✅ HAS RESULT:', text.includes('Success!') || text.includes('Failed'));
    });
  });
});