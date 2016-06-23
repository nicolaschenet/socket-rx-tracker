const socket = window.io()
const events = ['load', 'unload', 'click', 'submit']

function emit (type) {
  socket.emit('user interaction', { type, time: +new Date() })
}

events.forEach(type => {
  window.addEventListener(type, event => {
    if (type === 'submit') event.preventDefault()
    emit(type)
  })
})
