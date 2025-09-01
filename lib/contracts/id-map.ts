// ID mapping system to handle conversion between UI string IDs and blockchain uint256 IDs

export interface ElectionIdMap {
  uiElectionId: string;
  onchainElectionId: bigint;
}

export interface PositionIdMap {
  uiPositionId: string;
  onchainPositionId: bigint;
}

export interface CandidateIdMap {
  uiCandidateId: string;
  onchainCandidateId: bigint;
}

// In-memory storage for ID mappings
let electionMappings: ElectionIdMap[] = [];
let positionMappings: PositionIdMap[] = [];
let candidateMappings: CandidateIdMap[] = [];

// Storage keys for localStorage persistence
const STORAGE_KEYS = {
  ELECTIONS: 'blockchain_election_mappings',
  POSITIONS: 'blockchain_position_mappings',
  CANDIDATES: 'blockchain_candidate_mappings',
} as const;

// Initialize mappings from localStorage if available
function initializeMappings(): void {
  if (typeof window === 'undefined') return;

  try {
    const storedElections = localStorage.getItem(STORAGE_KEYS.ELECTIONS);
    if (storedElections) {
      const parsed = JSON.parse(storedElections);
      electionMappings = parsed.map((item: any) => ({
        uiElectionId: item.uiElectionId,
        onchainElectionId: BigInt(item.onchainElectionId),
      }));
    }

    const storedPositions = localStorage.getItem(STORAGE_KEYS.POSITIONS);
    if (storedPositions) {
      const parsed = JSON.parse(storedPositions);
      positionMappings = parsed.map((item: any) => ({
        uiPositionId: item.uiPositionId,
        onchainPositionId: BigInt(item.onchainPositionId),
      }));
    }

    const storedCandidates = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    if (storedCandidates) {
      const parsed = JSON.parse(storedCandidates);
      candidateMappings = parsed.map((item: any) => ({
        uiCandidateId: item.uiCandidateId,
        onchainCandidateId: BigInt(item.onchainCandidateId),
      }));
    }
  } catch (error) {
    console.warn('Failed to load ID mappings from localStorage:', error);
    // Reset to empty arrays on error
    electionMappings = [];
    positionMappings = [];
    candidateMappings = [];
  }
}

// Persist mappings to localStorage
function persistMappings(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      STORAGE_KEYS.ELECTIONS,
      JSON.stringify(
        electionMappings.map((item) => ({
          uiElectionId: item.uiElectionId,
          onchainElectionId: item.onchainElectionId.toString(),
        }))
      )
    );

    localStorage.setItem(
      STORAGE_KEYS.POSITIONS,
      JSON.stringify(
        positionMappings.map((item) => ({
          uiPositionId: item.uiPositionId,
          onchainPositionId: item.onchainPositionId.toString(),
        }))
      )
    );

    localStorage.setItem(
      STORAGE_KEYS.CANDIDATES,
      JSON.stringify(
        candidateMappings.map((item) => ({
          uiCandidateId: item.uiCandidateId,
          onchainCandidateId: item.onchainCandidateId.toString(),
        }))
      )
    );
  } catch (error) {
    console.warn('Failed to persist ID mappings to localStorage:', error);
  }
}

// Validation helpers
function isValidUiId(uiId: string): boolean {
  return typeof uiId === 'string' && uiId.trim().length > 0;
}

function isValidOnchainId(onchainId: bigint): boolean {
  try {
    return typeof onchainId === 'bigint' && onchainId >= 0n;
  } catch {
    return false;
  }
}

// Election ID mapping functions
export function getOnchainElectionId(uiId: string): bigint | null {
  if (!isValidUiId(uiId)) {
    console.error('Invalid UI election ID:', uiId);
    return null;
  }

  const mapping = electionMappings.find((m) => m.uiElectionId === uiId);
  return mapping ? mapping.onchainElectionId : null;
}

export function addElectionMapping(uiId: string, onchainId: bigint): void {
  if (!isValidUiId(uiId)) {
    throw new Error(`Invalid UI election ID: ${uiId}`);
  }

  if (!isValidOnchainId(onchainId)) {
    throw new Error(`Invalid onchain election ID: ${onchainId}`);
  }

  // Remove existing mapping for this UI ID if it exists
  electionMappings = electionMappings.filter((m) => m.uiElectionId !== uiId);

  // Add new mapping
  electionMappings.push({ uiElectionId: uiId, onchainElectionId: onchainId });

  // Persist to localStorage
  persistMappings();
}

