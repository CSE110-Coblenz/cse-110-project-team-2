// Creating the MenuScreenModel class
export class MenuScreenModel{
    // Music state for the game
    private musicOn: boolean;

    /**
     * Set music playing to default True/on
     */
    constructor(){
        this.musicOn = true;
    }

    /**
     * Change the music from on to off/off to on
     */
    toggleMusic(){
        this.musicOn = !this.musicOn;
    }

    /**
     * Checks if music is on
     */

    isMusicOn(): boolean {
        return this.musicOn;
    }


}
    