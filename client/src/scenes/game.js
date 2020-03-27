import io from "socket.io-client";

import Card from "../helpers/card";
import Zone from "../helpers/zone";
import Dealer from "../helpers/dealer";
import Round from "../helpers/round";
import Name from "../helpers/name";

import deck from "../assets/deck.json";

export default class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game"
    });
  }

  preload() {
    this.load.html("nameform", "assets/nameform.html");
    this.load.html("numberform", "assets/numberform.html");
    deck.forEach(card => {
      this.load.image(card, `assets/cards/${card}.png`);
    });
  }

  create() {
    this.player = { id: 0, name: "", tricks: 0 };
    this.cardsPlayed = [];
    this.allCards = [];
    this.players = [];

    this.socket = io("https://coronnie.herokuapp.com");

    this.socket.on("connect", function() {
      console.log("Connected with id: " + self.socket.id);
      self.player.id = self.socket.id;
    });

    let self = this;

    this.zone = new Zone(this);
    this.dropZone = this.zone.renderZone();
    this.outline = this.zone.renderOutline(this.dropZone);

    this.dealer = new Dealer(this);
    this.round = new Round(this);

    this.name = new Name(this);
    this.name.render("nameform");

    this.dealText = this.add
      .text(75, 350, ["DEAL CARDS"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#cccccc")
      .setInteractive();

    this.dealText.on("pointerdown", function() {
      self.socket.emit("redeal");
      self.round.render("numberform");
    });

    this.dealText.on("pointerover", function() {
      self.dealText.setColor("#ff69b4");
    });

    this.dealText.on("pointerout", function() {
      self.dealText.setColor("#00ffff");
    });

    this.input.on("drag", function(pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("dragstart", function(pointer, gameObject) {
      gameObject.setTint(0xff69b4);
      self.children.bringToTop(gameObject);
    });

    this.input.on("dragend", function(pointer, gameObject, dropped) {
      gameObject.setTint();
      const dragStartX = gameObject.input.dragStartX;
      const dragStartY = gameObject.input.dragStartY;
      if (!dropped) {
        gameObject.x = dragStartX;
        gameObject.y = dragStartY;
      }
    });

    this.input.on("drop", function(pointer, gameObject, dropZone) {
      let sprite = gameObject.texture.key;
      dropZone.data.values.cards.push(sprite);
      gameObject.x = dropZone.x - 350 + dropZone.data.values.cards.length * 50;
      gameObject.y = dropZone.y;
      gameObject.disableInteractive();
      self.socket.emit("cardPlayed", gameObject, self.player.id);

      // self.undo = self.add
      //   .text(75, 600, ["UNDO"])
      //   .setFontSize(18)
      //   .setFontFamily("Trebuchet MS")
      //   .setColor("#cccccc")
      //   .setInteractive();

      // self.undo.on("pointerdown", function() {
      //   gameObject.x = 475;
      //   gameObject.y = 650;
      //   self.socket.emit("changeCard", sprite);
      // });

      // self.undo.on("pointerover", function() {
      //   self.undo.setColor("#ff69b4");
      // });

      // self.undo.on("pointerout", function() {
      //   self.undo.setColor("#00ffff");
      // });
    });

    var scores = self.add.text(
      200,
      10,
      "Players --- Tricks Won this round:\n",
      {
        color: "white",

        fontSize: "20px "
      }
    );

    this.socket.on("players", function(players) {
      var playersString = "Players --- Tricks Won this round:\n";
      self.players = players;
      self.players.forEach(player => {
        playersString += player.name + " --- " + player.tricks + "\n";
      });
      scores.setText(playersString, {
        color: "white",

        fontSize: "20px "
      });
    });

    this.socket.on("dealCards", function(hand) {
      self.dealer.dealCards(hand);
      self.allCards = [...self.allCards, ...hand];
      // self.dealText.disableInteractive();
    });

    this.socket.on("trumps", function(sprite) {
      self.allCards.push(sprite);
      console.log(self.allCards);
      let card = new Card(self);
      card
        .render(
          self.dropZone.x - 450 + self.dropZone.data.values.cards.length * 50,
          self.dropZone.y,
          sprite
        )
        .setName(sprite)
        .disableInteractive();
    });

    this.socket.on("cardPlayed", function(gameObject, playerId) {
      let sprite = gameObject.textureKey;
      self.cardsPlayed.push(sprite);
      self.allCards.push(sprite);
      if (playerId !== self.player.id) {
        self.dropZone.data.values.cards.push(sprite);
        console.log(self.dropZone);
        let card = new Card(self);
        card
          .render(
            self.dropZone.x - 350 + self.dropZone.data.values.cards.length * 50,
            self.dropZone.y,
            sprite
          )
          .setName(sprite)
          .disableInteractive();
      }
    });

    // this.socket.on("changeCard", function(badSprite) {
    //   let cancelled = self.children.getByName(badSprite);
    //   cancelled.destroy();
    // });

    this.claimText = this.add
      .text(125, 500, ["CLAIM TRICK"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#cccccc")
      .setInteractive();

    this.claimText.on("pointerdown", function() {
      self.player.tricks++;
      self.socket.emit("claimTrick", self.player);
    });

    this.socket.on("trickClaimed", function() {
      self.cardsPlayed.forEach(sprite => {
        self.children.getByName(sprite).destroy();
      });
      self.cardsPlayed = [];
    });

    this.socket.on("redeal", function() {
      self.allCards.forEach(sprite => {
        self.children.getByName(sprite).destroy();
      });
      self.cardsPlayed = [];
      self.cardsPlayed.forEach(sprite => {
        self.children.getByName(sprite).destroy();
      });
      self.cardsPlayed = [];
    });

    this.claimText.on("pointerover", function() {
      self.claimText.setColor("#ff69b4");
    });

    this.claimText.on("pointerout", function() {
      self.claimText.setColor("#00ffff");
    });
  }

  update() {}
}
