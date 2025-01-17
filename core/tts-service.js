// File: core/tts-service.js
const ttsService = (() => {
  let ttsEnabled = true; // or pulled from clientMetadata
  let currentRate = 1;
  let selectedVoiceIndex = null;
  let isSpeaking = false;
  let currentUtterance = null;

  function initializeTTS() {
    // Optional initialization logic here.
    // e.g., pre-populate default rate or voice
  }

  function setTtsEnabled(value) {
    ttsEnabled = value;
    if (!value) cancelSpeech();
  }

  function getTtsEnabled() {
    return ttsEnabled;
  }

  /**
   * Allow the extension to set a custom speech rate (default: 1).
   * Range is typically 0.5 to 2 for practical usage.
   */
  function setSpeechRate(rate) {
    currentRate = rate;
  }

  /**
   * Allow the extension to set the voice index from the voice dropdown.
   * If `null` or "default", no explicit voice is set.
   */
  function setVoiceIndex(index) {
    if (typeof index === "number") {
      selectedVoiceIndex = index;
    } else {
      selectedVoiceIndex = null;
    }
  }

  function speakText(text) {
    if (!ttsEnabled) {
      console.log("TTS disabled. Not speaking text.");
      return;
    }
    if (!text) {
      console.warn("No text provided to speak.");
      return;
    }
    cancelSpeech(); // Cancel any existing speech

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;
    utterance.rate = currentRate;

    // Try assigning a custom voice if we have an index
    const voices = window.speechSynthesis.getVoices();
    if (selectedVoiceIndex !== null && voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }

    isSpeaking = true;

    utterance.onend = () => {
      isSpeaking = false;
      currentUtterance = null;
      // Optional: Fire a callback or event if you want to update UI status
    };

    speechSynthesis.speak(utterance);
  }

  function cancelSpeech() {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    isSpeaking = false;
    currentUtterance = null;
  }

  return {
    initializeTTS,
    setTtsEnabled,
    getTtsEnabled,
    setSpeechRate,
    setVoiceIndex,
    speakText,
    cancelSpeech,
  };
})();

export default ttsService;
