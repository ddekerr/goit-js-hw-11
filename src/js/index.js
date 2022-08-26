import "simplelightbox/dist/simple-lightbox.min.css";
import SimpleLightbox from "simplelightbox";
import GalleryApi from "./GalleryApi";
import markup from "../templates/gallery-card.hbs"
import { Notify } from "notiflix";

// max count of images API can response
const IMAGES_LIMIT = 500;

// some references DOM elements
const refs = {
  searchForm: document.querySelector('.search-form'),
  galeryContainer: document.querySelector('.gallery'),
  observe: document.querySelector('.for-observer')
}

// instance of GalleryApi class
const gallery = new GalleryApi();
// create IntersectionObserver instance
const observer = new IntersectionObserver(updateImagesList, {root: null, rootMargin: "300px", treshold: 1});

let lightbox = null;
// event when serachForm submited
refs.searchForm.addEventListener('submit', onSearch);


/** 
 * function get the images object and render them to HTML
 * works only on first new request
 */
async function onSearch(e) {
  e.preventDefault();

  gallery.resetPage();
  gallery.resetImagesOnPage();

  // disable observer before gallery clean
  observer.unobserve(refs.observe);
  clearGalleryContainer();

  // value of input element which has 'searchQuery' name attribute
  const queryString = e.target.elements.searchQuery.value;

  try {
    // send request to host getting images
    await gallery.getImagesByQuery(queryString)
    .then(markupGalleryContainer)
    .catch(e => Notify.failure(e.message))

    // instance of Lightbox
    lightbox = new SimpleLightbox('.gallery__item', {showCounter: false});

    // enable observer
    observer.observe(refs.observe);
  } catch(e) {
    Notify.failure(e.message)
  } 
}


/**
 * function reconsidering up to the observered tag
 * and get next objects of the old request
 */
async function updateImagesList(entries) {
  if(entries[0].isIntersecting) {
    // when images limit done show notification and stop observe
    if(gallery.getImagesOnPage() >= IMAGES_LIMIT) {
      Notify.failure("We're sorry, but you've reached the end of search results.");
      observer.unobserve(refs.observe);
      return;
    }

    // even new request increase page and count images on page
    gallery.incrementPage();
    gallery.incrementImagesOnPage();

    try {
      // send request to get next part of object and render them lower 
      await gallery.getImagesByQuery().then(markupGalleryContainer);
    } catch(e) {
      Notify.failure(e.message)
    }

    // refresh instance lightbox to connect new images
    lightbox.refresh();
  }
}

function markupGalleryContainer(data) {
  refs.galeryContainer.insertAdjacentHTML('beforeend', markup(data));
}

function clearGalleryContainer () {
  refs.galeryContainer.innerHTML = "";
}
