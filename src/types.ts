export interface GameState {
  score: number;
  isGameOver: boolean;
  poopCount: number;
  ninjaEncounter: boolean;
}

export interface PlayerCustomization {
  photoUrl: string | null;
  loseSoundUrl: string | null;
  attackSoundUrl: string | null;
}
