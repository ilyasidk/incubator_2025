document.addEventListener('click', (e)=>{
  if(e.target.matches('.like')){
    e.target.classList.toggle('active');
    const text = e.target.classList.contains('active') ? '❤ Нравится' : '❤ Нравится';
    // можно добавить счётчик или анимацию
  }
});
