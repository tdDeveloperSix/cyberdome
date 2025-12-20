/**
 * NOTE:
 * Gemini/LLM-integration er bevidst fjernet.
 * Denne service leverer nu udelukkende "fallback" tekster, så appen kan køre uden API-nøgler.
 */

const FALLBACK_SCENARIOS: string[] = [
  `THREAT LEVEL // HØJ
  Aalborg Havn rammes af et ransomware-angreb midt i en leverance til NATO. Sandpumperne står stille, og medierne efterlyser svar. Bestyrelsen får fem minutter til at godkende en udbetaling på 42 mio. kr. eller tage risikoen for et nationalt driftstop.`,
  `THREAT LEVEL // KRITISK
  En social engineering-kampagne rammer direktionssekretærerne. Kontraktdokumenter med offshore-partnere lækker på sociale medier. Finanspressen kræver forklaring, og Finanstilsynet beder om en redegørelse inden for en time.`,
  `THREAT LEVEL // FORHØJET
  Koncernens AI-model til kvalitetskontrol ændres ubemærket. Produktionslinjerne leverer fejlbehæftede komponenter, og kunderne blokerer betalinger. Ledelsen skal vælge mellem at stoppe produktionen eller sende en global tilbagekaldelse.`,
];

const FALLBACK_ROOM_LINES: Record<string, string> = {
  "Command Bridge":
    "Kommandobroen viser data fra hele organisationen på én gang. Skærme i 360 grader gør det let at se, hvor presset stiger.",
  "Server Core":
    "Kernen føles som et maskinrum i stormvejr. Lyd, lys og vibrationer gør det tydeligt hvornår tiden er ved at løbe ud.",
  "VR Lab":
    "VR-laboratoriet gør angrebet håndgribeligt. Deltagerne følger truslen som en enkel linje gennem virksomhedens nerver.",
};

const getFallbackScenario = () => {
  const index = Math.floor(Math.random() * FALLBACK_SCENARIOS.length);
  return FALLBACK_SCENARIOS[index];
};

const getFallbackRoomDescription = (roomName: string) =>
  FALLBACK_ROOM_LINES[roomName] ||
  `Rummet er sat op til at fortælle én historie ad gangen. Lys og lyd ændrer sig i takt med beslutningerne i ${roomName}.`;

export interface CrisisScenario {
  title: string;
  description: string;
  injects: string[];
  severity: 'Low' | 'Medium' | 'Critical';
}

/**
 * Generates a cyber crisis scenario to demonstrate the training capabilities.
 */
export const generateCrisisScenario = async (topic: string): Promise<string> => {
  try {
    // `topic` beholdes som parameter af kompatibilitet, men bruges ikke længere.
    void topic;
    return getFallbackScenario();
  } catch (error) {
    console.error("Scenario generator error:", error);
    return getFallbackScenario();
  }
};

/**
 * Acts as the "Center Architect" describing specific rooms based on user interest.
 */
export const describeRoomExperience = async (roomName: string): Promise<string> => {
   try {
    return getFallbackRoomDescription(roomName);
  } catch (error) {
    console.error("Room description error:", error);
    return getFallbackRoomDescription(roomName);
  }
}