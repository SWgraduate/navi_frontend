/** 개인정보 수집 및 이용 동의 (Figma 1292-13450) */
export const PRIVACY_TERMS = {
  intro:
    "NAVI는 원활한 서비스 제공을 위해 다음과 같이 개인정보를 수집 및 이용합니다.",
  disclaimer:
    "* 귀하는 위와 같은 개인정보 수집 및 이용에 거부할 권리가 있으나, 거부시 서비스 이용이 제한될 수 있습니다.",
  table: {
    headers: ["수집 목적", "수집 항목", "보유 기간"],
    retention: "회원 탈퇴 시까지",
    rows: [
      {
        purpose: "회원 식별 및\n서비스 이용",
        items: "학번, 이름, 학과, 이메일, 비밀번호",
      },
      {
        purpose: "졸업 사정\n시뮬레이션",
        items: "입학년도, 이수 과목명, 학점, 성적, 이수 구분",
      },
      {
        purpose: "AI 맞춤형\n정보 제공",
        items: "관심 키워드, 서비스 이용 기록",
      },
    ],
  },
} as const;
