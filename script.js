const boardEl = document.getElementById('board');
const status = document.getElementById('status');
const winXEl = document.getElementById('winX');
const winOEl = document.getElementById('winO');

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

let board, turn, gameOver, level = 'normal';
let winX = 0, winO = 0;

function reset() {
  board = Array(9).fill(null);
  turn = 'X';
  gameOver = false;
  render();
  setStatus();
}

function render() {
  boardEl.innerHTML = '';
  board.forEach((v, i) => {
    const c = document.createElement('button');
    c.className = 'cell' + (v ? ' ' + v.toLowerCase() : '');
    c.textContent = v || '';
    c.disabled = !!v || gameOver || turn === 'O';
    c.addEventListener('click', () => move(i, 'X'));
    boardEl.appendChild(c);
  });
  document.querySelector('.p-x').classList.toggle('turn', turn === 'X' && !gameOver);
  document.querySelector('.p-o').classList.toggle('turn', turn === 'O' && !gameOver);
}

function setStatus() {
  status.textContent = gameOver ? '' : (turn === 'X' ? '당신의 차례' : 'AI 생각 중...');
}

function move(i, p) {
  if (board[i] || gameOver) return;
  board[i] = p;
  const w = checkWin();
  render();
  if (w) return end(w);
  if (board.every(Boolean)) return end('draw');
  turn = p === 'X' ? 'O' : 'X';
  setStatus();
  if (turn === 'O') setTimeout(aiMove, 500);
}

function aiMove() {
  let i;
  if (level === 'easy')   i = randMove();
  else if (level === 'normal') i = smartMove();
  else                        i = bestMove('O');
  move(i, 'O');
}

function randMove() {
  const empty = board.map((v, i) => v ? -1 : i).filter((v) => v >= 0);
  return empty[Math.floor(Math.random() * empty.length)];
}

function smartMove() {
  // 1. AI 이기는 수
  for (let i = 0; i < 9; i++) {
    if (!board[i]) { board[i] = 'O'; if (checkWin()) { board[i] = null; return i; } board[i] = null; }
  }
  // 2. 플레이어 막기
  for (let i = 0; i < 9; i++) {
    if (!board[i]) { board[i] = 'X'; if (checkWin()) { board[i] = null; return i; } board[i] = null; }
  }
  // 3. 가운데 우선, 모서리 다음
  if (!board[4]) return 4;
  const corners = [0, 2, 6, 8].filter((i) => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return randMove();
}

function bestMove(player) {
  let bestScore = -Infinity, move = 0;
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    board[i] = player;
    const score = minimax(board, 0, false);
    board[i] = null;
    if (score > bestScore) { bestScore = score; move = i; }
  }
  return move;
}

function minimax(b, depth, isMax) {
  const w = winnerOf(b);
  if (w === 'O') return 10 - depth;
  if (w === 'X') return depth - 10;
  if (b.every(Boolean)) return 0;
  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = 'O'; best = Math.max(best, minimax(b, depth + 1, false)); b[i] = null;
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = 'X'; best = Math.min(best, minimax(b, depth + 1, true)); b[i] = null;
    }
    return best;
  }
}

function winnerOf(b) {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}

function checkWin() {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      line.forEach((i) => boardEl.children[i]?.classList.add('win'));
      return board[a];
    }
  }
  return null;
}

function end(result) {
  gameOver = true;
  if (result === 'X') { winX++; winXEl.textContent = winX; status.textContent = '🎉 당신 승리!'; }
  else if (result === 'O') { winO++; winOEl.textContent = winO; status.textContent = '💔 AI 승리'; }
  else status.textContent = '🤝 무승부';
  document.querySelector('.p-x').classList.remove('turn');
  document.querySelector('.p-o').classList.remove('turn');
}

document.getElementById('reset').addEventListener('click', reset);
document.querySelectorAll('.lv').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.lv').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    level = b.dataset.lv;
    reset();
  });
});

reset();
