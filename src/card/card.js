import './card.scss'

/**
 * Card configuration
 * @typedef {Object} CardConfiguration
 * @property {CardType} type - Card type
 * @property {string} image - Card image
 * @property {CardCardinality} cardinality - Card cardinality
 * @property {string} title - Card title
 * @property {string} language - Card language
 * @property {number} duration - Card duration
 * @property {boolean} placeholder - Card placeholder
 */
 
 /**
 * Card type
 * @typedef CardType
 * @enum {string}
 * @property {string} elearning
 * @property {string} video
 * @property {string} learning_plan
 * @property {string} playlist
 */

/**
 * Card cardinality
 * @typedef CardCardinality
 * @enum {string}
 * @property {string} single
 * @property {string} collection
 */

/**
 * Card
 * @class
 */
export default class Card {
    /**
     * Instantiate a card
     * @param {CardConfiguration} configuration - Card configuration
     */
    constructor(configuration) {
		
        if (!configuration) return;

		/** @type {CardType} */
        this.type = configuration.type;
		/** @type {string} */
        this.image = configuration.image;
		/** @type {CardCardinality} */
        this.cardinality = configuration.cardinality;
         /** @type {string} */
        this.title = configuration.title;
		/** @type {string} */
        this.language = configuration.language;
        /** @type {number} */
        this.duration = configuration.duration;
		/** @type {boolean} */
        this.placeholder = configuration.placeholder;
    }

    /**
     * Get the element
     * @returns {HTMLElement}
     */
    get element() {
		
        return this._element;
    }

    /**
     * Create and return card element
     * @param {HTMLElement}
     * @returns {HTMLElement}
     */
    appendItem(parent) {
		
		//Create card container element
        this._element = document.createElement('div');
        this._element.classList.add('card');
		
        if (this.cardinality === 'collection') 
			this._element.classList.add('card-list');
		
		if (this.placeholder === true) 
			this._element.classList.add('card-placeholder');

		//Create and append card header element to card container
		const headerElement = document.createElement('div');
        headerElement.classList.add('card-header');

        if (this.image) {
			
			headerElement.style.background = `url(${this.image})`;
			headerElement.style.backgroundSize = 'cover';
		}

		//Create and append card type element to card header
        if (this.type != null) {
			
            const cardTypeElement = document.createElement('span');
            cardTypeElement.classList.add('card-type');            
			cardTypeElement.append(this.type.replace('_', ' '));

            headerElement.append(cardTypeElement);
        }

		//Create and append card duration element to card header
        if (this.duration != null) {
			
            const hours = Math.floor(this.duration / 3600);
            const minutes = Math.ceil(this.duration / 60) % 60;
            
			const durationElement = document.createElement('span');			
            durationElement.classList.add('card-duration');     
			durationElement.append(`${hours}h ${minutes}m`);

            headerElement.append(durationElement);
        }
		
		this._element.append(headerElement);
		
		//Create and append card content element to card container
		const contentElement = document.createElement('div');
        contentElement.classList.add('card-content');
        
		//Create and append card title element to card content
		if (this.title != null) {
			
			const titleElement = document.createElement('h4');
			titleElement.classList.add('card-title');
			titleElement.append(this.title);

			contentElement.append(titleElement);
		}

		//Create and append card language element to card content
        if (this.language != null) {
			
            const languageElement = document.createElement('span');
            languageElement.classList.add('card-lang');
            languageElement.append(this.language);

            contentElement.append(languageElement);
        }
		
		this._element.append(contentElement);

		//Append card element to parent node
        if (parent != null) 
			parent.append(this._element);
		
        return this._element;
    }
}