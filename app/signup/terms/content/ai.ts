import { type Language } from "@/lib/i18n-storage";

interface AiTermsSection {
  title: string;
  body: string;
}

interface AiTerms {
  notice: string;
  sections: AiTermsSection[];
}

/** AI 서비스 결과 면책 동의 (Figma 1292-13623) */
export const AI_TERMS: Record<Language, AiTerms> = {
  ko: {
    notice:
      "본 서비스는 인공지능(AI) 기술을 기반으로 정보를 제공하며, 한양대학교 공식 행정 시스템과 실시간으로 연동되지 않습니다.",
    sections: [
      {
        title: "제1조 (OCR 데이터 처리)",
        body: `1. 회원은 서비스 이용을 위해 본인의 수강신청 내역 또는 성적표 이미지를 업로드할 수 있습니다.
2. 업로드된 이미지는 광학 문자 인식(OCR) 기술을 통해 텍스트 데이터로 변환되어 개인의 졸업 요건 분석에만 활용됩니다.
3. 분석이 완료된 원본 이미지는 즉시 파기되거나, 개인 식별이 불가능한 형태로 암호화되어 보관됩니다.`,
      },
      {
        title: "제2조 (AI 답변의 한계 및 면책)",
        body: `1. 본 서비스가 제공하는 챗봇 답변, 졸업 사정 결과, 수강 추천 정보는 AI 모델(LLM) 및 알고리즘에 기반한 예측 결과입니다.
2. AI 기술의 특성상 환각(Hallucination) 현상, 정보의 오류, 최신 학칙 미반영 등이 발생할 수 있습니다.
3. 본 서비스의 정보는 참고용으로만 활용해야 하며, 졸업 가능 여부, 수강신청 등 중요한 학사 결정 시에는 반드시 한양대학교 공식 부서(단과대 행정팀 등)를 통해 최종 확인해야 합니다.
4. 회사는 본 서비스가 제공한 정보의 오류로 인해 발생한 회원의 학사상 불이익(졸업 유예, 수강 정정 실패 등)에 대해 법적 책임을 지지 않습니다.`,
      },
    ],
  },
  en: {
    notice:
      "This service provides information based on artificial intelligence (AI) technology and is not connected in real time to Hanyang University's official administrative systems.",
    sections: [
      {
        title: "Article 1 (OCR Data Processing)",
        body: `1. Members may upload their course registration details or transcript images in order to use the service.
2. Uploaded images are converted into text data through optical character recognition (OCR) technology and are used solely for analyzing the user's graduation requirements.
3. Once the analysis is complete, the original images are immediately deleted or stored in encrypted form so that individuals cannot be identified.`,
      },
      {
        title: "Article 2 (Limitations of AI Responses and Disclaimer)",
        body: `1. The chatbot responses, graduation review results, and course recommendation information provided by this service are predictive outputs based on AI models (LLMs) and algorithms.
2. Due to the nature of AI technology, hallucinations, factual errors, and the omission of the latest academic regulations may occur.
3. The information provided by this service must be used for reference only. For important academic decisions such as graduation eligibility or course registration, users must verify the final details with the official departments of Hanyang University.
4. The company shall not be legally liable for any academic disadvantages suffered by members due to errors in the information provided by this service, including delayed graduation or unsuccessful course corrections.`,
      },
    ],
  },
  zh: {
    notice:
      "本服务基于人工智能（AI）技术提供信息，且不与汉阳大学官方行政系统进行实时联动。",
    sections: [
      {
        title: "第1条（OCR 数据处理）",
        body: `1. 会员可为使用本服务上传本人选课记录或成绩单图片。
2. 上传的图片将通过光学字符识别（OCR）技术转换为文本数据，并仅用于个人毕业要求分析。
3. 分析完成后，原始图片将立即销毁，或以无法识别个人身份的加密形式保存。`,
      },
      {
        title: "第2条（AI 回答的限制与免责声明）",
        body: `1. 本服务提供的聊天机器人回答、毕业审查结果及选课推荐信息，均为基于 AI 模型（LLM）及算法生成的预测结果。
2. 由于 AI 技术本身的特性，可能出现幻觉（Hallucination）、信息错误或未反映最新校规的情况。
3. 本服务提供的信息仅供参考。对于毕业可能性、选课申请等重要学业决定，用户必须通过汉阳大学官方部门进行最终确认。
4. 因本服务提供的信息错误而导致会员遭受学业上的不利益（如延期毕业、改课失败等），本公司不承担法律责任。`,
      },
    ],
  },
};
