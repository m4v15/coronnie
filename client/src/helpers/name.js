export default class Name {
  constructor(scene) {
    this.render = html => {
      var element = scene.add.dom(300, 0).createFromCache(html);
      element.addListener("click");
      element.on("click", function(event) {
        console.log(event);
        event.preventDefault();
        if (event.target.name === "playButton") {
          var inputText = this.getChildByName("nameField");

          //  Have they entered anything?
          if (inputText.value !== "") {
            //  Turn off the click events
            this.removeListener("click");

            //  Hide the login element
            this.setVisible(false);

            //  Populate the text with whatever they typed in
            scene.player.name = inputText.value;
            scene.socket.emit("newPlayer", scene.player);
          } else {
            //  Flash the prompt
            this.scene.tweens.add({
              targets: text,
              alpha: 0.2,
              duration: 250,
              ease: "Power3",
              yoyo: true
            });
          }
        }
      });
    };
  }
}
