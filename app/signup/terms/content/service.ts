import { type Language } from "@/lib/i18n-storage";

interface ServiceTermsSection {
  title: string;
  body: string;
}

/** 서비스 이용약관 본문 (Figma 1292-9411) */
export const SERVICE_TERMS_SECTIONS: Record<Language, ServiceTermsSection[]> = {
  ko: [
    {
      title: "제1조 (목적)",
      body: "본 약관은 NAVI(이하 \"서비스\"라 함)가 제공하는 제반 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.",
    },
    {
      title: "제2조 (용어의 정의)",
      body: "1. \"서비스\"라 함은 구현되는 단말기(PC, 휴대형단말기 등의 각종 유무선 장치를 포함)와 상관없이 회원이 이용할 수 있는 NAVI 및 관련 제반 서비스를 의미합니다.\n2. \"회원\"이라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.",
    },
    {
      title: "제3조 (서비스의 제공 및 변경)",
      body: "1. 회사는 다음과 같은 업무를 수행합니다.\n· 학사 정보 조회 및 시뮬레이션 서비스\n· AI 기반 캠퍼스 정보 챗봇 서비스\n· 커뮤니티 및 게시판 서비스\n\n2. 본 서비스는 한양대학교 공식 서비스가 아니며, 학생 주도의 캡스톤 프로젝트 결과물로서 제공됩니다. 따라서 학교의 공식 정책 변경에 따라 서비스 내용이 변경되거나 중단될 수 있습니다.",
    },
    {
      title: "제4조 (회원의 의무)",
      body: "회원은 다음 행위를 하여서는 안 됩니다.\n1. 신청 또는 변경 시 허위 내용의 등록\n2. 타인의 정보 도용\n3. 회사가 게시한 정보의 변경\n4. 회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해\n5. 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위",
    },
  ],
  en: [
    {
      title: "Article 1 (Purpose)",
      body: "These Terms are intended to define the rights, obligations, responsibilities, and other necessary matters between NAVI (the \"Service\") and its members in connection with the use of the various services provided by the Service.",
    },
    {
      title: "Article 2 (Definitions)",
      body: "1. The \"Service\" means NAVI and all related services available to members regardless of the device through which they are implemented, including PCs, mobile devices, and other wired or wireless devices.\n2. A \"Member\" means a user who accesses the company's service, enters into a service agreement with the company in accordance with these Terms, and uses the services provided by the company.",
    },
    {
      title: "Article 3 (Provision and Changes of Services)",
      body: "1. The company provides the following services.\n· Academic information lookup and simulation services\n· AI-based campus information chatbot services\n· Community and bulletin board services\n\n2. This service is not an official service of Hanyang University and is provided as a student-led capstone project deliverable. Accordingly, the content of the service may be changed or discontinued in accordance with changes to official university policies.",
    },
    {
      title: "Article 4 (Obligations of Members)",
      body: "Members shall not engage in any of the following acts.\n1. Registering false information when applying for or changing service information\n2. Misappropriating another person's information\n3. Altering information posted by the company\n4. Infringing the copyrights or other intellectual property rights of the company or any third party\n5. Disclosing or posting obscene or violent messages, images, audio, or any other information that violates public order or morals through the service",
    },
  ],
  zh: [
    {
      title: "第1条（目的）",
      body: "本条款旨在规定 NAVI（以下简称“本服务”）与会员之间，就使用本服务所提供的各项服务而产生的权利、义务、责任及其他必要事项。",
    },
    {
      title: "第2条（术语定义）",
      body: "1. “本服务”系指会员可通过实现该服务的各种终端设备使用的 NAVI 及其相关服务，包括 PC、移动终端及其他有线或无线设备。\n2. “会员”系指访问本公司服务、依据本条款与本公司订立服务使用协议，并使用本公司提供服务的用户。",
    },
    {
      title: "第3条（服务的提供与变更）",
      body: "1. 本公司提供以下服务。\n· 学业信息查询与模拟服务\n· 基于 AI 的校园信息聊天机器人服务\n· 社区与公告板服务\n\n2. 本服务并非汉阳大学官方服务，而是由学生主导的毕业设计项目成果。因此，服务内容可能会因学校正式政策变更而调整或中止。",
    },
    {
      title: "第4条（会员义务）",
      body: "会员不得实施下列行为。\n1. 在申请或修改信息时登记虚假内容\n2. 盗用他人信息\n3. 擅自变更本公司发布的信息\n4. 侵害本公司或第三方的著作权等知识产权\n5. 通过本服务公开或发布淫秽、暴力信息、图像、语音或其他违反公序良俗的信息",
    },
  ],
};
