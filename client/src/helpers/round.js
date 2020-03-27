export default class Round {
  constructor(scene) {
    this.render = html => {
      var round = scene.add.text(600, 40, "Please enter the round number", {
        color: "white",
        fontSize: "20px "
      });

      var element = scene.add.dom(300, 0).createFromCache(html);
      element.addListener("click");
      element.on("click", function(event) {
        event.preventDefault();

        if (event.target.name === "playButton") {
          var inputText = this.getChildByName("roundField");

          //  Have they entered anything?
          if (inputText.value !== "") {
            //  Turn off the click events
            this.removeListener("click");

            //  Hide the login element
            this.setVisible(false);

            //  Populate the text with whatever they typed in
            round.setText("Round Number " + inputText.value);
            scene.socket.emit("dealCards", inputText.value);
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
