/// <reference types="cypress" />

describe('Location visit — side activities', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Start', { matchCase: false }, { timeout: 15000 }).should('be.visible');
  });

  const getStore = () => cy.window().its('__GAME_STORE');

  it('loads location via store without JS errors and shows activities', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(0);
    });

    // Navigate via map directly
    getStore().then((s: any) => {
      s.getState().setPhase('home');
    });
    cy.contains('Go Outside', { timeout: 5000 }).should('be.visible');
    cy.contains('Go Outside').click();
    cy.wait(300);

    // Now we're on map (ch0 = 'The Signal'), check for location markers
    cy.contains('The Signal', { timeout: 5000 }).should('be.visible');

    // Leaflet markers should exist
    cy.get('[class*="leaflet-marker"]', { timeout: 3000 }).should('exist');

    // Now visit a location via store
    cy.window().then((win: any) => {
      const store = win.__GAME_STORE;
      store.getState().setCurrentLocation('bcn-park-ciutadella');
      store.getState().setPhase('location');
    });

    cy.wait(500);

    // LocationScreen should render activity buttons
    cy.window().then((win: any) => {
      const state = win.__GAME_STORE.getState();
      expect(state.phase).to.equal('location');
      expect(state.currentLocationId).to.equal('bcn-park-ciutadella');
    });
    cy.contains('Parc de la Ciutadella', { timeout: 5000 }).should('be.visible');
    cy.contains('Exercise').should('be.visible');
    cy.contains('Meditate').should('be.visible');
  });

  it('shows activities for a library location via store', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(0);
      s.getState().setCurrentLocation('bcn-library-central');
      s.getState().setPhase('location');
    });

    cy.contains('La Central del Raval', { timeout: 5000 }).should('be.visible');
    cy.contains('Study Scrolls').should('be.visible');
    cy.contains('Research').should('be.visible');
  });
});