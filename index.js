window.addEventListener('scroll', function() {
    const helloImage = document.querySelector('.hello');
  const startSection = document.getElementById('start');

  // Ensure elements are found before proceeding
  if (!helloImage || !startSection) {
    return;
  }

  const startSectionHeight = startSection.offsetHeight;

  if (window.scrollY > startSectionHeight / 2) {
    helloImage.classList.add('hide');
  } else {
    helloImage.classList.remove('hide');
  }
  });
