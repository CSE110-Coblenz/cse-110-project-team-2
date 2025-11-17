
export const FONTS = {
    GAME_TITLE: "NeueMachinaBold",
    HEADER: "NeueMachinaBold",
    SUBHEADER: "FreshJerukiTrial",
    BUTTON: "NeueMachinaRegular",
    BODY: "NeueMachinaRegular",
  } as const;
  

  // load the fonts
  export async function loadFonts(): Promise<void> {
    if (typeof document === "undefined" || typeof FontFace === "undefined") {
      return;
    }
  
    try {
      const font = new FontFace(
        "NeueMachinaBold",
        "url(/fonts/NeueMachina-Ultrabold.otf)"
      );
  
      const loaded = await font.load();
      (document as any).fonts.add(loaded);
  
      console.log("Fonts loaded");
    } catch (err) {
      console.error("Fonts not loaded", err);
    }
  }
  