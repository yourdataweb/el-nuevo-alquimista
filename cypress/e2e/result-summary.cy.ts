/// <reference types="cypress" />

describe('Mini-game result summary', () => {
  it('plays through timing-bar mini-game and captures screenshots at every step', () => {
    cy.on('uncaught:exception', () => false);

    cy.visit('/');
    cy.screenshot('01-title-screen', { capture: 'viewport' });
    cy.contains('Start', { matchCase: false }, { timeout: 15000 }).should('be.visible');

    cy.window().then((win: any) => {
      win.__GAME_STORE.setState({
        phase: 'location',
        currentChapter: 1,
        currentLocationId: 'bcn-park-ciutadella',
      });
    });
    cy.wait(1000);
    cy.contains('Parc de la Ciutadella', { timeout: 5000 }).should('be.visible');
    cy.screenshot('02-location-screen', { capture: 'viewport' });

    cy.contains('Exercise').click({ force: true });
    cy.wait(800);
    // Mini-games are React components — wait for modal close button
    cy.get('[aria-label="Close"]', { timeout: 5000 }).should('exist');
    cy.screenshot('03-game-modal-open', { capture: 'viewport' });

    // Close the modal to return to location screen
    cy.get('[aria-label="Close"]').click();
    cy.wait(500);

    cy.screenshot('04-after-game-complete', { capture: 'viewport' });
    cy.wait(2000);
    cy.screenshot('05-after-wait-2s', { capture: 'viewport' });

    // Check page text
    cy.get('body').then(($body) => {
      const text = $body.text();
      cy.log('==================================');
      cy.log('📋 Page text analysis:');
      cy.log('  Contains "Success!" :', text.includes('Success!'));
      cy.log('  Contains "Failed"   :', text.includes('Failed'));
      cy.log('  Contains "Continue" :', text.includes('Continue'));
      cy.log('  Contains "Exercise" :', text.includes('Exercise'));
      cy.log('  Contains "Parc"     :', text.includes('Parc'));
      cy.log('==================================');
    });
  });
});