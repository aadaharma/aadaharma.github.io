window.addEventListener('scroll', function() {
    const helloImage = document.querySelector('.hello');
    const personalTitle = document.getElementById('personal-title');
    const startSection = document.getElementById('start');
    const personalSection = document.getElementById('personal');
  
    if (!helloImage || !personalTitle || !startSection || !personalSection) {
        return;
      }

    const startSectionHeight = startSection.offsetHeight;
    const personalSectionTop = personalSection.offsetTop;
  
    if (window.scrollY > startSectionHeight / 2) {
      helloImage.classList.add('shrink');
      personalTitle.style.display = 'none';
    } else {
      helloImage.classList.remove('shrink');
      personalTitle.style.display = 'block';
    }
  });