// Position ID mapping functions
export function getOnchainPositionId(uiId: string): bigint | null {
  if (!isValidUiId(uiId)) {
    console.error('Invalid UI position ID:', uiId);
    return null;
  }

  const mapping = positionMappings.find((m) => m.uiPositionId === uiId);
  return mapping ? mapping.onchainPositionId : null;
}

export function addPositionMapping(uiId: string, onchainId: bigint): void {
  if (!isValidUiId(uiId)) {
    throw new Error(`Invalid UI position ID: ${uiId}`);
  }

  if (!isValidOnchainId(onchainId)) {
    throw new Error(`Invalid onchain position ID: ${onchainId}`);
  }

  // Remove existing mapping for this UI ID if it exists
  positionMappings = positionMappings.filter((m) => m.uiPositionId !== uiId);

  // Add new mapping
  positionMappings.push({ uiPositionId: uiId, onchainPositionId: onchainId });

  // Persist to localStorage
  persistMappings();
}

// Candidate ID mapping functions
export function getOnchainCandidateId(uiId: string): bigint | null {
  if (!isValidUiId(uiId)) {
    console.error('Invalid UI candidate ID:', uiId);
    return null;
  }

  const mapping = candidateMappings.find((m) => m.uiCandidateId === uiId);
  return mapping ? mapping.onchainCandidateId : null;
}

export function addCandidateMapping(uiId: string, onchainId: bigint): void {
  if (!isValidUiId(uiId)) {
    throw new Error(`Invalid UI candidate ID: ${uiId}`);
  }

  if (!isValidOnchainId(onchainId)) {
    throw new Error(`Invalid onchain candidate ID: ${onchainId}`);
  }

  // Remove existing mapping for this UI ID if it exists
  candidateMappings = candidateMappings.filter((m) => m.uiCandidateId !== uiId);

  // Add new mapping
  candidateMappings.push({ uiCandidateId: uiId, onchainCandidateId: onchainId });

  // Persist to localStorage
  persistMappings();
}

// Utility functions for debugging and management
export function getAllElectionMappings(): ElectionIdMap[] {
  return [...electionMappings];
}

export function getAllPositionMappings(): PositionIdMap[] {
  return [...positionMappings];
}

export function getAllCandidateMappings(): CandidateIdMap[] {
  return [...candidateMappings];
}

export function clearAllMappings(): void {
  electionMappings = [];
  positionMappings = [];
  candidateMappings = [];

  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.ELECTIONS);
    localStorage.removeItem(STORAGE_KEYS.POSITIONS);
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
  }
}

export function clearElectionMappings(): void {
  electionMappings = [];
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.ELECTIONS);
  }
}

export function clearPositionMappings(): void {
  positionMappings = [];
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.POSITIONS);
  }
}

export function clearCandidateMappings(): void {
  candidateMappings = [];
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
  }
}

// Reverse lookup functions (blockchain ID to UI ID)
export function getUiElectionId(onchainId: bigint): string | null {
  if (!isValidOnchainId(onchainId)) {
    console.error('Invalid onchain election ID:', onchainId);
    return null;
  }

  const mapping = electionMappings.find((m) => m.onchainElectionId === onchainId);
  return mapping ? mapping.uiElectionId : null;
}

export function getUiPositionId(onchainId: bigint): string | null {
  if (!isValidOnchainId(onchainId)) {
    console.error('Invalid onchain position ID:', onchainId);
    return null;
  }

  const mapping = positionMappings.find((m) => m.onchainPositionId === onchainId);
  return mapping ? mapping.uiPositionId : null;
}

export function getUiCandidateId(onchainId: bigint): string | null {
  if (!isValidOnchainId(onchainId)) {
    console.error('Invalid onchain candidate ID:', onchainId);
    return null;
  }

  const mapping = candidateMappings.find((m) => m.onchainCandidateId === onchainId);
  return mapping ? mapping.uiCandidateId : null;
}

// Initialize mappings when module loads
initializeMappings();