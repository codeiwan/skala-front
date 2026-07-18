async function startGame() {
  // 게임이 시작될 때마다 1~50 사이의 비밀 숫자를 만듭니다.
  var computerNum = Math.floor(Math.random() * 50) + 1;

  var count = 0;

  console.log("이번 판 컴퓨터의 비밀 숫자: " + computerNum);

  while (true) {
    var userGuess =
      await openNumberModal({
        title: "업다운 게임",
        description: "컴퓨터가 생각한 1부터 50 사이의 숫자를 맞혀 보세요.",
        label: "예상 숫자",
        min: 1,
        max: 50,
        placeholder: "1 ~ 50"
      });

    if (userGuess === null) {
      await openMessageModal({
        title: "게임 종료",
        message: "게임이 취소되었습니다."
      });

      return;
    }

    count = count + 1;

    if (userGuess === computerNum) {
      await openMessageModal({
        title: "🎉 정답입니다!",
        message: "축하합니다!\n👉 " + count + "번 만에 숫자를 맞혔습니다."
      });

      return;
    }

    if (userGuess > computerNum) {
      await openMessageModal({
        title: "Down!",
        message: "더 작은 숫자를 입력해 보세요.\n" + "(현재 " + count + "회 도전 중)"
      });
    } else {
      await openMessageModal({
        title: "Up!",
        message: "더 큰 숫자를 입력해 보세요.\n" + "(현재 " + count + "회 도전 중)"
      });
    }
  }
}