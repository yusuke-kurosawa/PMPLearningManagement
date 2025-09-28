// This file uses plain JS to avoid TypeScript compilation issues
// and is structured to prevent tree-shaking

const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
  GUEST: 'guest',
}

const PERMISSIONS = {
  VIEW_CONTENT: 'view_content',
  TAKE_EXAMS: 'take_exams',
  VIEW_PROGRESS: 'view_progress',
  EXPORT_DATA: 'export_data',
  CREATE_STUDY_GROUPS: 'create_study_groups',
  PARTICIPATE_DISCUSSIONS: 'participate_discussions',
  SHARE_NOTES: 'share_notes',
  MANAGE_USERS: 'manage_users',
  MANAGE_CONTENT: 'manage_content',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SYSTEM: 'manage_system',
  CREATE_EXAMS: 'create_exams',
  GRADE_EXAMS: 'grade_exams',
  MANAGE_COURSES: 'manage_courses',
}

// Prevent tree-shaking by making module side-effect-ful
if (typeof window !== 'undefined') {
  window.__ROLES_LOADED__ = true
}

// Export with explicit names to prevent minification issues
export { ROLES, PERMISSIONS }
