import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Lang = 'en' | 'ro'

export interface Translations {
  // Categories
  cat_lesson:     string
  cat_assignment: string
  cat_quiz:       string
  cat_project:    string
  cat_workshop:   string
  cat_session:    string

  // Due date labels
  due_overdue:    string
  due_today:      string
  due_tomorrow:   string
  due_in_days:    (n: number) => string
  due_starts_on:  string
  due_scheduled:  string
  due_date:       string

  // Activity list UI
  search_placeholder:   string
  all_categories:       string
  all_courses:          string
  no_course:            string
  filter:               string
  clear:                string
  earliest_first:       string
  latest_first:         string
  active_count:         (n: number) => string
  shown_of:             (shown: number, total: number) => string
  upcoming:             (n: number) => string
  no_upcoming:          string
  archive:              string
  archive_subtitle:     string
  archived_count:       (n: number) => string
  nothing_to_do:        string
  no_match_filters:     string
  due_today_badge:      (n: number) => string

  // Activity card
  est_suffix:     string
  logged_suffix:  string
  mark_as_done:   string
  restore:        string
  duplicate:      string
  edit:           string
  timer_running:  string
  start_timer:    string

  // Edit modal
  edit_activity:        string
  title_label:          string
  title_placeholder:    string
  title_required:       string
  description_label:    string
  category_label:       string
  course_label:         string
  no_course_option:     string
  recurrence_label:     string
  estimated_duration:   string
  goal_label:           string
  goal_optional:        string
  no_goal:              string
  steps_label:          string
  add_step:             string
  step_placeholder:     (n: number) => string
  cancel:               string
  save_changes:         string
  just_this_one:        string
  this_and_future:      string
  all_in_series:        string
  delete_btn:           string
  apply_forward:        string

  // Recurring group
  daily:          string
  every_n_days:   (n: number) => string
  weekly:         string
  every_n_weeks:  (n: number) => string
  done_of:        (done: number, total: number) => string
  next_prefix:    string
  edit_series:    string

  // Restore nudge
  restore_q:      string

  // Empty / welcome
  welcome_title:      string
  welcome_subtitle:   string
  step1_title:        string
  step1_desc:         string
  step2_title:        string
  step2_desc:         string
  step3_title:        string
  step3_desc:         string
  activity_types:     string

  // Insights
  today_label:          string
  overdue_label:        string
  due_today_label:      string
  done_today_label:     string
  day_streak:           string
  streak_start:         string
  streak_grace:         string
  streak_best:          string
  personal_best:        string
  last_14d:             string
  hours_done:           string
  hours_remaining:      string
  hours_total:          string
  busiest_day:          (label: string, count: number, hours: number) => string
  needs_attention:      string
  all_clear_week:       string
  nothing_due_7:        string
  course_workload:      string
  by_type:              string
  estimate_accuracy:    string
  underestimate_msg:    string
  overestimate_msg:     string
  on_point_msg:         string
  all_done_badge:       string
  pending_suffix:       (n: number) => string
  completed_of:         (done: number, total: number) => string
  hours_remaining_row:  (n: number) => string
  nothing_yet:          string
  add_to_see_insights:  string

  // Goals
  no_goals_title:       string
  no_goals_subtitle:    string
  create_first_goal:    string
  all_goals_complete:   string
  completed_section:    string
  new_goal:             string
  edit_goal:            string
  goal_title_label:     string
  target_date:          string
  colour_label:         string
  create_goal_btn:      string
  no_activities_linked: string
  mark_goal_complete_q: string
  mark_done_btn:        string
  completed_on:         (date: string) => string
  delete_goal_title:    string
  delete_goal_body:     (title: string) => string
  complete_goal_title:  string
  complete_goal_body:   (title: string) => string
  incomplete_warning:   (n: number, total: number) => string
  mark_complete_btn:    string
  hide_activities:      string
  show_activities:      string

  // Header / nav
  nav_list:       string
  nav_calendar:   string
  nav_insights:   string
  nav_goals:      string
  nav_courses:    string
  new_activity:   string
  print_btn:      string
  activities_title: string
  calendar_title:   string
  shortcuts_title:  string
  shortcuts_note:   string

  // Keyboard shortcuts
  shortcut_new_activity:   string
  shortcut_focus_search:   string
  shortcut_print:          string
  shortcut_list:           string
  shortcut_calendar:       string
  shortcut_insights:       string
  shortcut_goals:          string
  shortcut_toggle_panel:   string
  shortcut_close_modal:    string

