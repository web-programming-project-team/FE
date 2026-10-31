// 예시 데이터 — 백엔드 API 연결 전까지 화면 개발용. 필드 이름은 API 명세 v1.4 응답을 따른다.
// applyUrl은 실제 공고 주소가 아니라 공식 포털 첫 화면이다. 실데이터 연결 시 교체한다.

export const BASE_DATE = '2026-10-25'

const ONTONG_URL = 'https://www.youthcenter.go.kr'
const WORK24_URL = 'https://www.work24.go.kr'

export const me = {
  nickname: 'A',
  lifeStages: ['GRADUATING', 'JOB_SEEKING'],
  interests: ['EMPLOYMENT', 'HOUSING'],
  jobPreference: {
    regions: ['SIHEUNG', 'ANSAN', 'INCHEON', 'BUCHEON', 'GWANGMYEONG'],
    education: 'UNIVERSITY',
    careerLevel: 'NEW',
    jobCategories: ['OFFICE', 'IT'],
    employmentTypes: ['FULL_TIME'],
  },
}

export const policies = [
  {
    policyId: 1,
    title: '청년 직무역량 아카데미',
    field: 'EMPLOYMENT',
    agency: '시흥시청소년청년재단',
    target: '시흥시에 거주하거나 학교·직장을 다니는 19~24세 청년',
    content: '무료 직무교육·실무 과제·멘토 피드백',
    contact: '청년사업 담당 부서 · 공식 문의 안내',
    applyStartDate: '2026-10-20',
    applyEndDate: '2026-11-05',
    recruitStatus: 'OPEN',
    source: 'ADMIN',
    sourceUrl: ONTONG_URL,
    applyUrl: ONTONG_URL,
    lastVerifiedAt: '2026-10-20',
    roadmapItemCount: 128,
  },
  {
    policyId: 2,
    title: '청년 자격증 응시료 지원',
    field: 'EMPLOYMENT',
    agency: '시흥시청소년청년재단',
    target: '시흥시 거주 19~24세 미취업 청년',
    content: '국가기술자격·어학 시험 응시료 실비 지원',
    contact: '청년사업 담당 부서 · 공식 문의 안내',
    applyStartDate: '2026-10-01',
    applyEndDate: '2026-10-28',
    recruitStatus: 'OPEN',
    source: 'ONTONG',
    sourceUrl: ONTONG_URL,
    applyUrl: ONTONG_URL,
    lastVerifiedAt: '2026-10-20',
    roadmapItemCount: 214,
  },
  {
    policyId: 3,
    title: '청년 월세 지원',
    field: 'HOUSING',
    agency: '경기도',
    target: '경기도 거주 무주택 청년',
    content: '월 임대료 일부 지원',
    contact: '경기도 청년 주거 담당 · 공식 문의 안내',
    applyStartDate: '2026-11-02',
    applyEndDate: '2026-11-30',
    recruitStatus: 'UPCOMING',
    source: 'ONTONG',
    sourceUrl: ONTONG_URL,
    applyUrl: ONTONG_URL,
    lastVerifiedAt: '2026-09-20',
    roadmapItemCount: 86,
  },
  {
    policyId: 4,
    title: '이력서 클리닉',
    field: 'EMPLOYMENT',
    agency: '시흥 청년스테이션',
    target: '시흥시 19~24세 구직 청년',
    content: '이력서·자기소개서 1:1 첨삭',
    contact: '시흥 청년스테이션 · 공식 문의 안내',
    applyStartDate: '2026-10-10',
    applyEndDate: '2026-10-30',
    recruitStatus: 'OPEN',
    source: 'ADMIN',
    sourceUrl: ONTONG_URL,
    applyUrl: ONTONG_URL,
    lastVerifiedAt: '2026-10-18',
    roadmapItemCount: 57,
  },
  {
    policyId: 5,
    title: '청년 상담',
    field: 'COUNSELING',
    agency: '시흥 청년스테이션',
    target: '시흥시 19~24세 청년',
    content: '진로·심리 1:1 상담',
    contact: '시흥 청년스테이션 · 공식 문의 안내',
    applyStartDate: '2026-10-01',
    applyEndDate: '2026-11-01',
    recruitStatus: 'OPEN',
    source: 'ADMIN',
    sourceUrl: ONTONG_URL,
    applyUrl: ONTONG_URL,
    lastVerifiedAt: '2026-10-20',
    roadmapItemCount: 73,
  },
]

