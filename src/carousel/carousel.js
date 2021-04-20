import './carousel.scss'
import Card from '../card/card';

/**
 * Carousel options
 * @typedef {Object} CarouselOptions
 * @property {string} container - Carousel container ID
 * @property {string} title - Carousel title
 * @property {string} subtitle - Carousel subtitle
 * @property {string} icon - Carousel icon name
 */

/**
 * Carousel
 * @class
 * @typedef {Object} Carousel
 */
export default class Carousel {
    /**
     * Instantiate carousel
     * @param {CarouselOptions} options - Carousel configuration
     */
    constructor(options) {
		
		if (!options) {
			
			this._throwException('Options is mandatory');
			
			return;
		}
		
		if (!options.fetchCards || typeof options.fetchCards !== 'function') {
			
			this._throwException('Option fetchCards is mandatory and must be a function');
			
			return;
		}
		
        this._options = options;
        this._cards = [];
        this._appended = [];
		this._element = null;
		this._itemsMargin = 20;
        
        this._page = 1;
		this._nextElement = null;
        this._prevElement = null;
		this._maxChunkSize = 6;
        this._loaded = false;

        this._init();
    }
	
	/**
     * Get cards container
     * @returns {HTMLElement}
     */	
    get itemsContainer() {
		
        return  document.querySelector(`#${this._options.container} .carousel-content`);
    }
	
	/**
     * Get carousel options
     * @returns {CarouselOptions}
     */
	get options() {
		
        return this._options;
    }
	
	/**
     * Throw exception
     * @private
     * @param {string} message - The error message
     */
    _throwException(message) {
		
        console.error(message);
    }
	
	/**
     * Init carousel
     * @private
     * @async
     */
    async _init() {
		
		//Get carousel container element
        this._element = document.querySelector(`#${this._options.container}`);
        if (!this._element) {
			
			this._throwException('Container must be defined');
			
			return;
		}
		
		this._element.classList.add('carousel');

		//Create carousel header element
		const headerElement = document.createElement('div');
        headerElement.classList.add('carousel-header');

		//Create and append icon element to carousel header
        if (this._options.icon != null) {
			
            const iconElement = document.createElement('i');
            iconElement.classList.add('carousel-icon', 'material-icons-outlined');
            iconElement.append(this._options.icon);

            headerElement.append(iconElement);
        }

		//Create and append title element to carousel header
        if (this._options.title != null) {
			
            const titleElement = document.createElement('a');
            titleElement.classList.add('carousel-title');
            titleElement.append(`${this._options.title}`);

			//Set title href attribute
            if (this._options.link != null) {
				
                titleElement.setAttribute('href', this._options.link);
                titleElement.setAttribute('target', '_blank');
            }                

            this._appendArrowIcon(['carousel-title-icon', 'material-icons-outlined'], titleElement);
			
            headerElement.append(titleElement);
        }

		//Create and append subtitle element to carousel header
        if (this._options.subtitle != null) {
			
            const subtitleElement = document.createElement('span');
            subtitleElement.classList.add('carousel-subtitle');
            subtitleElement.append(this._options.subtitle);

            headerElement.append(subtitleElement);            
        }
		
		//Append carousel header element to carousel container
        this._element.append(headerElement);

		//Create carousel content element to carousel container
		const contentElement = document.createElement('div');
        contentElement.classList.add('carousel-content');

        this._element.append(contentElement);
		
        this._setMaxChunkSize();
		
		//Create and append next and prev elements to carousel content
        this._nextElement = document.createElement('div');
        this._nextElement.classList.add('controller', 'next-controller');
		this._appendArrowIcon(['controller-icon', 'material-icons-outlined'], this._nextElement);
        this._addClickListener(this._nextElement, () => this._next());
        
        this._prevElement = document.createElement('div');
        this._prevElement.classList.add('controller', 'prev-controller');
		this._appendArrowIcon(['controller-icon', 'material-icons-outlined'], this._prevElement);
        this._addClickListener(this._prevElement, () => this._previous());
		
        this.itemsContainer.append(this._nextElement);
		this.itemsContainer.append(this._prevElement);

        //Add listeners
        this._addResizeListener();
        this._addSwipeListener();

        await this._retriveCards(this._maxChunkSize);
        
		//Render current page cards
		this._renderCurrentPage();
    }
	
	/**
     * Create and append to parent node an arrow icon
     * @param {HTMLElement} parent - Node element to append icon
     * @private
     */
    _appendArrowIcon(classList, parent) {
		
        const arrowIcon = document.createElement('i');
        arrowIcon.classList.add(...classList);
        arrowIcon.append('keyboard_arrow_right');

		if (parent != null)
			parent.append(arrowIcon);
    }
	
	/**
     * Get if is the last page
     * @returns {boolean}
	 * @private
     */
    get _isLastPage() {
		
        return this._loaded && (this._page + 1) > this.totalPages;
    }
	
	/**
	 * Get total pages
	 * @returns {number}
	 */
    get totalPages() {
		
        return Math.ceil(this._cards.length / this._maxChunkSize);
    }

    /**
     * Go to the next page
     */
    next() {
		
        this._next();
    }

    /**
     * Go to the previous page
     */
    previous() {
		
        this._previous();
    }

    /**
     * Load next page
     * @private
     * @async
     */
    async _next() {
		
        if (!this._loaded && this._page === this.totalPages) {
			
			this._removeCurrentItems();
			
			await this._retriveCards(this._maxChunkSize);
		}
        
        if (this._isLastPage) return;

        this._page++;
		
        this._renderCurrentPage();
    }

