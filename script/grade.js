async function checkGrade() {
  // 점수를 입력받을 과목 목록
  var subjects = ["HTML", "CSS", "JavaScript"];

  var total = 0;

  for (var i = 0; i < subjects.length; i++) {
    var score =
      await openNumberModal({
        title: "성적 계산기",
        description: subjects[i] + " 점수를 입력해 주세요.",
        label: subjects[i] + " 점수",
        min: 0,
        max: 100,
        placeholder: "0 ~ 100"
      });

    if (score === null) {
      await openMessageModal({
        title: "계산 취소",
        message: "점수 입력이 취소되어 성적 계산을 종료합니다."
      });

      return;
    }

    total += score;
  }

  var average = total / subjects.length;

  var result = "";

  if (average >= 60) {
    result = "🎉 합격입니다! 우수자로 선정되었습니다.";
  } else {
    result = "❌ 불합격입니다. 다음 기회에 힘내세요!";
  }

  await openMessageModal({
    title: "📊 성적 결과표",
    description: "입력한 세 과목의 계산 결과입니다.",
    message: "• 총점: " + total + "점\n"
      + "• 평균: " + average.toFixed(1) + "점\n\n"
      + "• 결과: " + result
  });
}
