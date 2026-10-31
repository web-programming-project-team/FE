// 서버 enum 값 → 화면 표시명 (API 명세 v1.1 "공통 enum" 표 기준)

export const PROGRESS_STATUS = {
  TO_CHECK: '확인 필요',
  INTERESTED: '관심',
  PLANNED: '신청 예정',
  APPLIED: '신청 완료',
  IN_PROGRESS: '참여 중',
  COMPLETED: '완료',
}

export const LIFE_STAGE = {
  ENROLLED: '대학 재학',
  GRADUATING: '졸업 예정',
  ON_LEAVE: '휴학',
  MILITARY: '군 복무·전역',
  JOB_SEEKING: '취업 준비',
  FIRST_JOB: '첫 취업',
  INDEPENDENCE: '독립 준비',
}

export const INTEREST_FIELD = {
  EMPLOYMENT: '취업',
  EDUCATION: '교육',
  HOUSING: '주거',
  FINANCE: '금융',
  COUNSELING: '상담',
  CULTURE_LIFE: '문화·생활',
}

export const JOB_CATEGORY = {
  OFFICE: '사무',
  IT: 'IT·개발',
  MANUFACTURING: '생산·제조',
  SERVICE: '서비스',
  DESIGN: '디자인',
  ETC: '기타',
}

export const REGION = {
  SIHEUNG: '시흥',
  ANSAN: '안산',
  INCHEON: '인천',
  BUCHEON: '부천',
  GWANGMYEONG: '광명',
}

export const EDUCATION = {
  HIGH_SCHOOL: '고졸',
  COLLEGE: '전문대졸',
  UNIVERSITY: '대졸',
  ANY: '무관',
}

export const EMPLOYMENT_TYPE = {
  FULL_TIME: '정규직',
  CONTRACT: '계약직',
  INTERN: '인턴',
  PART_TIME: '시간제',
}

export const RECRUIT_STATUS = {
  UPCOMING: '접수 예정',
  OPEN: '접수 중',
  CLOSED: '마감',
  ENDED: '종료',
}

export const POLICY_SOURCE = {
  ONTONG: '온통청년',
  ADMIN: '관리자 등록',
}

export const POST_TYPE = {
  PASS_REVIEW: '합격 후기',
  PROGRAM_REVIEW: '참여 후기',
  PORTFOLIO: '포트폴리오',
}

export const PREP_PERIOD = {
  WEEK_1: '1주 이내',
  MONTH_1: '1개월',
  MONTH_3: '3개월',
  MONTH_6_PLUS: '6개월 이상',
}

export const REPORT_REASON = {
  PERSONAL_INFO: '개인정보 노출',
  SPAM: '광고',
  ABUSE: '욕설·비방',
  FALSE_INFO: '허위 정보',
  ETC: '기타',
}

export const EVENT_TYPE = {
  APPLY_START: '접수 시작',
  APPLY_END: '접수 마감',
  COUNSELING: '상담',
  PARTICIPATION: '참여일',
  JOB_DEADLINE: '채용 마감',
  CUSTOM: '직접 추가',
}

export const NOTIFICATION_TYPE = {
  NEW_JOB: '새 맞춤 공고',
  DEADLINE: '마감 임박',
  NEW_REVIEW: '관심 항목 새 후기',
  SYSTEM: '공지',
}

// 후기 작성자 상황 표시: 졸업 예정 → 첫 취업
export const authorStageLabel = ({ authorStage, authorStageAfter }) =>
  authorStageAfter ? `${LIFE_STAGE[authorStage]} → ${LIFE_STAGE[authorStageAfter]}` : LIFE_STAGE[authorStage]
