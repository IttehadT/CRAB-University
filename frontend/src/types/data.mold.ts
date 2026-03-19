// src/types/data.mold.ts

export interface ClassScheduleMold {
  startTime: string;
  endTime: string;
  day: string;
}

export interface SectionScheduleMold {
  classPairId: number | null;
  classSlotId: number | null;
  finalExamDate: string | null;
  finalExamStartTime: string | null;
  finalExamEndTime: string | null;
  midExamDate: string | null;
  midExamStartTime: string | null;
  midExamEndTime: string | null;
  finalExamDetail: string | null;
  midExamDetail: string | null;
  classStartDate: string | null;
  classEndDate: string | null;
  classSchedules: ClassScheduleMold[] | null;
}

// The Master Outline
export interface CourseMold {
  sectionId: number;
  courseId: number;
  sectionName: string;
  courseCredit: number;
  courseCode: string;
  sectionType: string;
  capacity: number;
  consumedSeat: number;
  semesterSessionId: number;
  parentSectionId: number | null;
  faculties: string | null;
  roomName: string | null;
  roomNumber: string | null;
  courseType: string;
  academicDegree: string;
  sectionSchedule: SectionScheduleMold | null;
  courseName: string;
  prerequisiteCourses: string | null;
  labSchedules: ClassScheduleMold[] | null;
  labSectionId: number | null;
  labCourseCode: string | null;
  labFaculties: string | null;
  labName: string | null;
  labRoomName: string | null;
  preRegLabSchedule: string | null;
  preRegSchedule: string | null;
}