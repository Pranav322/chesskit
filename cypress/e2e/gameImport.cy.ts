describe('Game Import Feature', () => {
  beforeEach(() => {
    // Visit the game import page
    cy.visit('/import-games');
    
    // Mock the authentication
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        uid: 'testUserId',
        email: 'test@example.com',
      }));
    });
  });

  it('should show validation errors for empty username', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Please enter a username').should('be.visible');
  });

  it('should show progress bar during import', () => {
    cy.get('input#username').type('validUsername');
    cy.get('select').first().select('lichess');
    cy.get('select').last().select('50');
    cy.get('button[type="submit"]').click();

    cy.get('.progress-bar').should('be.visible');
    cy.contains('Importing...').should('be.visible');
  });

  it('should handle invalid usernames', () => {
    cy.get('input#username').type('invalidUsername123456');
    cy.get('select').first().select('lichess');
    cy.get('button[type="submit"]').click();

    cy.contains('Invalid username').should('be.visible');
  });

  it('should disable form during import', () => {
    cy.get('input#username').type('validUsername');
    cy.get('button[type="submit"]').click();

    cy.get('input#username').should('be.disabled');
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('select').should('be.disabled');
  });
}); 