export const policyById = (id) => policies.find((p) => p.policyId === Number(id))

const helpful = (...ids) => ids.map((id) => ({ policyId: id, title: policyById(id).title }))

// 내 로드맵 (GET /roadmaps/me). 항목 진행상태는 AppState에서 관리한다.
export const roadmap = {
  roadmapId: 31,
  currentStep: 2,
  steps: [
    {
      stepOrder: 1,
      title: '진로·취업 상담',
      items: [
        { itemId: 101, title: '진로 탐색 상담', agency: '시흥 청년스테이션', status: 'COMPLETED' },
        { itemId: 102, title: '취업 컨설팅', agency: '시흥 청년스테이션', status: 'COMPLETED' },
      ],
    },
    {
      stepOrder: 2,
      title: '직무역량 프로그램',
      items: [
        { itemId: 201, policyId: 1, status: 'PLANNED' },
        { itemId: 202, policyId: 2, status: 'INTERESTED' },
      ],
    },
    {
      stepOrder: 3,
      title: '취업지원사업',
      items: [
        { itemId: 301, policyId: 5, status: 'INTERESTED' },
        { itemId: 302, policyId: 4, status: 'TO_CHECK' },
      ],
    },
    {
      stepOrder: 4,
      title: '주거지원',
      items: [
        { itemId: 401, policyId: 3, status: 'TO_CHECK' },
        { itemId: 402, title: '청년 전세보증금 이자 지원', agency: '경기도', status: 'TO_CHECK' },
      ],
    },
    {
      stepOrder: 5,
      title: '금융·생활지원',
      items: [
        { itemId: 501, title: '청년 저축 지원', agency: '시흥시', status: 'TO_CHECK' },
        { itemId: 502, title: '청년 문화패스', agency: '경기도', status: 'TO_CHECK' },
      ],
    },
  ],
}

// "다음에 할 일" — 진행 중인 항목에서 다음 행동을 뽑은 것
export const nextActions = [
  { itemId: 201, policyId: 1, title: '청년 직무역량 아카데미', actionLabel: '공식 사이트에서 신청하기' },
  { itemId: 301, policyId: 5, title: '청년 상담', actionLabel: '상담 일정 확인하기' },
  { itemId: 202, policyId: 2, title: '청년 자격증 응시료 지원', actionLabel: '준비 서류 확인하기' },
]

export const jobs = [
  {
    jobId: 11,
    company: '(주)시흥테크',
    title: '사무직 신입',
    region: 'SIHEUNG',
    jobCategory: 'OFFICE',
    education: 'UNIVERSITY',
    employmentType: 'FULL_TIME',
    deadline: '2026-11-03',
    isNew: false,
    careerLevel: 'NEW',
    dataSource: 'ADMIN',
    originalUrl: WORK24_URL,
    helpfulPolicies: helpful(1, 2),
  },
  {
    jobId: 12,
    company: '시흥디지털솔루션',
    title: '웹개발 신입',
    region: 'ANSAN',
    jobCategory: 'IT',
    education: 'UNIVERSITY',
    employmentType: 'FULL_TIME',
    deadline: '2026-11-06',
    isNew: true,
    careerLevel: 'NEW',
    dataSource: 'ADMIN',
    originalUrl: WORK24_URL,
    helpfulPolicies: helpful(1),
  },
  {
    jobId: 13,
    company: '인천넥스트시스템',
    title: 'IT 운영 신입',
    region: 'INCHEON',
    jobCategory: 'IT',
    education: 'UNIVERSITY',
    employmentType: 'FULL_TIME',
    deadline: '2026-11-09',
    isNew: true,
    careerLevel: 'NEW',
    dataSource: 'ADMIN',
    originalUrl: WORK24_URL,
    helpfulPolicies: helpful(1),
  },
  {
    jobId: 14,
    company: '부천그린파트너스',
    title: '경영지원 신입',
    region: 'BUCHEON',
    jobCategory: 'OFFICE',
    education: 'UNIVERSITY',
    employmentType: 'FULL_TIME',
    deadline: '2026-11-12',
    isNew: true,
    careerLevel: 'NEW',
    dataSource: 'ADMIN',
    originalUrl: WORK24_URL,
    helpfulPolicies: helpful(1, 2),
  },
]

