import { Student, Students } from 'types/student.type'
import http from 'utils/http'

export const getStudents = (page: number | string, limit: number | string) => {
  return http.get<Students>('students', {
    params: {
      _page: page,
      _limit: limit
    }
  })
}

export const addStudent = (student: Omit<Student, 'id'>) => http.post<Student>('/students', student)
