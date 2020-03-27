JSONdeck = require("./deck.json");

const shuffle = freshDeck => {
  const deck = [...freshDeck];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const deal = (cards, players) => {
  const shuffled = shuffle(JSONdeck);
  playerCards = Array.apply(null, Array(players)).map(() => []);
  for (let i = 0; i < cards; i++) {
    playerCards.forEach(hand => {
      const newCard = shuffled.shift();
      hand.push(newCard);
    });
  }
  const trumps = shuffled.shift();
  return {
    playerCards,
    trumps,
    remaining: shuffled
  };
};

module.exports = {
  deal
};
