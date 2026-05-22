const COLORS = ["red", "orangered", "orange", "gold", /*"yellow", */"lime", "green", "cyan", "blue", "purple", "pinkpurple", "magenta", "gray",];

export function createColorGenerator() {

  let colors = [...COLORS];

  const nextColor = (): string => {
    if (!colors.length) {colors = [...COLORS];}
    return colors.shift()!;
  };

  return { nextColor };
}
