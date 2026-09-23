import React from 'react';
import SignDictionaryPage from '../components/SignDictionaryPage';

const numberImages = [
  require('../../assets/images/1.png'), require('../../assets/images/2.png'), require('../../assets/images/3.png'),
  require('../../assets/images/4.png'), require('../../assets/images/5.png'), require('../../assets/images/6.png'),
  require('../../assets/images/7.png'), require('../../assets/images/8.png'), require('../../assets/images/9.png'),
  require('../../assets/images/10.png'), require('../../assets/images/11.png'), require('../../assets/images/12.png'),
  require('../../assets/images/13.png'), require('../../assets/images/14.png'), require('../../assets/images/15.png'),
];

const numbers = Array.from({ length: 15 }, (_, index) => ({
  id: String(index + 1),
  number: String(index + 1),
  category: 'Numbers',
  instruction: `Practice the number ${index + 1} handshape with your palm facing the camera.`,
  image: numberImages[index],
}));

export default function NumbersLesson() {
  return <SignDictionaryPage title="Sign Numbers" subtitle="Handshape number catalog" items={numbers} signKey="number" imageKey="image" category="Numbers" />;
}
