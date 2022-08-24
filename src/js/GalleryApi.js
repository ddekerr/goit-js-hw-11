const axios = require('axios').default;


export default class GalleryApi {
  // search query for request to API
  #searchQuery;
  // current page number 
  #page;
  // current count images on page
  #imagesOnPage;

  //Base URL for Pixaby Api
  PIXABY_API_URL = "https://pixabay.com/api/";

  //Private key for Pixaby Api
  PIXABY_API_KEY = "29094517-4eecc7a73a7fbfad4707a18db";

  // limit count of images in each response
  PER_PAGE = 40;

  constructor() {
    this.#searchQuery = '';
    this.#page = 1;
    this.#imagesOnPage = this.PER_PAGE;
  }

  /**
   * send request to Pixaby Api - https://pixabay.com/api/ with some parameters
   * and get array of objects if is ok
   * or Notify failure error if no images matching search query
   */
  getImagesByQuery(searchQuery = this.#searchQuery) {
    this.searchQuery = searchQuery;
    const errorMessage = "Sorry, there are no images matching your search query. Please try again.";

    // Request parameters
    const params = {
      key: this.PIXABY_API_KEY,
      q: this.#searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: this.#page,
      per_page: this.PER_PAGE
    }

    // send get request to API
    // if no response throwing error
    return axios.get(this.PIXABY_API_URL, {params}).then(response => {
      if(response.data.total === 0) {
        throw new Error(errorMessage);
      }
      return response.data.hits;
    });
  }

  // increase current count of images but less then 500
  incrementImagesOnPage() {
    this.#imagesOnPage += this.PER_PAGE;
    this.#imagesOnPage = this.#imagesOnPage > 500 ? 500 : this.#imagesOnPage;
  }

  resetImagesOnPage() {
    this.#imagesOnPage = this.PER_PAGE;
  }

  getImagesOnPage() {
    return this.#imagesOnPage;
  }

  incrementPage() {
    this.#page += 1;
  }

  resetPage() {
    this.#page = 1;
  }

  set searchQuery(query) {
    this.#searchQuery = query.trim();
  }

  get searchQuery() {
    return this.#searchQuery;
  }
}
