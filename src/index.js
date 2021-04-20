import './styles/styles.scss'
import Carousel from './carousel/carousel'

/** @type {CarouselOptions} */
const options1 = {
    container: 'my-carousel',
    title: 'Fresh and just uploaded content',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: 'lightbulb',
    link: 'https://www.google.it/',
    fetchCards: async (chunkSize) => {
		
        return fetchCards(chunkSize);
    }
};

/** @type {Carousel} */
const carousel1 = new Carousel(options1);

/** @type {CarouselOptions} */
const options2 = {
    container: 'my-carousel2',
    title: 'Another carousel',
    subtitle: 'Aenean nec eros dapibus, imperdiet augue quis, vestibulum sem.',
    icon: 'face',
    link: 'https://www.google.it/',
    fetchCards: async (chunkSize) => {
		
        return fetchCards(chunkSize);
    }
};

/** @type {Carousel} */
const carousel2 = new Carousel(options2);

//Helper function to simulate the usage of a real REST API and introduce fake delays
async function fetchCards(chunkSize) {	

	const titles = ['Duis auctor elit ac arcu accumsan', 'Vestibulum posuere est ut metus pretium varius', ' Morbi ac mi mollis, dapibus augue eu, ullamcorper felis', 'Suspendisse vel elit nec diam efficitur eleifend vel ut risus'];
	const types = ['video', 'elearning', 'learning_plan', 'playlist'];
    const cardinality = ['single', 'collection'];    
	
	const delay =  10 + Math.round(Math.random() * 15);
    const max = 3 + Math.round(Math.random() * (chunkSize - 3));
    
	await new Promise(resolve => setTimeout(resolve, delay * 100));

	return Array(max).fill('').map(el => ({
        image: 'https://source.unsplash.com/random/700x350?sig=' + Math.round(Math.random() * 100),
        type: types[getRandomIntInclusive(0,3)],
        duration: 3600 + Math.round(Math.random() * 13200),
        title: titles[getRandomIntInclusive(0,3)],
        cardinality: cardinality[getRandomIntInclusive(0,1)],
        language: Math.random() >= 0.5 ? 'English' : null,
		placeholder: false
    }));
};

//Helper function to get a random integer between two values ​​with boundaries included
function getRandomIntInclusive(min, max) {
	
  min = Math.ceil(min);
  max = Math.floor(max);
  
  return Math.floor(Math.random() * (max - min + 1)) + min;
};