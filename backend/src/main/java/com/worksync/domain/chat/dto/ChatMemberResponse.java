package com.worksync.domain.chat.dto;

import com.worksync.domain.chat.entity.ChatMember;
import com.worksync.domain.employee.entity.JobGrade;
import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class ChatMemberResponse {

    private Long employeeId;
    private String name;
    private JobGrade jobGrade;
    private String profileImage;

    public static ChatMemberResponse from(ChatMember member) {
        return ChatMemberResponse.builder()
                .employeeId(member.getEmployee().getId())
                .name(member.getEmployee().getName())
                .jobGrade(member.getEmployee().getJobGrade())
                .profileImage(member.getEmployee().getProfileImage())
                .build();
    }
}
