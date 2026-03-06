import { type Language } from "@/lib/i18n-storage";

interface PrivacyPolicyItemsSection {
  title: string;
  items: string[];
}

interface PrivacyPolicyBodySection {
  title: string;
  body: string;
  contactEmail?: string;
  bodyEnd?: string;
}

type PrivacyPolicySection = PrivacyPolicyItemsSection | PrivacyPolicyBodySection;

/** NAVI 개인정보 처리방침 (Figma 1861-10421) */
export const PRIVACY_POLICY_SECTIONS: Record<Language, PrivacyPolicySection[]> = {
  ko: [
    {
      title: "제1조 (개인정보의 수집 및 이용 목적)",
      items: [
        "회원 가입 및 본인 식별, 원활한 서비스 이용 환경 제공",
        "학업 성취도 분석 및 졸업 사정 시뮬레이션 결과 제공",
        "AI 기반 맞춤형 캠퍼스 정보 챗봇 서비스 제공 및 품질 향상",
      ],
    },
    {
      title: "제2조 (수집하는 개인정보의 항목 및 수집 방법)",
      items: [
        "필수 수집 항목: 학번, 이름, 소속 학과, 이메일 주소, 비밀번호",
        "서비스 이용 과정에서 생성/수집되는 정보: OCR 데이터 처리를 위해 업로드된 수강신청 내역 또는 성적표 이미지 (텍스트 추출 후 원본 이미지 즉시 파기)",
        "AI 챗봇 이용 과정에서 입력한 관심 키워드 및 대화 내용",
        "접속 로그, 서비스 이용 기록",
      ],
    },
    {
      title: "제3조 (개인정보의 처리 및 보유 기간)",
      items: [
        "이용자의 개인정보는 원칙적으로 회원 탈퇴 시까지 보유 및 이용됩니다.",
        "단, 본 서비스는 학생 주도의 캡스톤 프로젝트 결과물로, 프로젝트 전시 및 평가가 최종 종료되는 시점(또는 서비스 운영 중단 시)에 수집된 모든 개인정보를 지체 없이 파기합니다.",
      ],
    },
    {
      title: "제4조 (개인정보의 제3자 제공 및 처리 위탁)",
      items: [
        "서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.",
        "단, AI 챗봇 서비스의 원활한 제공과 답변 생성을 위해 아래와 같이 외부 AI 모델(LLM) API 서비스를 활용하며, 이 과정에서 사용자의 질의 텍스트가 익명화되어 전송될 수 있습니다.",
        "제공받는 자: OpenAI / Google",
        "제공 목적: 사용자의 질의(Prompt) 분석 및 AI 답변 생성",
        "제공 항목: 챗봇에 입력한 대화 텍스트 (개인 식별 정보 제외)",
      ],
    },
    {
      title: "제5조 (개인정보의 파기 절차 및 방법)",
      items: [
        "파기 절차: 이용 목적이 달성되거나 보유 기간이 경과한 정보는 재생 불가능한 방법으로 파기됩니다.",
        "파기 방법: 전자적 파일 형태: 기록을 재생할 수 없는 기술적 방법을 사용하여 영구 삭제",
        "특히, 성적표 등의 캡처 이미지는 OCR을 통한 텍스트 데이터 추출이 완료되는 즉시 서버에서 완전 파기됩니다.",
      ],
    },
    {
      title: "제6조 (이용자의 권리 및 행사 방법)",
      items: [
        "이용자는 언제든지 서비스 내 '설정' 또는 '마이페이지'를 통해 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보 이용에 대한 동의를 철회할 수 있습니다.",
        "정보 삭제 및 탈퇴 요청 시, 서비스는 지체 없이 해당 개인정보를 파기합니다.",
      ],
    },
    {
      title: "제7조 (개인정보 보호책임자 및 담당 부서)",
      body: "본 서비스는 이용자의 개인정보를 보호하고 관련 불만을 처리하기 위해 아래와 같이 개인정보 보호 담당자를 지정하고 있습니다.\n\n팀명: 한양대학교 ERICA ICT융합학부 NAVI\n문의 연락처 (이메일): ",
      contactEmail: "pji040199@gmail.com",
      bodyEnd: "\n\n부칙\n본 개인정보 처리방침은 2026년 X월 X일부터 적용됩니다.",
    },
  ],
  en: [
    {
      title: "Article 1 (Purpose of Collection and Use of Personal Information)",
      items: [
        "User registration, identity verification, and provision of a smooth service environment",
        "Analysis of academic performance and provision of graduation review simulation results",
        "Provision and quality improvement of an AI-based personalized campus information chatbot service",
      ],
    },
    {
      title: "Article 2 (Items of Personal Information Collected and Collection Methods)",
      items: [
        "Required items collected: student ID, name, affiliated major, email address, password",
        "Information generated and collected during service use: course registration details or transcript images uploaded for OCR data processing (original images are deleted immediately after text extraction)",
        "Interest keywords and conversation content entered while using the AI chatbot",
        "Access logs and service usage records",
      ],
    },
    {
      title: "Article 3 (Processing and Retention Period of Personal Information)",
      items: [
        "Users' personal information is retained and used, in principle, until account deletion.",
        "However, because this service is the outcome of a student-led capstone project, all collected personal information will be destroyed without delay when the final exhibition and evaluation of the project are completed, or when service operation is discontinued.",
      ],
    },
    {
      title: "Article 4 (Third-Party Provision and Outsourcing of Personal Information Processing)",
      items: [
        "In principle, this service does not provide users' personal information to external parties.",
        "However, for the smooth operation of the AI chatbot service and generation of responses, the service uses external AI model (LLM) APIs as described below, and users' query text may be transmitted in anonymized form during this process.",
        "Recipient: OpenAI / Google",
        "Purpose: Analysis of user prompts and generation of AI responses",
        "Items provided: conversation text entered into the chatbot (excluding personally identifiable information)",
      ],
    },
    {
      title: "Article 5 (Procedures and Methods for Destruction of Personal Information)",
      items: [
        "Destruction procedure: information whose purpose of use has been fulfilled or whose retention period has expired is destroyed using irrecoverable methods.",
        "Destruction method: electronic files are permanently deleted using technical methods that prevent recovery of records.",
        "In particular, captured images such as transcripts are completely deleted from the server immediately after OCR-based text extraction is completed.",
      ],
    },
    {
      title: "Article 6 (Users' Rights and Methods of Exercise)",
      items: [
        "Users may view or modify their personal information at any time through Settings or My Page within the service, and may withdraw consent to the use of personal information by deleting their account.",
        "When a request for deletion of information or account withdrawal is made, the service will destroy the relevant personal information without delay.",
      ],
    },
    {
      title: "Article 7 (Personal Information Protection Officer and Department in Charge)",
      body: "This service has designated the following person in charge of personal information protection to protect users' personal information and handle related complaints.\n\nTeam: Hanyang University ERICA Division of ICT Convergence NAVI\nContact email: ",
      contactEmail: "pji040199@gmail.com",
      bodyEnd: "\n\nSupplementary Provision\nThis Privacy Policy shall take effect on X/X/2026.",
    },
  ],
  zh: [
    {
      title: "第1条（个人信息收集与使用目的）",
      items: [
        "用于会员注册、身份识别及提供顺畅的服务使用环境",
        "用于分析学习表现并提供毕业审查模拟结果",
        "用于提供并提升基于 AI 的个性化校园信息聊天机器人服务",
      ],
    },
    {
      title: "第2条（收集的个人信息项目及收集方式）",
      items: [
        "必需收集项目：学号、姓名、所属专业、电子邮箱地址、密码",
        "在使用服务过程中产生或收集的信息：为 OCR 数据处理而上传的选课记录或成绩单图片（文本提取后立即删除原始图片）",
        "使用 AI 聊天机器人时输入的兴趣关键词及对话内容",
        "访问日志及服务使用记录",
      ],
    },
    {
      title: "第3条（个人信息处理与保留期限）",
      items: [
        "用户的个人信息原则上保留并使用至会员注销时止。",
        "但由于本服务系学生主导的毕业设计项目成果，在项目展示与评审最终结束时，或服务停止运营时，已收集的全部个人信息将被立即销毁。",
      ],
    },
    {
      title: "第4条（向第三方提供个人信息及委托处理）",
      items: [
        "本服务原则上不会向外部提供用户的个人信息。",
        "但为顺利提供 AI 聊天机器人服务并生成回答，本服务将使用如下外部 AI 模型（LLM）API 服务，在此过程中用户的提问文本可能会以匿名化形式传输。",
        "接收方：OpenAI / Google",
        "提供目的：分析用户提问（Prompt）并生成 AI 回答",
        "提供项目：输入至聊天机器人的对话文本（不含个人识别信息）",
      ],
    },
    {
      title: "第5条（个人信息销毁程序与方法）",
      items: [
        "销毁程序：当使用目的达成或保留期限届满后，相关信息将以不可恢复的方式销毁。",
        "销毁方法：电子文件将采用无法恢复记录的技术方式永久删除。",
        "特别是，成绩单等截图图片在完成基于 OCR 的文本提取后，将立即从服务器彻底销毁。",
      ],
    },
    {
      title: "第6条（用户权利及行使方式）",
      items: [
        "用户可随时通过服务内的“设置”或“我的页面”查看或修改个人信息，并可通过注销会员撤回对个人信息使用的同意。",
        "当提出信息删除或注销请求时，本服务将立即销毁相关个人信息。",
      ],
    },
    {
      title: "第7条（个人信息保护负责人及主管部门）",
      body: "本服务为保护用户个人信息并处理相关投诉，指定如下个人信息保护负责人。\n\n团队：汉阳大学 ERICA ICT 融合学部 NAVI\n联系邮箱：",
      contactEmail: "pji040199@gmail.com",
      bodyEnd: "\n\n附则\n本隐私政策自 2026 年 X 月 X 日起施行。",
    },
  ],
};

export const PRIVACY_POLICY_INTRO: Record<Language, string> = {
  ko:
    'NAVI(이하 "서비스"라 함)는 한양대학교 ERICA ICT융합학부 캡스톤 프로젝트의 일환으로 개발되었으며, 이용자의 개인정보를 중요하게 생각하고 관련 법령을 준수합니다. 본 방침은 서비스가 이용자의 개인정보를 어떻게 수집, 이용, 보호하는지 안내합니다.',
  en:
    'NAVI (the "Service") was developed as part of a capstone project in the Division of ICT Convergence at Hanyang University ERICA. The Service values users\' personal information and complies with applicable laws and regulations. This policy explains how the Service collects, uses, and protects users\' personal information.',
  zh:
    'NAVI（以下简称“本服务”）是作为汉阳大学 ERICA ICT 融合学部毕业设计项目的一部分开发的。本服务高度重视用户的个人信息，并遵守相关法律法规。本政策说明本服务如何收集、使用并保护用户的个人信息。',
};