// 후기 — 작성자는 실명 없이 상황만 보여 준다
export const reviews = [
  {
    postId: 1, type: 'PROGRAM_REVIEW', rating: 5, oneLiner: '처음 만든 포트폴리오로 면접까지 갔어요',
    prepPeriod: 'MONTH_1', helpfulPoints: ['실무 과제', '멘토 피드백'], policy: { policyId: 1, title: policyById(1).title }, job: null, jobCategory: 'IT',
    authorStage: 'GRADUATING', authorStageAfter: 'FIRST_JOB', createdAt: '2026-10-22T10:00:00', likeCount: 24, liked: false,
  },
  {
    postId: 2, type: 'PROGRAM_REVIEW', rating: 4, oneLiner: '혼자 준비할 때보다 방향이 선명해졌어요',
    prepPeriod: 'MONTH_1', helpfulPoints: ['직무 탐색'], policy: { policyId: 1, title: policyById(1).title }, job: null, jobCategory: 'OFFICE',
    authorStage: 'JOB_SEEKING', authorStageAfter: null, createdAt: '2026-10-20T10:00:00', likeCount: 18, liked: false,
  },
  {
    postId: 3, type: 'PROGRAM_REVIEW', rating: 5, oneLiner: '응시료 부담을 덜고 시험에 집중했어요',
    prepPeriod: 'WEEK_1', helpfulPoints: ['비용 부담 완화'], policy: { policyId: 2, title: policyById(2).title }, job: null, jobCategory: 'OFFICE',
    authorStage: 'GRADUATING', authorStageAfter: null, createdAt: '2026-10-18T10:00:00', likeCount: 15, liked: false,
  },
  {
    postId: 4, type: 'PROGRAM_REVIEW', rating: 4, oneLiner: '막막했던 취업 준비를 하나씩 정리했어요',
    prepPeriod: 'WEEK_1', helpfulPoints: ['진로 상담', '직무 탐색'], policy: { policyId: 5, title: policyById(5).title }, job: null, jobCategory: 'IT',
    authorStage: 'ON_LEAVE', authorStageAfter: 'JOB_SEEKING', createdAt: '2026-10-16T10:00:00', likeCount: 12, liked: false,
  },
  {
    postId: 5, type: 'PROGRAM_REVIEW', rating: 5, oneLiner: '내 경험을 이력서에 담는 법을 배웠어요',
    prepPeriod: 'MONTH_1', helpfulPoints: ['서류 피드백'], policy: { policyId: 4, title: policyById(4).title }, job: null, jobCategory: 'OFFICE',
    authorStage: 'JOB_SEEKING', authorStageAfter: 'FIRST_JOB', createdAt: '2026-10-14T10:00:00', likeCount: 21, liked: false,
  },
  {
    postId: 6, type: 'PROGRAM_REVIEW', rating: 4, oneLiner: '필요한 서류를 미리 챙기니 수월했어요',
    prepPeriod: 'WEEK_1', helpfulPoints: ['비용 부담 완화'], policy: { policyId: 2, title: policyById(2).title }, job: null, jobCategory: 'IT',
    authorStage: 'JOB_SEEKING', authorStageAfter: null, createdAt: '2026-10-12T10:00:00', likeCount: 9, liked: false,
  },
  {
    postId: 7, type: 'PASS_REVIEW', rating: 5, oneLiner: '실무 과제로 자신감이 생겼어요',
    prepPeriod: 'MONTH_1', helpfulPoints: ['실무 과제', '멘토 피드백'], policy: { policyId: 1, title: policyById(1).title }, job: null, jobCategory: 'IT',
    authorStage: 'GRADUATING', authorStageAfter: 'FIRST_JOB', createdAt: '2026-10-18T10:00:00', likeCount: 30, liked: false,
  },
  {
    postId: 8, type: 'PASS_REVIEW', rating: 4, oneLiner: '이력서의 강점을 찾았어요',
    prepPeriod: 'MONTH_1', helpfulPoints: ['서류 피드백'], policy: { policyId: 4, title: policyById(4).title }, job: null, jobCategory: 'OFFICE',
    authorStage: 'JOB_SEEKING', authorStageAfter: 'FIRST_JOB', createdAt: '2026-10-19T10:00:00', likeCount: 11, liked: false,
  },
]

