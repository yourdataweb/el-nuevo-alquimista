/// <reference types="cypress" />

// Chapter index reference (after removing prologue):
//  0 = ch1  "The Signal"          (story,     casa-batllo)
//  1 = ch2-sandbox "The Merchant of Glass"  (sandbox,  library-central)
//  2 = ch3  "The Englishman"      (story,     ciutadella)
//  3 = ch4-sandbox "The Desert Crossing"    (sandbox,  3 locations)
//  4 = ch5  "The Trial"           (story,     plaça-espanya)
//  5 = epilogue "The Return"      (story,     cafe-federal)

describe('Badass Quest 2 — game flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Start', { matchCase: false }, { timeout: 15000 }).should('be.visible');
  });

  const getStore = () => cy.window().its('__GAME_STORE');

  // ── 1. Title Screen ──
  it('renders the title screen with a start button', () => {
    cy.contains('Start', { matchCase: false }).should('be.visible');
  });

  // ── 2. Home screen shows with proper UI ──
  it('home screen shows interaction buttons', () => {
    getStore().then((s: any) => {
      s.getState().setPhase('home');
      s.getState().setCurrentLocation('bcn-home');
    });
    cy.contains('Go Outside', { timeout: 5000 }).should('be.visible');
    cy.contains('Have Breakfast', { matchCase: false }).should('be.visible');
  });

  // ── 3. Home → Map works ──
  it('goes from home to map', () => {
    getStore().then((s: any) => {
      s.getState().setPhase('home');
      s.getState().setCurrentLocation('bcn-home');
    });
    cy.contains('Go Outside', { matchCase: false }).should('be.visible');
    cy.contains('Go Outside', { matchCase: false }).click();
    cy.contains('The Signal', { matchCase: false }).should('be.visible');
  });

  // ── 4. Map shows chapter info ──
  it('shows chapter info on the map bottom sheet', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(0);
      s.getState().setPhase('map');
    });
    cy.contains('The Signal', { matchCase: false }).should('be.visible');
  });

  // ── 5. Character images load in dialogue ──
  it('character images render in dialogue', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(0);
      s.getState().setPhase('dialogue');
    });
    cy.get('img', { timeout: 5000 }).should('have.length.at.least', 1);
  });

  // ── 6. Dialogue option buttons work ──
  it('dialogue options can be clicked', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(0);
      s.getState().setPhase('dialogue');
    });
    cy.contains('Choose', { matchCase: false }).should('be.visible');
    cy.get('.option-btn').should('have.length.at.least', 1);
    cy.get('.option-btn').first().click({ force: true });
    cy.wait(300);
  });

  // ── 7. ch2-sandbox auto-advances when library-central visited ──
  it('auto-advances ch2-sandbox when required library is visited', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(1);
      s.getState().setPhase('map');
      s.getState().addVisitedLocation('bcn-library-central');
    });
    cy.wait(500);
    getStore().then((s: any) => {
      const state = s.getState();
      expect(state.completedChapterIds).to.include('ch2-sandbox');
      expect(state.currentChapter).to.equal(2);
    });
  });

  // ── 8. ch4-sandbox auto-advances when all 3 locations visited ──
  it('auto-advances ch4-sandbox after visiting all 3 locations', () => {
    getStore().then((s: any) => {
      const store = s.getState();
      store.setChapter(3);
      store.setPhase('map');
      store.addVisitedLocation('bcn-market-sant-antoni');
      store.addVisitedLocation('bcn-church-santa-maria');
      store.addVisitedLocation('bcn-monument-casa-batllo');
    });
    cy.wait(500);
    getStore().then((s: any) => {
      const state = s.getState();
      expect(state.completedChapterIds).to.include('ch4-sandbox');
      expect(state.currentChapter).to.equal(4);
    });
  });

  // ── 9. Partial visits do NOT trigger auto-advance ──
  it('does NOT auto-advance with only partial location visits', () => {
    getStore().then((s: any) => {
      const store = s.getState();
      store.setChapter(3);
      store.setPhase('map');
      store.addVisitedLocation('bcn-market-sant-antoni');
    });
    cy.wait(300);
    getStore().then((s: any) => {
      const state = s.getState();
      expect(state.currentChapter).to.equal(3);
      expect(state.completedChapterIds).not.to.include('ch4-sandbox');
    });
  });

  // ── 10. Wrong location does NOT auto-advance sandbox ──
  it('does NOT auto-advance sandbox with non-required location', () => {
    getStore().then((s: any) => {
      // ch2-sandbox (index 1) requires bcn-library-central
      // visiting a market should NOT trigger it
      s.getState().setChapter(1);
      s.getState().setPhase('map');
      s.getState().addVisitedLocation('bcn-market-boqueria');
    });
    cy.wait(300);
    getStore().then((s: any) => {
      const state = s.getState();
      expect(state.currentChapter).to.equal(1);
    });
  });

  // ── 11. Recap advances chapter for story chapters ──
  it('recap advances chapter for story chapters', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(0);
      s.getState().setPhase('recap');
      s.getState().addVisitedLocation('bcn-monument-casa-batllo');
    });
    cy.contains('Next Chapter', { matchCase: false }).should('be.visible');
    cy.contains('Next Chapter', { matchCase: false }).click();
    cy.wait(300);
    getStore().then((s: any) => {
      const state = s.getState();
      expect(state.currentChapter).to.equal(1);
    });
  });

  // ── 12. Store has all expected fields ──
  it('exposes game store with proper state', () => {
    cy.window().its('__GAME_STORE').should('exist');
    cy.window().then((win: any) => {
      const state = win.__GAME_STORE.getState();
      expect(state).to.have.property('phase');
      expect(state).to.have.property('currentChapter');
      expect(state).to.have.property('visitedLocationIds');
      expect(state).to.have.property('completedChapterIds');
      expect(state).to.have.property('stats');
      expect(state).to.have.property('time');
      expect(state).to.have.property('completedLocationActivities');
    });
  });

  // ── 13. Library location shows side activities ──
  it('library location shows activity buttons', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(1);
      s.getState().setCurrentLocation('bcn-library-central');
      s.getState().setPhase('location');
    });
    cy.contains('La Central del Raval', { timeout: 5000 }).should('be.visible');
    cy.contains('Study Scrolls').should('be.visible');
    cy.contains('Research').should('be.visible');
  });

  // ── 14. Cafe location shows side activities ──
  it('cafe location shows activity buttons', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(1);
      s.getState().setCurrentLocation('bcn-cafe-federal');
      s.getState().setPhase('location');
    });
    cy.contains('Federal Café', { timeout: 5000 }).should('be.visible');
    cy.contains('Fight').should('be.visible');
    cy.contains('Write').should('be.visible');
  });

  // ── 15. Park location shows side activities ──
  it('park location shows activity buttons', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(1);
      s.getState().setCurrentLocation('bcn-park-ciutadella');
      s.getState().setPhase('location');
    });
    cy.contains('Parc de la Ciutadella', { timeout: 5000 }).should('be.visible');
    cy.contains('Exercise').should('be.visible');
    cy.contains('Meditate').should('be.visible');
  });

  // ── 16. Clicking an activity opens mini-game modal ──
  it('opens mini-game modal from activity button', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(1);
      s.getState().setCurrentLocation('bcn-library-central');
      s.getState().setPhase('location');
    });
    cy.contains('La Central del Raval', { timeout: 5000 }).should('be.visible');
    cy.contains('Study Scrolls').click();
    // Mini-games are React components — modal header appears, no canvas
    cy.get('[aria-label="Close"]', { timeout: 3000 }).should('exist');
    cy.wait(300);
    cy.get('[aria-label="Close"]').click();
    cy.wait(300);
  });

  // ── 17. Mini-game modal opens and can be dismissed ──
  it('opens mini-game modal and can close without completing', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(1);
      s.getState().setCurrentLocation('bcn-park-ciutadella');
      s.getState().setPhase('location');
    });
    cy.contains('Parc de la Ciutadella', { timeout: 5000 }).should('be.visible');

    // Open exercise mini-game
    cy.contains('Exercise').click();
    cy.get('[aria-label="Close"]', { timeout: 3000 }).should('exist');

    // Close modal via the ✕ button
    cy.get('[aria-label="Close"]').click();
    cy.wait(300);

    // Game wasn't completed, so button should still be enabled
    cy.contains('button', 'Exercise').should('not.have.attr', 'disabled');
  });

  // ── 18. Activity can be marked done via store ──
  it('marks activity as done via store and shows disabled', () => {
    getStore().then((s: any) => {
      s.getState().setChapter(1);
      s.getState().setCurrentLocation('bcn-park-ciutadella');
      s.getState().setPhase('location');
    });
    cy.contains('Parc de la Ciutadella', { timeout: 5000 }).should('be.visible');

    // Mark exercise as completed directly via store
    cy.window().then((win: any) => {
      win.__GAME_STORE.getState().markLocationActivityComplete('bcn-park-ciutadella', 'park_exercise');
    });
    cy.wait(300);

    // Exercise should now be done (shows ✓) and disabled
    cy.contains('button', 'Exercise').should('have.attr', 'disabled');
    cy.contains('button', 'Exercise').find('.text-green-400').should('exist');
    // Meditate should still be enabled
    cy.contains('button', 'Meditate').should('not.have.attr', 'disabled');
  });
});
