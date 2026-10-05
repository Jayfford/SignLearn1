import React from 'react';
import SignDictionaryPage from '../components/SignDictionaryPage';

const greetingNames = [
  ['Hello', 'hello.png', 'Raise your hand near your forehead and move it outward once.'],
  ['Goodbye', 'goodbye.png', 'Raise your hand and wave side to side.'],
  ['Good Morning', 'good_morning.png', 'Combine GOOD with the rising-sun movement for MORNING.'],
  ['Good Afternoon', 'good_afternoon.png', 'Sign GOOD, then move your arm slightly downward.'],
  ['Good Evening', 'good_evening.png', 'Sign GOOD, then slide your flat hand downward.'],
  ['Good Night', 'good_night.png', 'Place one arm flat and move the other hand down like sunset.'],
  ['Yes', 'yes.png', 'Make a fist and nod it up and down.'],
  ['No', 'no.png', 'Tap your extended fingers to your thumb once.'],
  ['Please', 'please.png', 'Place an open hand on your chest and move it in a small circle.'],
  ['Thank You', 'thank_you.png', 'Touch your fingers to your chin and move your hand forward.'],
  ['Excuse', 'excuse.png', 'Rub one hand lightly across the palm of the other.'],
  ['Sorry', 'sorry.png', 'Make a fist and rub it in a circle on your chest.'],
  ['How are you', 'how_are_you.png', 'Use HOW, then point toward the person for YOU.'],
  ['Nice to Meet you', 'nice_to_meet_you.png', 'Sign NICE, MEET, then point to the person for YOU.'],
];

const greetingImages = [
  require('../../assets/images/hello.png'), require('../../assets/images/goodbye.png'), require('../../assets/images/good_morning.png'),
  require('../../assets/images/good_afternoon.png'), require('../../assets/images/good_evening.png'), require('../../assets/images/good_night.png'),
  require('../../assets/images/yes.png'), require('../../assets/images/no.png'), require('../../assets/images/please.png'),
  require('../../assets/images/thank_you.png'), require('../../assets/images/excuse.png'), require('../../assets/images/sorry.png'),
  require('../../assets/images/how_are_you.png'), require('../../assets/images/nice_to_meet_you.png'),
];

const greetings = greetingNames.map(([sign, file, instruction], index) => ({
  id: String(index + 1),
  sign,
  category: 'Greetings',
  instruction,
  image: greetingImages[index],
}));

export default function GreetingsMannersLesson() {
  return <SignDictionaryPage title="Sign Dictionary" subtitle="ASL gesture vector catalog" items={greetings} signKey="sign" imageKey="image" category="Greetings" lessonId="3" />;
}
