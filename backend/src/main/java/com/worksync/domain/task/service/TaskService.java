package com.worksync.domain.task.service;


import com.worksync.domain.department.entity.Department;
import com.worksync.domain.department.repository.DepartmentRepository;
import com.worksync.domain.employee.entity.Employee;
import com.worksync.domain.employee.repository.EmployeeRepository;
import com.worksync.domain.file.repository.FileAttachmentRepository;
import com.worksync.domain.notification.entity.NotificationType;
import com.worksync.domain.notification.service.NotificationService;
import com.worksync.domain.task.dto.TaskCreateRequest;
import com.worksync.domain.task.dto.TaskResponse;
import com.worksync.domain.task.entity.Task;
import com.worksync.domain.task.entity.TaskStatus;
import com.worksync.domain.task.repository.TaskRepository;
import com.worksync.global.exception.CustomException;
import com.worksync.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {
    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final FileAttachmentRepository fileAttachmentRepository;
    private final NotificationService notificationService;

    //업무 생성
    @Transactional
    public TaskResponse create(Long creatorId, TaskCreateRequest request) {
        Employee creator = employeeRepository.findById(creatorId)
                .orElseThrow(() -> new CustomException(ErrorCode.EMPLOYEE_NOT_FOUND));

        Employee assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = employeeRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new CustomException(ErrorCode.EMPLOYEE_NOT_FOUND));
        }

    Department department=null;
        if(request.getDepartmentId() !=null){
            department=departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(()->new CustomException(ErrorCode.DEPARTMENT_NOT_FOUND));
        }

    // 진행률 10단위 검증
        if (request.getProgress() !=null && request.getProgress()%10 !=0){
            throw new CustomException(ErrorCode.INVALID_PROGRESS);
        }
        Task task= Task.builder()
            .creator(creator)
            .assignee(assignee)
            .department(department)
            .title(request.getTitle())
            .description(request.getDescription())
            .status(request.getStatus() !=null ? request.getStatus(): TaskStatus.TODO)
            .progress(request.getProgress() !=null ? request.getProgress() : 0)
            .startDate(request.getStartDate())
            .dueDate(request.getDueDate())
            .build();
        Task saved=taskRepository.save(task);

        //SSE담당자 알림 발송(담당자가 본인이 아닌경우)
        if(assignee !=null && !assignee.getId().equals(creatorId)){
            notificationService.send(
                    assignee.getId(),
                    NotificationType.TASK,
                    creator.getName()+"s님이 업무를 등록했습니다:"+request.getTitle(),
                    "TASK",
                    saved.getId()
            );
        }
        return TaskResponse.from(saved);
    }

    //단건 조회(첨부파일 포함)
    public  TaskResponse getById(Long taskId){

    }

}
