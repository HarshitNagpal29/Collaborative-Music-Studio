import * as Tone from 'tone';

// Define sound banks
const soundBanks = {
  synth: {
    type: 'synth',
    settings: {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 1
      }
    }
  },
  piano: {
    type: 'sampler',
    samples: {
      C4: '/samples/piano/C4.mp3',
      D4: '/samples/piano/D4.mp3',
      E4: '/samples/piano/E4.mp3',
      F4: '/samples/piano/F4.mp3',
      G4: '/samples/piano/G4.mp3',
      A4: '/samples/piano/A4.mp3',
      B4: '/samples/piano/B4.mp3',
    },
    options: {
      release: 1,
      baseUrl: '/samples/piano/'
    }
  },
  bass: {
    type: 'synth',
    settings: {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.4, 
        release: 1.5
      }
    }
  },
  drums: {
    type: 'noise',
    settings: {
      noise: { type: 'white' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0,
        release: 0.1
      }
    }
  }
};

// Create a synth instance based on instrument type
const createSynth = (instrumentId) => {
  const soundBank = soundBanks[instrumentId] || soundBanks.synth;
  let instrument;
  
  switch (soundBank.type) {
    case 'sampler':
      instrument = new Tone.Sampler(soundBank.samples, soundBank.options).toDestination();
      break;
    case 'noise':
      instrument = new Tone.NoiseSynth(soundBank.settings).toDestination();
      break;
    case 'synth':
    default:
      instrument = new Tone.PolySynth(Tone.Synth, soundBank.settings).toDestination();
      break;
  }
  
  return instrument;
};

// Get all available instruments
const getAvailableInstruments = () => {
  return Object.keys(soundBanks).map(id => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1)
  }));
};

export { createSynth, getAvailableInstruments };