export const HELPFUL_POINTS = ['실무 과제', '멘토 피드백', '직무 탐색', '서류 준비']

// 캘린더 일정 (GET /calendar/events)
export const events = [
  { eventId: 1, date: '2026-10-28', type: 'APPLY_END', title: '자격증 응시료 마감', sourceType: 'POLICY', sourceId: 2, eventTime: null },
  { eventId: 2, date: '2026-10-30', type: 'APPLY_END', title: '이력서 클리닉 마감', sourceType: 'POLICY', sourceId: 4, eventTime: null },
  { eventId: 3, date: '2026-11-01', type: 'APPLY_END', title: '상담 마감', sourceType: 'POLICY', sourceId: 5, eventTime: null },
  { eventId: 4, date: '2026-11-02', type: 'APPLY_START', title: '월세 접수 시작', sourceType: 'POLICY', sourceId: 3, eventTime: null },
  { eventId: 5, date: '2026-11-03', type: 'JOB_DEADLINE', title: '시흥테크 채용 마감', sourceType: 'JOB', sourceId: 11, eventTime: null },
  { eventId: 6, date: '2026-11-05', type: 'APPLY_END', title: '아카데미 마감', sourceType: 'POLICY', sourceId: 1, eventTime: null },
  { eventId: 7, date: '2026-11-05', type: 'COUNSELING', title: '청년 상담', sourceType: 'POLICY', sourceId: 5, eventTime: '14:00' },
  { eventId: 8, date: '2026-11-06', type: 'JOB_DEADLINE', title: '웹개발 채용 마감', sourceType: 'JOB', sourceId: 12, eventTime: null },
  { eventId: 9, date: '2026-11-09', type: 'JOB_DEADLINE', title: 'IT 운영 채용 마감', sourceType: 'JOB', sourceId: 13, eventTime: null },
  { eventId: 10, date: '2026-11-12', type: 'PARTICIPATION', title: '아카데미 참여', sourceType: 'POLICY', sourceId: 1, eventTime: null },
  { eventId: 11, date: '2026-11-12', type: 'JOB_DEADLINE', title: '경영지원 채용 마감', sourceType: 'JOB', sourceId: 14, eventTime: null },
  { eventId: 12, date: '2026-11-30', type: 'APPLY_END', title: '월세 지원 마감', sourceType: 'POLICY', sourceId: 3, eventTime: null },
]

// 알림 센터 (GET /notifications)
export const notifications = [
  {
    notificationId: 1, type: 'DEADLINE', title: '자격증 응시료 지원 신청 마감 D-3',
    body: '10월 28일까지 · 준비 서류를 확인해 보세요', link: { targetType: 'POLICY', targetId: 2 }, read: false,
    createdAt: '2026-10-25T09:00:00',
  },
  {
    notificationId: 2, type: 'NEW_JOB', title: '조건에 맞는 새 공고 3건',
    body: '사무·IT 신입 공고를 확인해 보세요', link: { targetType: 'JOB_LIST', targetId: null }, read: false,
    createdAt: '2026-10-25T04:05:00',
  },
  {
    notificationId: 3, type: 'NEW_REVIEW', title: '관심 프로그램에 새 후기 2건',
    body: '청년 직무역량 아카데미 참여 경험이에요', link: { targetType: 'POST_LIST', targetId: null }, read: false,
    createdAt: '2026-10-24T18:00:00',
  },
  {
    notificationId: 4, type: 'SYSTEM', title: '청년 상담 일정 11월 5일 오후 2시',
    body: 'NEXT 캘린더에서 일정을 확인해 보세요', link: { targetType: 'CALENDAR', targetId: null }, read: false,
    createdAt: '2026-10-24T09:00:00',
  },
]
