let cups = document.getElementsByClassName('cup')
let running = false
let currState = {}

let initState = {
  player1: 0,
  player0: 0,
  turn: 0,
  cups: Array(12).fill(4),
  isGoal: false
}

for (let cup of cups) {
  cup.addEventListener('click', cup_clicked)
}

window.onload = reset()

function applyState(state) {
  // console.log(state)
  // update endzones
  let player0 = document.getElementById('player0')
  player0.textContent = state.player0
  let player1 = document.getElementById('player1')
  player1.textContent = state.player1

  // update cups
  for (let cup of cups) {
    cup.classList.remove('suggested')
    cup.textContent = state.cups[parseInt(cup.id)]
  }

  if (currState.isGoal) {
    if (currState.player1 > currState.player0) {
      console.log('Player 1 Wins!')
    } else {
      console.log('Player 0 Wins!')
    }
  }

  currState = state

  whichCup = minimaxsearch(state, 8)[1]
  console.log(whichCup)


  // highlight that cup
  cups[whichCup].classList.add('suggested')
}


function cup_clicked(event) {
  let cup = parseInt(event.target.id)
  // player 0 turn
  if (cup % 2 == currState.turn) {

    // make sure there are beads in that cup
    if (currState.cups[cup] == 0) {
      console.log('Illegal Move: no beads present')
      return
    }

    applyState(transition(currState, parseInt(cup)))

  } else {
    console.log('not that players turn')
  }
}

function transition(state, cup) {
  if (state.isGoal) {
    return state
  }

  let newState = structuredClone(state)
  let moving = newState.cups[cup]

  newState.cups[cup] = 0

  if (cup % 2 == 0) {
    // player 0 turn
    newState.turn = 1

    let i = cup
    let dir = 1
    while (moving > 0) {
      i += 2 * dir
      if (i > 11) {
        newState.player0++
        i = 13
        dir = -1
        moving--
        if (moving === 0) {
          newState.turn = 0
        }
        continue
      }
      if (i < 0) {
        i = -2
        dir = 1
        continue
      }

      newState.cups[i] += 1
      moving--
    }

    let lastCup = i + 1
    if (newState.cups[i] === 1 && newState.cups[lastCup] && i % 2 === 0) {
      // you get to steal
      let x = newState.cups[lastCup]
      newState.cups[lastCup] = 0
      newState.cups[i] = 0
      newState.player0 += 1 + x
    }

  } else {
    // player 1 turn
    newState.turn = 0

    let i = cup
    let dir = -1
    while (moving > 0) {
      i += 2 * dir
      if (i > 11) {
        i = 13
        dir = -1
        continue
      }
      if (i < 0) {
        newState.player1++
        i = -2
        dir = 1
        moving--

        if (moving === 0) {
          newState.turn = 1
        }
        continue
      }

      newState.cups[i] += 1
      moving--
    }

    if (newState.cups[i] === 1 && i % 2 === 1) {
      // you get to steal
      let lastCup = i - 1
      let x = newState.cups[lastCup]
      newState.cups[lastCup] = 0
      newState.cups[i] = 0
      newState.player1 += 1 + x
    }
  }

  // check if this is a win state
  let sum0 = 0
  for (let i = 0; i < 12; i += 2) {
    sum0 += newState.cups[i]
  }
  let sum1 = 0
  for (let i = 1; i < 12; i += 2) {
    sum1 += newState.cups[i]
  }

  if (sum0 === 0 || sum1 === 0) {
    // player 0 is out of moves
    newState.player0 += sum0
    newState.player1 += sum1
  }

  if (newState.player0 > 24 || newState.player1 > 24) {
    newState.isGoal = true
  }

  return newState
}

function reset() {
  applyState(initState)
  turn = 0
}

function getLegalMoves(state) {
  let moves = []
  for (let i = 0; i < 12; i++) {
    if (i % 2 == state.turn && state.cups[i] > 0) {
      moves.push(i)
    }
  }
  return moves
}

function minimaxsearch(state, depth, alpha, beta) {
  if (depth == 0 || state.isGoal) {
    return [state.player0 - state.player1]
  }

  let value = 0
  let bestMove = -1
  let legalMoves = getLegalMoves(state)

  // if player0's turn
  if (state.turn === 0) {
    value = -100000000
    for (let move of legalMoves) {
      result = minimaxsearch(transition(state, move), depth - 1, alpha, beta)[0]
      if (result > value) {
        value = result
        bestMove = move
      }
      if (value >= beta) {
        break
      } else {
        if (value > alpha) {
          alpha = value
        }
      }
    }
  }

  // if player1's turn
  if (state.turn === 1) {
    value = 100000000
    for (let move of legalMoves) {
      result = minimaxsearch(transition(state, move), depth - 1, alpha, beta)[0]
      if (result < value) {
        value = result
        bestMove = move
      }
      if (value <= alpha) {
        break
      } else {
        if (value < beta) {
          beta = value
        }
      }
    }
  }


  return [value, bestMove]
}