    /**
     * Load previous page
     * @private
     */
    _previous() {
		
        if (this._page === 1) return;

        this._page--;
		
        this._renderCurrentPage();
    }
	
    /**
     * Render current page
     * @private
     */
    _renderCurrentPage() {

		//Calculate start and end indexes
	    const start = (this._page - 1) * this._maxChunkSize;
        const end = this._page * this._maxChunkSize;

		//Retrieve cards object
        this._appended = this._cards.slice(start, end);
		
		//Remove current cards elements
        this._removeCurrentItems();

		//Append current page cards
        this._appended.forEach(card => this._appendCard(card));
        
		if (this._page === 1)
			this._prevElement.classList.add('controller-hidden');
		else
			this._prevElement.classList.remove('controller-hidden');

        if (this._isLastPage)
			this._nextElement.classList.add('controller-hidden');
		else
			this._nextElement.classList.remove('controller-hidden');
    }

    /**
     * Retrieve cards from the server
     * @param {number} chunkSize
     * @param {boolean} [clearResults]
     * @private
     * @async
     */
    async _retriveCards(chunkSize, clearResults) {
		
		//Append placeholder cards
        let count = chunkSize;
        while (count) {
			
            this._appendPlaceholder();
			
            count--;
        }

        const cardsObject = await this._options.fetchCards(chunkSize);
        const cards = (cardsObject || []).map(card => new Card(card));

        if (!cards.length || cards.length < chunkSize)
            this._loaded = true;

        this._cards.push(...cards);
    }
	
	/**
     * Get card width
     * @returns {number}
     * @private
     */
    get _itemWidth() {
		
		return (this.itemsContainer.offsetWidth - ((this._maxChunkSize - 1) * this._itemsMargin)) / this._maxChunkSize;
    }

    /**
     * Append card
     * @param {Card} card - Card object
     * @private
     */
    _appendCard(card) {
		
        const cardElement = card.appendItem();
        cardElement.style.width = `${this._itemWidth}px`;

        this.itemsContainer.append(cardElement);
    }

    /**
     * Append placeholder
     * @private
     */
    _appendPlaceholder() {
		
		const configuration = {
            title: '',
            image: '',
            language: '',
			placeholder: true
		};
        const placeholder = new Card(configuration);
        const placeholderElement = placeholder.appendItem();
        placeholderElement.style.width = `${this._itemWidth}px`;

        this.itemsContainer.append(placeholderElement);
    }

    /**
     * Remove current cards
     * @private
     */
    _removeCurrentItems() {
		
        this.itemsContainer.querySelectorAll('.card').forEach(el => el.remove());
    }
	
	/**
     * Calculate max appended items
     * @private
     */
    _setMaxChunkSize() {
		
		let itemMinWidth = 300;

        this._maxChunkSize = Math.floor(this._element.offsetWidth / (itemMinWidth + this._itemsMargin));
    }

    /**
     * Add click listener
	 * @param {HTMLElement} controller
	 * @param {function} fn
     * @private
     */
    _addClickListener(controller, fn) {
		
        controller.addEventListener('click', (event) => { event.preventDefault; fn(); });
    }
	
	/**
     * Add window's resize listener
     * @private
     */
    _addResizeListener() {
		
        window.addEventListener('resize', () => this._onResize());
    }

    /**
     * Window's resize event listener
     * @private
     */
    async _onResize() {
		
        this._setMaxChunkSize();
        this._page = this._page > this.totalPages ? this.totalPages : this._page;
        
		if ((this._cards.length % this._maxChunkSize !== 0) && !this._loaded)
            await this._retriveCards(this._maxChunkSize - (this._cards.length % this._maxChunkSize));

        this._renderCurrentPage();
    }

    /**
     * Add touch and mouse swipe listener
     * @private
     */
    _addSwipeListener() {
		
        this.itemsContainer.addEventListener('touchstart', (event) => this._swipeStart(this._normalizeEvent(event)));
        this.itemsContainer.addEventListener('mousedown', (event) => this._swipeStart(this._normalizeEvent(event)));
        this.itemsContainer.addEventListener('touchmove', (event) => this._swipeMove(this._normalizeEvent(event)));
        this.itemsContainer.addEventListener('mousemove', (event) => this._swipeMove(this._normalizeEvent(event)));
        this.itemsContainer.addEventListener('touchend', (event) => this._swipeEnd(this._normalizeEvent(event)));
        this.itemsContainer.addEventListener('mouseup', (event) => this._swipeEnd(this._normalizeEvent(event)));
    }

    /**
     * Swipe start event callback
     * @private
     * @callback
     * @param {MouseEvent|Touch} event - Normalized event
     */
    _swipeStart(event) {
		
        this.startCoord = event.screenX;
    }

    /**
     * Swipe move event callback
     * @private
     * @callback
     * @param {MouseEvent|Touch} event - Normalized event
     */
    _swipeMove(event) {
		
        this.endCoord = event.screenX;
    }

    /**
     * Swipe end event callback
     * @private
     * @callback
     * @param {MouseEvent|Touch} event - Normalized event
     */
    _swipeEnd() {
		
        const delta = this.endCoord - this.startCoord;

        if (Math.abs(delta) < 90) return;

        delta < 0 ? this._next() : this.previous();
    }

    /**
     * Normalization touch and mouse events
     * @private
     * @param {MouseEvent|TouchEvent} event
     */
    _normalizeEvent(event) {
		
        return event.changedTouches ? event.changedTouches[0] : event;
    }
}