  // Delete confirm modal
  delete_single:          string
  delete_this_future:     string
  delete_all_series:      string
  delete_confirm_title:   string
  delete_confirm_body:    (title: string) => string
  delete_confirm_series:  string

  linked_activities_complete: string

  // CourseManager
  courses_title:        string
  no_courses_yet:       string
  course_name_label:    string
  course_name_placeholder: string
  course_name_required: string
  colour_picker_label:  string
  add_course_btn:       string
  new_course_btn:       string
  save_btn:             string
  delete_course_confirm:(name: string) => string

  // CalendarView
  cal_month:            string
  cal_week:             string
  cal_today:            string
  cal_upcoming:         string
  cal_all:              string
  cal_nothing_coming:   string
  cal_nothing_subtitle: string
  cal_no_date:          string
  cal_select_day:       string
  cal_nothing_here:     string
  cal_click_to_view:    string
  cal_add:              string
  cal_hold_to_drag:     string
  cal_overdue:          string
  cal_courses_legend:   string
  cal_type_legend:      string
  cal_more:             (n: number) => string
  cal_total:            (n: number) => string
  cal_upcoming_count:   (n: number) => string
  cal_status_attended:  string
  cal_status_submitted: string
  cal_status_active:    string
  cal_status_planned:   string
  cal_completed_label:  string
  days_short:           string[]
}

// ─── English ──────────────────────────────────────────────────────────────────

