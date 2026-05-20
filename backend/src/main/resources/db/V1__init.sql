-- ============================================================
-- WorkSync 그룹웨어 DDL  (PostgreSQL 15+ / Supabase)
-- 기준 : WorkSync_ERD_final_1_2.svg  |  총 18개 테이블
-- 제3정규형  |  UTF-8
-- ============================================================

-- ── ENUM 타입 ────────────────────────────────────────────────
CREATE TYPE employee_role          AS ENUM ('USER', 'ADMIN');
CREATE TYPE employee_status        AS ENUM ('ACTIVE', 'INACTIVE', 'AWAY');
CREATE TYPE job_grade_type         AS ENUM ('STAFF', 'SENIOR', 'ASSISTANT_MANAGER', 'MANAGER', 'GENERAL_MANAGER', 'DIRECTOR', 'CEO');
CREATE TYPE approval_doc_status    AS ENUM ('IN_PROGRESS', 'APPROVED', 'REJECTED');
CREATE TYPE step_type_enum         AS ENUM ('DRAFT', 'REVIEW', 'APPROVE', 'REFERENCE');
CREATE TYPE approval_line_status   AS ENUM ('WAITING', 'APPROVED', 'REJECTED');
CREATE TYPE task_status_type       AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
CREATE TYPE room_type_enum         AS ENUM ('DIRECT', 'GROUP');
CREATE TYPE msg_type_enum          AS ENUM ('TEXT', 'FILE', 'IMAGE', 'SYSTEM');
CREATE TYPE attendance_status_type AS ENUM ('NORMAL', 'LATE', 'EARLY_LEAVE', 'ABSENT');
CREATE TYPE board_type_enum        AS ENUM ('NOTICE', 'DEPARTMENT', 'FREE', 'FILES');
CREATE TYPE notification_type_enum AS ENUM ('APPROVAL', 'TASK', 'MESSAGE');
CREATE TYPE leave_type_enum        AS ENUM ('ANNUAL', 'HALF', 'SICK', 'FAMILY');
CREATE TYPE leave_status_enum      AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- ── 1. department (부서) ──────────────────────────────────────
-- 삭제 정책: 소속 사원 존재 시 Service에서 체크 후 삭제 거부
CREATE TABLE department (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── 2. employee (사원) ───────────────────────────────────────
-- department_id: 부서 삭제 시 NULL로 변경 (사원은 유지)
CREATE TABLE employee (
    id                BIGSERIAL        PRIMARY KEY,
    emp_no            VARCHAR(20)      NOT NULL UNIQUE,
    name              VARCHAR(50)      NOT NULL,
    email             VARCHAR(100)     NOT NULL UNIQUE,
    password          VARCHAR(255)     NOT NULL,
    phone             VARCHAR(20),
    role              employee_role    NOT NULL DEFAULT 'USER',
    status            employee_status  NOT NULL DEFAULT 'ACTIVE',
    job_grade         job_grade_type   NOT NULL DEFAULT 'STAFF',
    department_id     BIGINT           REFERENCES department(id) ON DELETE SET NULL,
    profile_image     VARCHAR(512),
    hire_date         DATE,
    login_fail_count  INT              NOT NULL DEFAULT 0 CHECK (login_fail_count >= 0),
    locked_until      TIMESTAMP,
    created_at        TIMESTAMP        NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP        NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_employee_department ON employee(department_id);
CREATE INDEX idx_employee_emp_no     ON employee(emp_no);

-- ── 3. annual_leave_balance (연차 잔여) ──────────────────────
-- remain_days 제거 (total_days - used_days 로 계산)
-- employee 삭제 시 연차 기록도 함께 삭제
CREATE TABLE annual_leave_balance (
    id          BIGSERIAL    PRIMARY KEY,
    employee_id BIGINT       NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    year        SMALLINT     NOT NULL CHECK (year >= 2000 AND year <= 2100),
    total_days  NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (total_days >= 0),
    used_days   NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (used_days >= 0),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (employee_id, year)
);

-- ── 4. notification (알림) ───────────────────────────────────
-- employee 삭제 시 알림도 함께 삭제
CREATE TABLE notification (
    id          BIGSERIAL               PRIMARY KEY,
    receiver_id BIGINT                  NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    type        notification_type_enum  NOT NULL,
    content     TEXT                    NOT NULL,
    target_type VARCHAR(30),
    target_id   BIGINT,
    is_read     BOOLEAN                 NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP               NOT NULL DEFAULT NOW(),
    read_at     TIMESTAMP,
    CONSTRAINT chk_read_at CHECK (read_at IS NULL OR read_at >= created_at)
);
CREATE INDEX idx_notification_receiver    ON notification(receiver_id, is_read);
CREATE INDEX idx_notification_created_at  ON notification(created_at);

-- ── 5. approval_form (결재 양식) ─────────────────────────────
CREATE TABLE approval_form (
    id          BIGSERIAL    PRIMARY KEY,
    form_name   VARCHAR(100) NOT NULL,
    form_type   VARCHAR(50)  NOT NULL,
    form_schema JSONB        NOT NULL DEFAULT '{}',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── 6. approval_doc (결재 문서) ──────────────────────────────
-- drafter_id: RESTRICT → 결재 문서 있는 사원 삭제 불가
-- form_id: RESTRICT → 사용 중인 양식 삭제 불가
CREATE TABLE approval_doc (
    id           BIGSERIAL           PRIMARY KEY,
    drafter_id   BIGINT              NOT NULL REFERENCES employee(id) ON DELETE RESTRICT,
    form_id      BIGINT              NOT NULL REFERENCES approval_form(id) ON DELETE RESTRICT,
    title        VARCHAR(200)        NOT NULL,
    status       approval_doc_status NOT NULL DEFAULT 'IN_PROGRESS',
    submitted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at   TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP           NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_completed_at CHECK (completed_at IS NULL OR completed_at >= submitted_at)
);
CREATE INDEX idx_approval_doc_drafter    ON approval_doc(drafter_id);
CREATE INDEX idx_approval_doc_status     ON approval_doc(status);
CREATE INDEX idx_approval_doc_created_at ON approval_doc(created_at);

-- ── 7. approval_line (결재선) ────────────────────────────────
-- doc_id: CASCADE → 결재 문서 삭제 시 결재선도 삭제
-- approver_id: RESTRICT → 결재선에 있는 사원 삭제 불가
CREATE TABLE approval_line (
    id           BIGSERIAL             PRIMARY KEY,
    doc_id       BIGINT                NOT NULL REFERENCES approval_doc(id) ON DELETE CASCADE,
    approver_id  BIGINT                NOT NULL REFERENCES employee(id) ON DELETE RESTRICT,
    step_order   INT                   NOT NULL CHECK (step_order >= 1),
    step_type    step_type_enum        NOT NULL,
    status       approval_line_status  NOT NULL DEFAULT 'WAITING',
    comment      TEXT,
    processed_at TIMESTAMP,
    UNIQUE (doc_id, step_order)
);
CREATE INDEX idx_approval_line_doc      ON approval_line(doc_id);
CREATE INDEX idx_approval_line_approver ON approval_line(approver_id);

-- ── 8. approval_doc_item (결재 내용) ─────────────────────────
-- doc_id: CASCADE → 결재 문서 삭제 시 항목도 삭제
CREATE TABLE approval_doc_item (
    id         BIGSERIAL    PRIMARY KEY,
    doc_id     BIGINT       NOT NULL REFERENCES approval_doc(id) ON DELETE CASCADE,
    item_key   VARCHAR(100) NOT NULL,
    item_value TEXT
);
CREATE INDEX idx_approval_doc_item ON approval_doc_item(doc_id);

-- ── 9. task (업무) ───────────────────────────────────────────
-- creator_id: RESTRICT → 업무 만든 사원 삭제 불가
-- assignee_id: SET NULL → 담당자 삭제 시 NULL로 변경
-- department_id: SET NULL → 부서 삭제 시 NULL로 변경
CREATE TABLE task (
    id            BIGSERIAL        PRIMARY KEY,
    creator_id    BIGINT           NOT NULL REFERENCES employee(id) ON DELETE RESTRICT,
    assignee_id   BIGINT           REFERENCES employee(id) ON DELETE SET NULL,
    department_id BIGINT           REFERENCES department(id) ON DELETE SET NULL,
    title         VARCHAR(200)     NOT NULL,
    description   TEXT,
    status        task_status_type NOT NULL DEFAULT 'TODO',
    progress      INT              NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date    DATE,
    due_date      DATE,
    completed_at  TIMESTAMP,
    created_at    TIMESTAMP        NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP        NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_task_date CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date)
);
CREATE INDEX idx_task_assignee ON task(assignee_id);
CREATE INDEX idx_task_status   ON task(status);
CREATE INDEX idx_task_creator  ON task(creator_id);

-- ── 10. chat_room (채팅방) ───────────────────────────────────
-- created_by: RESTRICT → 채팅방 만든 사원 삭제 불가
CREATE TABLE chat_room (
    id         BIGSERIAL       PRIMARY KEY,
    room_type  room_type_enum  NOT NULL,
    name       VARCHAR(100),
    created_by BIGINT          NOT NULL REFERENCES employee(id) ON DELETE RESTRICT,
    created_at TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_group_name CHECK (room_type != 'GROUP' OR name IS NOT NULL)
);

-- ── 11. chat_member (채팅 구성원) ────────────────────────────
-- room_id: CASCADE → 채팅방 삭제 시 멤버도 삭제
-- employee_id: CASCADE → 사원 삭제 시 채팅 멤버에서 제거
CREATE TABLE chat_member (
    id                   BIGSERIAL PRIMARY KEY,
    room_id              BIGINT    NOT NULL REFERENCES chat_room(id) ON DELETE CASCADE,
    employee_id          BIGINT    NOT NULL REFERENCES employee(id)  ON DELETE CASCADE,
    last_read_message_id BIGINT,
    UNIQUE (room_id, employee_id)
);
CREATE INDEX idx_chat_member_room     ON chat_member(room_id);
CREATE INDEX idx_chat_member_employee ON chat_member(employee_id);

-- ── 12. message (메시지) ─────────────────────────────────────
-- room_id: CASCADE → 채팅방 삭제 시 메시지도 삭제
-- sender_id: SET NULL → 사원 삭제 시 발신자 NULL (메시지는 유지)
CREATE TABLE message (
    id        BIGSERIAL      PRIMARY KEY,
    room_id   BIGINT         NOT NULL REFERENCES chat_room(id) ON DELETE CASCADE,
    sender_id BIGINT         REFERENCES employee(id) ON DELETE SET NULL,
    content   TEXT,
    msg_type  msg_type_enum  NOT NULL DEFAULT 'TEXT',
    file_id   BIGINT,
    sent_at   TIMESTAMP      NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_message_content CHECK (
        (msg_type = 'TEXT' AND content IS NOT NULL) OR
        (msg_type IN ('FILE', 'IMAGE') AND file_id IS NOT NULL) OR
        (msg_type = 'SYSTEM')
    )
);
CREATE INDEX idx_message_room    ON message(room_id);
CREATE INDEX idx_message_sent_at ON message(sent_at);
CREATE INDEX idx_message_sender  ON message(sender_id);

-- ── 13. file_attachment (첨부 파일) ──────────────────────────
-- uploader_id: RESTRICT → 파일 올린 사원 삭제 불가 (Service에서 처리)
-- ref_type + ref_id: 논리참조 (FK 없음, Service에서 직접 삭제 처리)
CREATE TABLE file_attachment (
    id            BIGSERIAL    PRIMARY KEY,
    uploader_id   BIGINT       NOT NULL REFERENCES employee(id) ON DELETE RESTRICT,
    original_name VARCHAR(255) NOT NULL,
    file_path     VARCHAR(512) NOT NULL,
    file_size     BIGINT       NOT NULL DEFAULT 0 CHECK (file_size >= 0),
    mime_type     VARCHAR(100),
    ref_type      VARCHAR(30)  CHECK (ref_type IN ('TASK', 'POST', 'APPROVAL', 'MESSAGE')),
    ref_id        BIGINT,
    version       INT          NOT NULL DEFAULT 1 CHECK (version >= 1),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_file_attachment_ref      ON file_attachment(ref_type, ref_id);
CREATE INDEX idx_file_attachment_uploader ON file_attachment(uploader_id);

-- ── 14. board (게시판) ───────────────────────────────────────
-- department_id: SET NULL → 부서 삭제 시 전사 게시판으로 전환
CREATE TABLE board (
    id            BIGSERIAL       PRIMARY KEY,
    board_type    board_type_enum NOT NULL,
    name          VARCHAR(100)    NOT NULL,
    department_id BIGINT          REFERENCES department(id) ON DELETE SET NULL,
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_board_type ON board(board_type);

-- ── 15. post (게시글) ────────────────────────────────────────
-- board_id: CASCADE → 게시판 삭제 시 게시글도 삭제
-- author_id: RESTRICT → 게시글 있는 사원 삭제 불가
CREATE TABLE post (
    id         BIGSERIAL    PRIMARY KEY,
    board_id   BIGINT       NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    author_id  BIGINT       NOT NULL REFERENCES employee(id) ON DELETE RESTRICT,
    title      VARCHAR(300) NOT NULL,
    content    TEXT         NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_post_board      ON post(board_id);
CREATE INDEX idx_post_author     ON post(author_id);
CREATE INDEX idx_post_created_at ON post(created_at);

-- ── 16. attendance (근태 기록) ───────────────────────────────
-- employee_id: CASCADE → 사원 삭제 시 근태 기록도 삭제
CREATE TABLE attendance (
    id             BIGSERIAL              PRIMARY KEY,
    employee_id    BIGINT                 NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    work_date      DATE                   NOT NULL,
    check_in_time  TIMESTAMP,
    check_out_time TIMESTAMP,
    status         attendance_status_type NOT NULL DEFAULT 'NORMAL',
    client_ip      VARCHAR(45),
    created_at     TIMESTAMP              NOT NULL DEFAULT NOW(),
    UNIQUE (employee_id, work_date),
    CONSTRAINT chk_checkout CHECK (check_out_time IS NULL OR check_in_time IS NULL OR check_out_time >= check_in_time)
);
CREATE INDEX idx_attendance_employee  ON attendance(employee_id);
CREATE INDEX idx_attendance_work_date ON attendance(work_date);

-- ── 17. leave_request (휴가 신청) ────────────────────────────
-- employee_id: CASCADE → 사원 삭제 시 휴가 신청도 삭제
-- approval_doc_id: SET NULL → 결재 문서 삭제 시 NULL로 변경
-- approver_id: SET NULL → 결재자 삭제 시 NULL로 변경
CREATE TABLE leave_request (
    id              BIGSERIAL         PRIMARY KEY,
    employee_id     BIGINT            NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    approval_doc_id BIGINT            REFERENCES approval_doc(id) ON DELETE SET NULL,
    leave_type      leave_type_enum   NOT NULL,
    start_date      DATE              NOT NULL,
    end_date        DATE              NOT NULL,
    days_count      NUMERIC(3,1)      NOT NULL CHECK (days_count > 0),
    reason          TEXT,
    status          leave_status_enum NOT NULL DEFAULT 'PENDING',
    approver_id     BIGINT            REFERENCES employee(id) ON DELETE SET NULL,
    created_at      TIMESTAMP         NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_leave_date CHECK (end_date >= start_date)
);
CREATE INDEX idx_leave_request_employee ON leave_request(employee_id);
CREATE INDEX idx_leave_request_status   ON leave_request(status);

-- ── 18. audit_log (감사 로그) ────────────────────────────────
-- FK 없는 독립 테이블 (actor_id 논리참조 - 퇴직자 로그 영구 보존)
CREATE TABLE audit_log (
    id          BIGSERIAL    PRIMARY KEY,
    actor_id    BIGINT,
    actor_name  VARCHAR(50),
    action      VARCHAR(50)  NOT NULL,
    target_type VARCHAR(30),
    target_id   BIGINT,
    client_ip   VARCHAR(45),
    user_agent  VARCHAR(500),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_log_actor      ON audit_log(actor_id);
CREATE INDEX idx_audit_log_action     ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================================
-- job_grade 한글 변환 참고 (프론트 statusLabels.js에서 사용)
-- STAFF             → 사원
-- SENIOR            → 주임
-- ASSISTANT_MANAGER → 대리
-- MANAGER           → 과장
-- GENERAL_MANAGER   → 부장
-- DIRECTOR          → 이사
-- CEO               → 대표
-- ============================================================