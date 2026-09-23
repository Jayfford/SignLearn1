import React from 'react';
import SignDictionaryPage from '../components/SignDictionaryPage';

const letterImages = [
  require('../../assets/images/A.png'), require('../../assets/images/B.png'), require('../../assets/images/C.png'),
  require('../../assets/images/D.png'), require('../../assets/images/E.png'), require('../../assets/images/F.png'),
  require('../../assets/images/G.png'), require('../../assets/images/H.png'), require('../../assets/images/I.png'),
  require('../../assets/images/J.png'), require('../../assets/images/K.png'), require('../../assets/images/L.png'),
  require('../../assets/images/M.png'), require('../../assets/images/N.png'), require('../../assets/images/O.png'),
  require('../../assets/images/P.png'), require('../../assets/images/Q.png'), require('../../assets/images/R.png'),
  require('../../assets/images/S.png'), require('../../assets/images/T.png'), require('../../assets/images/U.png'),
  require('../../assets/images/V.png'), require('../../assets/images/W.png'), require('../../assets/images/X.png'),
  require('../../assets/images/Y.png'), require('../../assets/images/Z.png'),
];

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, index) => ({
  id: letter,
  letter,
  category: 'Alphabet',
  instruction: `Practice the ${letter} handshape slowly, keeping your palm and fingers clearly positioned.`,
  image: letterImages[index],
}));

export default function AlphabetLesson() {
  return <SignDictionaryPage title="Sign Alphabet" subtitle="ASL gesture vector catalog" items={letters} signKey="letter" imageKey="image" category="Alphabet" />;
}
