// Creating the MenuScreenModel class
export class MenuScreenModel{
    // Music state for the game
    private musicOn: boolean;
    // Sound effect state for the game
    private soundEffectsOn: boolean;

    /**
     * Set music playing to default True/on
     */
    constructor(){
        this.musicOn = true;
        this.soundEffectsOn = true;
    }

    /**
     * Change the music from on off to on/on to off
     */
    toggleMusic(){
        this.musicOn = !this.musicOn;
    }

    /**
     * Toggle Sound effects from on to off/ off to on
     */
    toggleSoundEffects(){
        this.soundEffectsOn = !this.soundEffectsOn;
    }

    /**
     * Checks if music is on
     */

    isMusicOn(): boolean {
        return this.musicOn;
    }

    /**
     * Checks if sound effects are on
     */
    isSoundEffectsOn(): boolean {
        return this.soundEffectsOn;
    }

}
    