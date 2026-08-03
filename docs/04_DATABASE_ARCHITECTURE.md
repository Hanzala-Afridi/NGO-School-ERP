# Database Architecture

## 1. Platform and Standards

- PostgreSQL on Supabase
- Supabase Auth for identities
- Express backend for business operations
- UUID primary keys
- SQL migrations committed to Git
- Foreign keys and unique constraints
- Transactions for sensitive multi-step operations
- RLS on exposed tables

## 2. Identity and Authorization

### profiles

`id, auth_user_id, full_name, email, phone, profile_image_url, status, created_at, updated_at`

### roles

`id, name, description, is_system`

### permissions

`id, key, description`

### user_roles

`user_id, role_id`

### role_permissions

`role_id, permission_id`

## 3. School and Academics

### schools

`id, name, code, address, phone, email, logo_url, status`

### campuses

Keep one default campus in Version 1 to support Version 2 later.

`id, school_id, name, code, address, status`

### academic_years

`id, school_id, name, start_date, end_date, status`

### terms

`id, academic_year_id, name, start_date, end_date, status`

### classes

`id, school_id, name, code, grade_order, status`

Seed KG 1, KG 2, KG 3, Class 1, Class 2, and Class 3, while allowing dynamic classes.

### sections

`id, class_id, name, capacity, status`

### subjects

`id, school_id, name, code, status`

### teacher_assignments

`id, teacher_id, academic_year_id, class_id, section_id, subject_id, is_class_teacher, status`

### timetable_entries

`id, academic_year_id, class_id, section_id, subject_id, teacher_id, weekday, start_time, end_time, room, status`

## 4. People and Enrollment

### students

`id, school_id, student_number, full_name, date_of_birth, gender, admission_date, profile_image_url, address, emergency_notes, status, created_by, created_at, updated_at`

### parents

`id, profile_id, full_name, phone, email, occupation, address, status`

### student_parents

`student_id, parent_id, relationship, is_primary, receives_notifications, portal_access_enabled`

### student_siblings

`student_id_a, student_id_b`

### teachers

`id, profile_id, employee_number, qualification, joining_date, employment_status`

### enrollments

`id, student_id, academic_year_id, class_id, section_id, roll_number, status, start_date, end_date`

Prevent multiple active enrollments for the same student and academic year.

## 5. Attendance

### attendance_sessions

`id, academic_year_id, class_id, section_id, attendance_date, status, marked_by, locked_at`

Unique by academic year, class, section, and date.

### attendance_records

`id, attendance_session_id, student_id, attendance_status, remarks, marked_at, updated_by`

Unique by attendance session and student.

### attendance_corrections

`id, attendance_record_id, old_status, requested_status, reason, requested_by, approval_status, reviewed_by, reviewed_at`

## 6. Homework, Progress, and Results

### homework

`id, teacher_assignment_id, title, instructions, assigned_date, due_date, attachment_path, status, created_by`

### progress_categories

`id, school_id, name, description, active`

### student_progress

`id, student_id, academic_year_id, term_id, teacher_id, subject_id, category_id, rating, note, visibility_status, recorded_at`

### exams

`id, academic_year_id, term_id, name, start_date, end_date, status`

### exam_components

`id, exam_id, class_id, section_id, subject_id, exam_date, maximum_marks, passing_marks, assessment_type`

### student_results

`id, exam_component_id, student_id, marks_obtained, grade, descriptive_result, remarks, entered_by, approval_status, published_at`

Unique by exam component and student.

## 7. Communication

### announcements

`id, school_id, title, body, priority, publish_at, expires_at, created_by, status`

### announcement_targets

`id, announcement_id, target_type, target_id`

### conversations

`id, conversation_type, student_id, created_by, status, created_at`

### conversation_participants

`conversation_id, profile_id`

### messages

`id, conversation_id, sender_profile_id, body, attachment_path, created_at, read_at`

### complaints

`id, parent_id, student_id, assigned_teacher_id, assigned_admin_id, category, subject, description, priority, status, resolution, created_at, resolved_at`

## 8. Welfare and Ration

### households

`id, household_code, primary_parent_id, address, household_size, income_category, housing_status, eligibility_status, verification_status, last_verified_at, next_review_at, restricted_notes`

### household_members

`id, household_id, full_name, relationship, date_of_birth, occupation, student_id`

### welfare_assessments

`id, household_id, assessment_date, assessed_by, vulnerability_level, recommendation, status, approved_by, approved_at, next_review_at`

### welfare_documents

`id, household_id, document_type, storage_path, uploaded_by, created_at`

### ration_packages

`id, name, description, active`

### ration_package_items

`id, ration_package_id, inventory_item_id, quantity`

### ration_cycles

`id, name, period_month, period_year, distribution_start, distribution_end, status`

### ration_allocations

`id, ration_cycle_id, household_id, ration_package_id, approval_status, approved_by, eligibility_snapshot`

Unique by ration cycle and household.

### ration_distributions

`id, ration_allocation_id, distribution_method, distribution_date, status, issued_by, received_by_name, acknowledgment_path, non_issue_reason, reversal_reason, reversed_by, reversed_at`

## 9. Inventory, Distribution, and Expenses

### inventory_categories

`id, name, description`

### inventory_items

`id, category_id, sku, name, unit, size, class_level, gender_variant, minimum_stock, active`

### storage_locations

`id, school_id, name, location, active`

### suppliers

`id, name, contact_person, phone, email, address`

### stock_transactions

`id, item_id, storage_location_id, transaction_type, quantity, unit_cost, reference_type, reference_id, performed_by, transaction_date, notes`

### student_distributions

`id, student_id, inventory_item_id, distribution_type, quantity, size_or_variant, issue_date, reason, replacement_of_distribution_id, approval_status, issued_by, received_by_name, acknowledgment_path, reversed_at`

### expense_categories

`id, name, description, active`

### expenses

`id, category_id, expense_date, amount, payee, payment_method, description, receipt_path, reference_type, reference_id, status, created_by, voided_by, voided_at, void_reason`

## 10. Audit and Files

### audit_logs

`id, actor_profile_id, action, entity_type, entity_id, old_values_json, new_values_json, ip_address, user_agent, created_at`

### attachments

`id, entity_type, entity_id, file_name, storage_path, mime_type, size_bytes, uploaded_by, created_at`

## 11. Critical Rules

- Never expose the Supabase service-role key to frontend code.
- Parent data access requires an active parent-child link.
- Teacher data access requires an active assignment.
- Use database transactions for ration issue, material issue, stock adjustment, and reversal.
- Prevent duplicate attendance and duplicate ration allocation with database constraints.
- Maintain an immutable ledger and audit trail for sensitive operations.
