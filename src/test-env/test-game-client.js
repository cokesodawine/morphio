
const socket = io();

document.addEventListener('keydown', function(event) {
  let key = event.key;
  selection = document.getElementById('mySelection');
  if(key==='ArrowLeft'){
    console.log('left');
    socket.emit('left')
  }
  if(key==='ArrowRight'){
    console.log('right');
    socket.emit('right')
  }
});