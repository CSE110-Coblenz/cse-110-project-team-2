/**
 * Audio manager to handle the music for the game
 */

export class AudioManager{
    private audio: HTMLAudioElement;
    private musicEnabled = true;

    /**
     * 
     * @param src path to the audio file
     * @param volume volue level 0 - 1
     */
    constructor(src:string, volume = 0.5){
        this.audio = new Audio(src);
        this.audio.loop = true; // music keeps repeating
        this.audio.volume = volume; 
    }

    /**
     * Starts playback of game music
     */
    async musicStarted(){
        // if music is ON, start the audio
        if(!this.musicEnabled)
            return;

            try{
                // start playing if not already playing
                if(this.audio.paused) await this.audio.play(); 
            } catch {}
    }

    /**
     * turns background music on/off
     */
    setMusicEnabled(on: boolean){
        // default music on
        this.musicEnabled = on;

        if(on){
            this.musicStarted();
        } else {
            this.audio.pause();

            this.audio.currentTime = 0;
        }

    }

    isEnabled(){
        return this.musicEnabled;
    }

}
