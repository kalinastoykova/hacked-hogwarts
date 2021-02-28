"use strict"

//! code taken from w3c, modernize later on
let slideshowStart = 0;
doSlideshow();

function doSlideshow() {
  let i;
  let x = document.getElementsByClassName("mySlides");

  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";  
  }
  slideshowStart++;
  if (slideshowStart > x.length) {
      slideshowStart = 1
    }    
  x[slideshowStart-1].style.display = "block";  
  setTimeout(doSlideshow, 5000);
}

