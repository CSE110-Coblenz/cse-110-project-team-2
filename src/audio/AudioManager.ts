/**
 * Audio manager to handle the music for the game
 */

export class AudioManager{
    private audio: HTMLAudioElement;
    private musicEnabled = true;

    // Sound effects 
    private sfxEnabled = true;
    private sfxVolume = 1;
    private sfx: Record<string, HTMLAudioElement> = {};

    /**
     * 
     * @param src path to the audio file
     * @param volume volue level 0 - 1
     */
    constructor(src:string, volume = 0.5, loop = true){
        this.audio = new Audio(src);
        this.audio.loop = loop; // can be set to false for sound effects
        this.audio.volume = volume; 
    }

    /**
     * 
     * Plays the audio from the start
     */
    async play() {
        if (!this.musicEnabled) return;
        try {
            this.audio.currentTime = 0; // restart from start
            await this.audio.play();
        } catch (e) {
            console.warn("Audio play failed:", e);
        }
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


    // SFX
    
    //    Registers the sfx files at startup
    
    registerSfx(name: string, src: string){
        const effects  = new Audio(src);
        effects.preload = "auto";
        this.sfx[name] = effects;
    }

    // Play a named sfx if sound effects enabled
    playSfx(name: string){
        if (!this.sfxEnabled) return;
        const effects = this.sfx[name];
        if(!effects) return;
        // allows overlapping plays
        const inst = effects.cloneNode(true) as HTMLAudioElement;
        inst.volume = this.sfxVolume;

        // autoplay errors
        inst.play().catch(() => {} );
    }

    setSfxEnabled(on: boolean){
        this.sfxEnabled = on;
    }


}
