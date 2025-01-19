export const getGameAvatar = (gameTitle: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(gameTitle)}&background=BB86FC&color=1a0325&size=100&bold=true&uppercase=true`;
}; 