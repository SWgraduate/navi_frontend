import { type Language } from "@/lib/i18n-storage";

interface MarketingBodySection {
  title: string;
  body: string;
}

interface MarketingListSection {
  title: string;
  items: string[];
}

interface MarketingTerms {
  intro: string;
  sections: Array<MarketingBodySection | MarketingListSection>;
  disclaimer: string;
}

/** 마케팅 정보 수신 동의 (Figma 1292-13692) */
export const MARKETING_TERMS: Record<Language, MarketingTerms> = {
  ko: {
    intro:
      "NAVI에서 제공하는 다양한 혜택과 이벤트 정보를 받아보실 수 있습니다.",
    sections: [
      {
        title: "전송 방법",
        body: "이메일, SMS",
      },
      {
        title: "전송 내용",
        items: [
          "신규 기능 업데이트 및 프로모션 안내",
          "교내 제휴 업체 확인 쿠폰 제공",
          "맞춤형 장학금 및 대회활동 추천 알림",
        ],
      },
    ],
    disclaimer:
      "* 본 동의는 거부하더라도 서비스 이용에는 제한이 없으며, 추후 설정 메뉴에서 언제든지 철회할 수 있습니다.",
  },
  en: {
    intro:
      "You may receive various benefit and event information provided by NAVI.",
    sections: [
      {
        title: "Delivery Methods",
        body: "Email, SMS",
      },
      {
        title: "Content Provided",
        items: [
          "Notifications about new feature updates and promotions",
          "Coupons from on-campus partner businesses",
          "Personalized recommendations for scholarships and competition activities",
        ],
      },
    ],
    disclaimer:
      "* Even if you refuse this consent, your use of the service will not be restricted, and you may revoke it at any time later in the settings menu.",
  },
  zh: {
    intro:
      "您可以接收 NAVI 提供的各类优惠与活动信息。",
    sections: [
      {
        title: "发送方式",
        body: "电子邮件、短信",
      },
      {
        title: "发送内容",
        items: [
          "新功能更新与促销通知",
          "校内合作商家优惠券",
          "个性化奖学金与竞赛活动推荐提醒",
        ],
      },
    ],
    disclaimer:
      "* 即使您拒绝本同意，也不会影响您使用服务，且之后可随时在设置菜单中撤回同意。",
  },
};