export const en: Translations = {
  cat_lesson:     'Lesson',
  cat_assignment: 'Assignment',
  cat_quiz:       'Quiz',
  cat_project:    'Project',
  cat_workshop:   'Workshop',
  cat_session:    'Session',

  due_overdue:   'Overdue',
  due_today:     'Due today',
  due_tomorrow:  'Due tomorrow',
  due_in_days:   n => `Due in ${n} days`,
  due_starts_on: 'Starts on',
  due_scheduled: 'Scheduled for',
  due_date:      'Due date',

  search_placeholder:  'Search activities…',
  all_categories:      'All categories',
  all_courses:         'All courses',
  no_course:           'No course',
  filter:              'Filter',
  clear:               'Clear',
  earliest_first:      'Earliest first',
  latest_first:        'Latest first',
  active_count:        n => `${n} active`,
  shown_of:            (s, t) => `${s} of ${t} shown`,
  upcoming:            n => `${n} upcoming`,
  no_upcoming:         'No upcoming activities',
  archive:             'Archive',
  archive_subtitle:    'completed & past',
  archived_count:      n => `${n} archived`,
  nothing_to_do:       'Everything is in the archive — nothing left to do!',
  no_match_filters:    'No activities match your filters.',
  due_today_badge:     n => `${n} due today`,

  est_suffix:    'est.',
  logged_suffix: 'logged',
  mark_as_done:  'Mark as done?',
  restore:       'Restore',
  duplicate:     'Duplicate',
  edit:          'Edit',
  timer_running: 'Timer running',
  start_timer:   'Start timer',

  edit_activity:       'Edit activity',
  title_label:         'Title',
  title_placeholder:   'e.g. Chapter 5 Essay',
  title_required:      'Title is required',
  description_label:   'Description',
  category_label:      'Category',
  course_label:        'Course',
  no_course_option:    'No course',
  recurrence_label:    'Recurrence',
  estimated_duration:  'Estimated duration',
  goal_label:          'Goal',
  goal_optional:       '(optional)',
  no_goal:             'No goal',
  steps_label:         'Steps',
  add_step:            'Add step',
  step_placeholder:    n => `Step ${n}`,
  cancel:              'Cancel',
  save_changes:        'Save changes',
  just_this_one:       'Just this one',
  this_and_future:     'This & future',
  all_in_series:       'All in series',
  delete_btn:          'Delete',
  apply_forward:       'Apply forward',

  daily:          'Daily',
  every_n_days:   n => `Every ${n} days`,
  weekly:         'Weekly',
  every_n_weeks:  n => `Every ${n} weeks`,
  done_of:        (d, t) => `${d}/${t} done`,
  next_prefix:    'Next:',
  edit_series:    'Edit series',

  restore_q: 'Restore?',

  welcome_title:    'Welcome to Studiō',
  welcome_subtitle: 'Your academic planner. Track assignments, sessions, quizzes and more — all in one place.',
  step1_title:      'Create a course',
  step1_desc:       'Hit "Courses" in the header to add your subjects. Each course gets its own colour across the whole app.',
  step2_title:      'Add an activity',
  step2_desc:       'Press "New activity" to log an assignment, lesson, quiz or study session. Set a due date and estimated hours.',
  step3_title:      'Mark it done',
  step3_desc:       'Tap the circle next to any activity to confirm completion. Your streak on the Insights screen grows with each day you complete something.',
  activity_types:   'Activity types',

  today_label:       'Today',
  overdue_label:     'Overdue',
  due_today_label:   'Due today',
  done_today_label:  'Done today',
  day_streak:        'day streak',
  streak_start:      'Complete something today to start a streak',
  streak_grace:      'Complete something today to keep your streak alive',
  streak_best:       'Keep going',
  personal_best:     'Personal best!',
  last_14d:          'Last 14d',
  hours_done:        'done',
  hours_remaining:   'remaining',
  hours_total:       'total',
  busiest_day:       (label, count, hours) => `${label} is your busiest day — ${count} activities due${hours > 0 ? `, ~${hours}h of work` : ''}.`,
  needs_attention:   'Needs attention · next 7 days',
  all_clear_week:    'All clear for the week!',
  nothing_due_7:     'Nothing due in the next 7 days.',
  course_workload:   'Course workload',
  by_type:           'By type',
  estimate_accuracy: 'Estimate accuracy',
  underestimate_msg: 'You tend to underestimate — tasks take longer than planned',
  overestimate_msg:  'You tend to overestimate — you finish faster than planned',
  on_point_msg:      'Your estimates are on point',
  all_done_badge:    'All done',
  pending_suffix:    n => `${n} pending`,
  completed_of:      (d, t) => `${d}/${t} completed`,
  hours_remaining_row: n => `~${n}h remaining`,
  nothing_yet:         'Nothing yet',
  add_to_see_insights: 'Add activities to see your insights.',

  no_goals_title:       'No goals yet',
  no_goals_subtitle:    'Goals tie your activities to a bigger objective — like passing an exam or finishing a project.',
  create_first_goal:    'Create your first goal',
  all_goals_complete:   'All goals complete!',
  completed_section:    'Completed',
  new_goal:             'New goal',
  edit_goal:            'Edit goal',
  goal_title_label:     'Goal title',
  target_date:          'Target date',
  colour_label:         'Colour',
  create_goal_btn:      'Create goal',
  no_activities_linked: 'No activities linked yet',
  mark_goal_complete_q: 'All activities done — mark this goal complete?',
  mark_done_btn:        'Mark done',
  completed_on:         date => `Completed ${date}`,
  delete_goal_title:    'Delete goal?',
  delete_goal_body:     title => `"${title}" will be permanently removed. Linked activities won't be deleted — they'll just lose the goal association.`,
  complete_goal_title:  'Mark goal complete?',
  complete_goal_body:   title => `"${title}" will be marked as done.`,
  incomplete_warning:   (n, t) => `${n} of ${t} linked ${n === 1 ? 'activity is' : 'activities are'} still incomplete.`,
  mark_complete_btn:    'Mark complete',
  hide_activities:      'Hide activities',
  show_activities:      'Show activities',

  nav_list:       'List',
  nav_calendar:   'Calendar',
  nav_insights:   'Insights',
  nav_goals:      'Goals',
  nav_courses:    'Courses',
  new_activity:   'New activity',
  print_btn:      'Print',
  activities_title: 'Activities',
  calendar_title:   'Calendar',
  shortcuts_title:  'Keyboard shortcuts',
  shortcuts_note:   'Shortcuts are disabled while typing in fields',

  shortcut_new_activity:  'New activity',
  shortcut_focus_search:  'Focus search',
  shortcut_print:         'Print planner',
  shortcut_list:          'Switch to List',
  shortcut_calendar:      'Switch to Calendar',
  shortcut_insights:      'Switch to Insights',
  shortcut_goals:         'Switch to Goals',
  shortcut_toggle_panel:  'Toggle this panel',
  shortcut_close_modal:   'Close any modal',

  delete_single:         'Just this one',
  delete_this_future:    'This & future',
  delete_all_series:     'Entire series',
  delete_confirm_title:  'Delete activity?',
  delete_confirm_body:   title => `"${title}" will be permanently removed.`,
  delete_confirm_series: 'This is a recurring activity.',

  linked_activities_complete: 'linked activities complete',

  courses_title:         'Courses',
  no_courses_yet:        'No courses yet. Add one to get started.',
  course_name_label:     'Course name',
  course_name_placeholder: 'e.g. Calculus II',
  course_name_required:  'Course name is required',
  colour_picker_label:   'Colour',
  add_course_btn:        'Add course',
  new_course_btn:        'New course',
  save_btn:              'Save',
  delete_course_confirm: name => `Delete "${name}"?`,

  days_short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

  cal_month:            'Month',
  cal_week:             'Week',
  cal_today:            'Today',
  cal_upcoming:         'Upcoming',
  cal_all:              'All',
  cal_nothing_coming:   'Nothing coming up',
  cal_nothing_subtitle: 'No pending activities scheduled ahead.',
  cal_no_date:          'No date',
  cal_select_day:       'Select a day',
  cal_nothing_here:     'Nothing here — click to add',
  cal_click_to_view:    'Click a day to view',
  cal_add:              'Add',
  cal_hold_to_drag:     'Hold to drag',
  cal_overdue:          'Overdue',
  cal_courses_legend:   'Courses',
  cal_type_legend:      'Type',
  cal_more:             n => `+${n} more`,
  cal_total:            n => `${n} total`,
  cal_upcoming_count:   n => `${n} upcoming`,
  cal_status_attended:  'Attended',
  cal_status_submitted: 'Submitted',
  cal_status_active:    'Active',
  cal_status_planned:   'Planned',
  cal_completed_label:  '✓ Completed',
}

