import { buildStubProvider } from "./_stub";

/**
 * Mock-Provider — wird in Code-Session 14 mit hochwertigen
 * Beispieltexten je Methode gefüllt. Aktuell ein Stub.
 */
export const mockProvider = buildStubProvider(
  "mock",
  "Mock-Provider-Methoden werden ab Code-Session 14 mit Beispieltexten befüllt.",
);
