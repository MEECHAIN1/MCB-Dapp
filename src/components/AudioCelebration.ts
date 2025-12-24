export default function celebration() {
  try {
    const audio = new Audio('/sounds/celebrate.mp3');
    audio.volume = 0.7;
    void audio.play();
  } catch (err) {
    // Don't break app if audio fails
    // eslint-disable-next-line no-console
    console.warn('🔇 Celebration sound failed:', err);
  }
}
