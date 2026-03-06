import { type Language } from "@/lib/i18n-storage";

interface PrivacyTermsRow {
  purpose: string;
  items: string;
}

interface PrivacyTerms {
  intro: string;
  disclaimer: string;
  table: {
    headers: [string, string, string];
    retention: string;
    rows: PrivacyTermsRow[];
  };
}

/** 개인정보 수집 및 이용 동의 (Figma 1292-13450) */
export const PRIVACY_TERMS: Record<Language, PrivacyTerms> = {
  ko: {
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
  },
  en: {
    intro:
      "NAVI collects and uses personal information as follows to provide the service smoothly.",
    disclaimer:
      "* You have the right to refuse the collection and use of personal information described above. However, if you refuse, your use of the service may be restricted.",
    table: {
      headers: ["Purpose", "Data Collected", "Retention Period"],
      retention: "Until account deletion",
      rows: [
        {
          purpose: "Member identification\nand service use",
          items: "Student ID, name, major, email, password",
        },
        {
          purpose: "Graduation review\nsimulation",
          items: "Admission year, completed course names, credits, grades, completion category",
        },
        {
          purpose: "AI-personalized\ninformation delivery",
          items: "Interest keywords, service usage history",
        },
      ],
    },
  },
  zh: {
    intro:
      "NAVI 为了顺利提供服务，将按如下方式收集和使用个人信息。",
    disclaimer:
      "* 您有权拒绝上述个人信息的收集与使用，但若拒绝，可能会限制您使用本服务。",
    table: {
      headers: ["收集目的", "收集项目", "保留期限"],
      retention: "至注销会员时止",
      rows: [
        {
          purpose: "会员识别及\n服务使用",
          items: "学号、姓名、专业、电子邮箱、密码",
        },
        {
          purpose: "毕业审查\n模拟",
          items: "入学年份、已修课程名称、学分、成绩、修读分类",
        },
        {
          purpose: "AI 个性化\n信息提供",
          items: "兴趣关键词、服务使用记录",
        },
      ],
    },
  },
};
