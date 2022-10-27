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
  // update endzones
  let player0 = document.getElementById('player0')
  player0.textContent = state.player0
  let player1 = document.getElementById('player1')
  player1.textContent = state.player1

  // update cups
  for (let cup of cups) {
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

  // whichCup = minimaxsearch(state, 5)
  // console.log(whichCup)
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
    let i = cup
    let dir = 1
    while (moving > 0) {
      i += 2 * dir
      if (i > 11) {
        newState.player0++
        i = 13
        dir = -1
        moving--
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

    if (newState.cups[i] != 1) {
      // dont go again
      newState.turn = 1
    } else {
      // you get to steal
      let x = newState.cups[i + 1]
      newState.cups[i + 1] = 0
      newState.cups[i] = 0
      newState.player0 += 1 + x
    }

  } else {
    // player 1 turn
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
        continue
      }

      newState.cups[i] += 1
      moving--
    }

    if (newState.cups[i] != 1) {
      // dont go again
      newState.turn = 0
    } else {
      // you get to steal
      let x = newState.cups[i - 1]
      newState.cups[i - 1] = 0
      newState.cups[i] = 0
      newState.player1 += 1 + x
    }
  }

  // check if this is a win state
  let sum0 = 0
  for (let i=0; i<12; i+=2) {
    sum0 += newState.cups[i]
  }
  let sum1 = 0
  for (let i=1; i<12; i+=2) {
    sum1 += newState.cups[i]
  }
  
  if (sum0 === 0 || sum1 === 0) {
    // player 0 is out of moves
    newState.player0 += sum0
    newState.player1 += sum1
    newState.isGoal = true
  }

  return newState
}

function reset() {
  applyState(initState)
  turn = 0
}

function getLegalMoves(state) {
  cups = []
  for (let i = 0; i<12; i++) {
    if (i % 2 == state.turn && state.cups[i] > 0) {
      cups.push(i)
    }
  }
  return cups
}

function minimaxsearch(state, depth) {
  if (state.turn == 0) {
    return maximize(state, depth)
  }
  if (state.turn == 1) {
    return minimize(state, depth)
  }
}

function minimize(state, depth) {
  if (state.isGoal || depth == 0) {
    return state.player0
  }

  let minScore = 100
  for (let cup of getLegalMoves(state)) {
    score = minimaxsearch(transition(state, cup), depth - 1)
    if (score < minScore) {
      minScore = score
    }
  }
  return minScore
}

function maximize(state, depth) {
  if (state.isGoal || depth == 0) {
    return state.player0
  }

  let maxScore = 0
  for (let cup of getLegalMoves(state)) {
    score = minimaxsearch(transition(state, cup), depth - 1)
    if (score > maxScore) {
      maxScore = score
    }
  }
  return maxScore
}