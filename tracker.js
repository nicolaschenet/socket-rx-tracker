"use strict"

const io = require('socket.io')
const Rx = require('rxjs/Rx')

class Tracker {

  constructor (server) {
    this.io = io(server)
    this.inactivityDelay = 5000
  }

  start () {
    console.log('Tracker | Starting...')
    this.io.on('connection', socket => {
      console.log('Tracker | New connection !', socket.id, this.io.engine.clientsCount)
      this.startListening(socket)
      this.handleDisconnect(socket)
    })
  }

  startListening (socket) {
    // We'll use this array to store the interactions if a "burst" occurs
    // A "burst" is a set of interactions, separated by less than `inactivityDelay` ms
    let store = []

    // A stream of websocket events
    const interaction$ = Rx.Observable.create(observer => {
      socket.on('user interaction', interaction => {
        interaction.handshake = socket.handshake
        observer.next(interaction)
      })
    });

    /*
      `debounceTime` delays values emitted by the source Observable, but drops
      previous pending delayed emissions if a new value arrives on the source
      Observable. This operator keeps track of the most recent value from the
      source Observable, and emits that only when dueTime enough time has passed
      without any other value appearing on the source Observable.
      If a new value appears before dueTime silence occurs, the previous value
      will be dropped and will not be emitted on the output Observable.

      This is a rate-limiting operator, because it is impossible for more than
      one value to be emitted in any time window of duration dueTime, but it is
      also a delay-like operator since output emissions do not occur at the same
      time as they did on the source Observable.
    */
    const track$ = interaction$
      .debounceTime(this.inactivityDelay)
      .map(() => store)

    // For every interaction, feed the store
    const interactionSubscription = interaction$.subscribe(interaction => {
      store.push(interaction)
    })

    // `this.inactivityDelay` ms passed since the last interaction,
    // send all that to
    const trackSubscription = track$.subscribe(interactions => {
      console.log('\nInteractions to track (go go S3)', socket.id)
      console.log(interactions)

      // Empty store on track success
      store = []
    })
  }

  handleDisconnect (socket) {
    socket.on('disconnect', () => {
      console.log('SOCKET | Disconnected', socket.id, this.io.engine.clientsCount)
    })
  }
}

module.exports = Tracker
