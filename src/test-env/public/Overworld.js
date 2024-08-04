class Overworld {
 constructor(config) {
   this.element = config.element;
   this.canvas = this.element.querySelector(".game-canvas");
   this.ctx = this.canvas.getContext("2d");
 }

 init() {
   const image = new Image();
   image.onload = () => {
     this.ctx.drawImage(image,-1,-1)
   };
   image.src = "/public/StreetNorthLower.png";


   const x = 10;
   const y = 10;

   //const shadow = new Image();
   //shadow.onload = () => {
   // this.ctx.drawImage(
   //   shadow, 
   //   0, //left cut 
   //   0, //top cut,
   //   32, //width of cut
   //   32, //height of cut
   //   x * 16 - 8,
   //   y * 16 - 18,
   //   32,
   //   32
   //)
   //}
   //shadow.src = "/01-pizza-legends-intro/images/characters/shadow.png";


  const hero = new Image();
  hero.onload = () => {
    this.ctx.drawImage(
      hero, 
      0, //left cut 
      0, //top cut,
      32, //width of cut
      32, //height of cut
      x * 16 - 8,
      y * 16 - 8,
      32,
      32
   )
  }
  hero.src = "/public/hero.png";


 }

}