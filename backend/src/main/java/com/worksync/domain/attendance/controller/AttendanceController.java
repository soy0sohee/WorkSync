package com.worksync.domain.attendance.controller;

import com.worksync.domain.attendance.dto.AttendanceResponse;
import com.worksync.domain.attendance.service.AttendanceService;
import com.worksync.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

  private final AttendanceService attendanceService;

  // 출근 체크
  @PostMapping("/check-in")
  public ApiResponse<AttendanceResponse> checkIn(
          @RequestParam("employeeId") Long employeeId,
          HttpServletRequest request
  ){
    String clintIp = request.getRemoteAddr();
    return ApiResponse.ok(attendanceService.checkIn(employeeId,clintIp));
  }

  // 퇴근 체크
  @PostMapping("/check-out")
  public ApiResponse<AttendanceResponse> checkOut(
          @RequestParam("employeeId") Long employeeId
  ){
    return ApiResponse.ok(attendanceService.checkOut(employeeId));
  }

  // 내 근태 월별 조회
  @GetMapping("/my")
  public ApiResponse<List<AttendanceResponse>> getMyAttendance(
          @RequestParam("employeeId") Long employeeId,
          @RequestParam("year") int year,
          @RequestParam("month") int month
  ){
    return ApiResponse.ok(attendanceService.getMyAttendance(employeeId, year, month));
  }

  // 단건 조회
  @GetMapping("/{id}")
  public ApiResponse<AttendanceResponse> findById(
          @PathVariable("id") Long id
  ) {
    return ApiResponse.ok(attendanceService.findById(id));
  }

  // ADMIN 전용 전체 조회
  @GetMapping
  public ApiResponse<List<AttendanceResponse>> getAttendanceByDate(
          @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
  ){
    return ApiResponse.ok(attendanceService.getAttendanceByDate(date));
  }
}