// ─── Romanian ─────────────────────────────────────────────────────────────────

export const ro: Translations = {
  cat_lesson:     'Lecție',
  cat_assignment: 'Temă',
  cat_quiz:       'Test',
  cat_project:    'Proiect',
  cat_workshop:   'Atelier',
  cat_session:    'Sesiune',

  due_overdue:   'Întârziat',
  due_today:     'Scadent azi',
  due_tomorrow:  'Scadent mâine',
  due_in_days:   n => `Scadent în ${n} zile`,
  due_starts_on: 'Începe pe',
  due_scheduled: 'Programat pe',
  due_date:      'Dată scadentă',

  search_placeholder:  'Caută activități…',
  all_categories:      'Toate categoriile',
  all_courses:         'Toate cursurile',
  no_course:           'Fără curs',
  filter:              'Filtrează',
  clear:               'Șterge filtre',
  earliest_first:      'Cele mai vechi primul',
  latest_first:        'Cele mai noi primul',
  active_count:        n => `${n} active`,
  shown_of:            (s, t) => `${s} din ${t} afișate`,
  upcoming:            n => `${n} viitoare`,
  no_upcoming:         'Nicio activitate viitoare',
  archive:             'Arhivă',
  archive_subtitle:    'finalizate și expirate',
  archived_count:      n => `${n} arhivate`,
  nothing_to_do:       'Totul e în arhivă — nimic de făcut!',
  no_match_filters:    'Nicio activitate nu corespunde filtrelor.',
  due_today_badge:     n => `${n} scadente azi`,

  est_suffix:    'est.',
  logged_suffix: 'înregistrate',
  mark_as_done:  'Marchează ca finalizat?',
  restore:       'Restaurează',
  duplicate:     'Duplică',
  edit:          'Editează',
  timer_running: 'Cronometru activ',
  start_timer:   'Pornește cronometrul',

  edit_activity:       'Editează activitatea',
  title_label:         'Titlu',
  title_placeholder:   'ex. Eseu Capitolul 5',
  title_required:      'Titlul este obligatoriu',
  description_label:   'Descriere',
  category_label:      'Categorie',
  course_label:        'Curs',
  no_course_option:    'Fără curs',
  recurrence_label:    'Recurență',
  estimated_duration:  'Durată estimată',
  goal_label:          'Obiectiv',
  goal_optional:       '(opțional)',
  no_goal:             'Fără obiectiv',
  steps_label:         'Pași',
  add_step:            'Adaugă pas',
  step_placeholder:    n => `Pasul ${n}`,
  cancel:              'Anulează',
  save_changes:        'Salvează modificările',
  just_this_one:       'Doar acesta',
  this_and_future:     'Acesta și următoarele',
  all_in_series:       'Toată seria',
  delete_btn:          'Șterge',
  apply_forward:       'Aplică înainte',

  daily:          'Zilnic',
  every_n_days:   n => `La fiecare ${n} zile`,
  weekly:         'Săptămânal',
  every_n_weeks:  n => `La fiecare ${n} săptămâni`,
  done_of:        (d, t) => `${d}/${t} finalizate`,
  next_prefix:    'Următor:',
  edit_series:    'Editează seria',

  restore_q: 'Restaurezi?',

  welcome_title:    'Bun venit în Studiō',
  welcome_subtitle: 'Planificatorul tău academic. Urmărește teme, sesiuni, teste și multe altele — totul într-un singur loc.',
  step1_title:      'Creează un curs',
  step1_desc:       'Apasă „Cursuri" în antet pentru a-ți adăuga materiile. Fiecare curs primește propria culoare în toată aplicația.',
  step2_title:      'Adaugă o activitate',
  step2_desc:       'Apasă „Activitate nouă" pentru a înregistra o temă, lecție, test sau sesiune de studiu. Setează data scadentă și orele estimate.',
  step3_title:      'Marchează ca finalizat',
  step3_desc:       'Atinge cercul de lângă orice activitate pentru a confirma finalizarea. Seria ta de pe ecranul Statistici crește cu fiecare zi în care finalizezi ceva.',
  activity_types:   'Tipuri de activități',

  today_label:       'Azi',
  overdue_label:     'Întârziate',
  due_today_label:   'Scadente azi',
  done_today_label:  'Finalizate azi',
  day_streak:        'zile la rând',
  streak_start:      'Finalizează ceva azi pentru a începe o serie',
  streak_grace:      'Finalizează ceva azi pentru a-ți păstra seria',
  streak_best:       'Continuă!',
  personal_best:     'Record personal!',
  last_14d:          'Ultimele 14z',
  hours_done:        'finalizate',
  hours_remaining:   'rămase',
  hours_total:       'total',
  busiest_day:       (label, count, hours) => `${label} este ziua ta cea mai aglomerată — ${count} activități scadente${hours > 0 ? `, ~${hours}h de lucru` : ''}.`,
  needs_attention:   'Necesită atenție · urmă­toarele 7 zile',
  all_clear_week:    'Totul e în regulă pentru săptămână!',
  nothing_due_7:     'Nimic scadent în următoarele 7 zile.',
  course_workload:   'Volum de lucru pe curs',
  by_type:           'Pe tip',
  estimate_accuracy: 'Precizia estimărilor',
  underestimate_msg: 'Tinzi să subestimezi — sarcinile durează mai mult decât plănuit',
  overestimate_msg:  'Tinzi să supraestimezi — termini mai repede decât plănuit',
  on_point_msg:      'Estimările tale sunt precise',
  all_done_badge:    'Totul finalizat',
  pending_suffix:    n => `${n} în așteptare`,
  completed_of:      (d, t) => `${d}/${t} finalizate`,
  hours_remaining_row: n => `~${n}h rămase`,
  nothing_yet:         'Nimic încă',
  add_to_see_insights: 'Adaugă activități pentru a vedea statisticile.',

  no_goals_title:       'Niciun obiectiv încă',
  no_goals_subtitle:    'Obiectivele leagă activitățile tale de un scop mai mare — cum ar fi promovarea unui examen sau finalizarea unui proiect.',
  create_first_goal:    'Creează primul obiectiv',
  all_goals_complete:   'Toate obiectivele sunt finalizate!',
  completed_section:    'Finalizate',
  new_goal:             'Obiectiv nou',
  edit_goal:            'Editează obiectivul',
  goal_title_label:     'Titlul obiectivului',
  target_date:          'Dată țintă',
  colour_label:         'Culoare',
  create_goal_btn:      'Creează obiectivul',
  no_activities_linked: 'Nicio activitate legată încă',
  mark_goal_complete_q: 'Toate activitățile sunt finalizate — marchezi obiectivul ca finalizat?',
  mark_done_btn:        'Marchează finalizat',
  completed_on:         date => `Finalizat pe ${date}`,
  delete_goal_title:    'Ștergi obiectivul?',
  delete_goal_body:     title => `„${title}" va fi eliminat permanent. Activitățile legate nu vor fi șterse — vor pierde doar asocierea cu obiectivul.`,
  complete_goal_title:  'Marchezi obiectivul ca finalizat?',
  complete_goal_body:   title => `„${title}" va fi marcat ca finalizat.`,
  incomplete_warning:   (n, t) => `${n} din ${t} ${n === 1 ? 'activitate este' : 'activități sunt'} încă nefinalizate.`,
  mark_complete_btn:    'Marchează finalizat',
  hide_activities:      'Ascunde activitățile',
  show_activities:      'Arată activitățile',

  nav_list:       'Listă',
  nav_calendar:   'Calendar',
  nav_insights:   'Statistici',
  nav_goals:      'Obiective',
  nav_courses:    'Cursuri',
  new_activity:   'Activitate nouă',
  print_btn:      'Tipărește',
  activities_title: 'Activități',
  calendar_title:   'Calendar',
  shortcuts_title:  'Scurtături de tastatură',
  shortcuts_note:   'Scurtăturile sunt dezactivate în timp ce scrieți în câmpuri',

  shortcut_new_activity:  'Activitate nouă',
  shortcut_focus_search:  'Focalizare căutare',
  shortcut_print:         'Tipărește planificatorul',
  shortcut_list:          'Comută la Listă',
  shortcut_calendar:      'Comută la Calendar',
  shortcut_insights:      'Comută la Statistici',
  shortcut_goals:         'Comută la Obiective',
  shortcut_toggle_panel:  'Comută acest panou',
  shortcut_close_modal:   'Închide orice modal',

  delete_single:         'Doar acesta',
  delete_this_future:    'Acesta și următoarele',
  delete_all_series:     'Întreaga serie',
  delete_confirm_title:  'Ștergi activitatea?',
  delete_confirm_body:   title => `„${title}" va fi eliminat permanent.`,
  delete_confirm_series: 'Aceasta este o activitate recurentă.',

  linked_activities_complete: 'activități legate completate',

  courses_title:         'Cursuri',
  no_courses_yet:        'Niciun curs încă. Adaugă unul pentru a începe.',
  course_name_label:     'Numele cursului',
  course_name_placeholder: 'ex. Calcul II',
  course_name_required:  'Numele cursului este obligatoriu',
  colour_picker_label:   'Culoare',
  add_course_btn:        'Adaugă cursul',
  new_course_btn:        'Curs nou',
  save_btn:              'Salvează',
  delete_course_confirm: name => `Ștergi „${name}"?`,

  days_short: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],

  cal_month:            'Lună',
  cal_week:             'Săptămână',
  cal_today:            'Azi',
  cal_upcoming:         'Viitoare',
  cal_all:              'Toate',
  cal_nothing_coming:   'Nimic în viitor',
  cal_nothing_subtitle: 'Nicio activitate în așteptare programată.',
  cal_no_date:          'Fără dată',
  cal_select_day:       'Selectează o zi',
  cal_nothing_here:     'Nimic aici — apasă pentru a adăuga',
  cal_click_to_view:    'Apasă pe o zi pentru a vedea',
  cal_add:              'Adaugă',
  cal_hold_to_drag:     'Ține apăsat pentru a trage',
  cal_overdue:          'Întârziat',
  cal_courses_legend:   'Cursuri',
  cal_type_legend:      'Tip',
  cal_more:             n => `+${n} mai multe`,
  cal_total:            n => `${n} total`,
  cal_upcoming_count:   n => `${n} viitoare`,
  cal_status_attended:  'Participat',
  cal_status_submitted: 'Trimis',
  cal_status_active:    'Activ',
  cal_status_planned:   'Planificat',
  cal_completed_label:  '✓ Finalizat',
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface LangState {
  lang: Lang
  t:    Translations
  locale: string
  setLang: (lang: Lang) => void
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang:   'en',
      t:      en,
      locale: 'en-GB',
      setLang: (lang) => set({
        lang,
        t:      lang === 'ro' ? ro : en,
        locale: lang === 'ro' ? 'ro-RO' : 'en-GB',
      }),
    }),
    {
      name:    'studio-lang',
      storage: createJSONStorage(() => localStorage),
      partialize: s => ({ lang: s.lang }),
      onRehydrateStorage: () => state => {
        if (state) {
          state.t      = state.lang === 'ro' ? ro : en
          state.locale = state.lang === 'ro' ? 'ro-RO' : 'en-GB'
        }
      },
    }
  )
)

// Convenience hook — returns just the translations object
export function useT() {
  return useLangStore(s => s.t)
}

// Convenience hook — returns the locale string for date formatting
export function useLocale() {
  return useLangStore(s => s.locale)
}
