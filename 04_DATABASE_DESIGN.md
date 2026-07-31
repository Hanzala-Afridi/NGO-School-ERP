# Database Design

## 1. General Rules

- PostgreSQL is the primary database.
- UUIDs should be used for primary keys.
- Every table should include appropriate timestamps.
- Soft deletion should be used only where business history must be preserved.
- Foreign keys must protect referential integrity.
- Important operations should use transactions.
- Sensitive data should be minimized and protected.
- Indexes should be added based on actual query patterns.

## 2. Core Identity Tables

### profiles

Extends Supabase Auth users.

Suggested fields:

- id
- auth_user_id
- full_name
- phone
- email
- profile_image_url
- status
- created_at
- updated_at

### roles

- id
- name
- description
- is_system_role

### permissions

- id
- key
- description

### user_roles

- user_id
- role_id

### role_permissions

- role_id
- permission_id

## 3. Academic Structure

### academic_years

- id
- name
- start_date
- end_date
- status

### terms

- id
- academic_year_id
- name
- start_date
- end_date
- status

### classes

- id
- name
- grade_level
- display_order
- status

### sections

- id
- class_id
- name
- capacity
- status

### subjects

- id
- name
- code
- status

### class_subjects

- id
- academic_year_id
- class_id
- section_id
- subject_id
- teacher_id

## 4. People and Enrollment

### students

- id
- student_number
- full_name
- date_of_birth
- gender
- admission_date
- status
- profile_image_url
- address
- emergency_contact
- notes
- created_at
- updated_at

### guardians

- id
- profile_id
- full_name
- phone
- email
- occupation
- relationship_notes
- address
- status

### student_guardians

- student_id
- guardian_id
- relationship
- is_primary
- can_receive_student
- receives_notifications

### teachers

- id
- profile_id
- employee_number
- joining_date
- qualification
- employment_status

### enrollments

- id
- student_id
- academic_year_id
- class_id
- section_id
- roll_number
- enrollment_status
- start_date
- end_date

## 5. Attendance

### attendance_sessions

- id
- academic_year_id
- class_id
- section_id
- attendance_date
- marked_by
- status
- locked_at

Unique constraint should prevent duplicate sessions for the same class, section, and date.

### attendance_records

- id
- attendance_session_id
- student_id
- status
- remarks
- marked_at
- updated_by

Unique constraint:

- attendance_session_id
- student_id

### attendance_correction_requests

- id
- attendance_record_id
- requested_by
- old_status
- requested_status
- reason
- approval_status
- reviewed_by
- reviewed_at

## 6. Homework and Performance

### homework

- id
- class_subject_id
- title
- instructions
- assigned_date
- due_date
- attachment_url
- created_by
- status

### performance_notes

- id
- student_id
- academic_year_id
- term_id
- subject_id
- teacher_id
- category
- rating
- note
- visibility
- approval_status
- created_at

## 7. Exams and Results

### exams

- id
- academic_year_id
- term_id
- name
- start_date
- end_date
- status

### exam_subjects

- id
- exam_id
- class_subject_id
- exam_date
- maximum_marks
- passing_marks

### student_marks

- id
- exam_subject_id
- student_id
- marks_obtained
- grade
- remarks
- entered_by
- approval_status
- published_at

Unique constraint:

- exam_subject_id
- student_id

## 8. Household and Welfare

### households

- id
- household_code
- primary_guardian_id
- address
- household_size
- monthly_income
- housing_status
- eligibility_status
- verification_status
- last_verified_at
- next_review_at
- notes

### household_members

- id
- household_id
- full_name
- relationship
- date_of_birth
- occupation
- student_id nullable

### welfare_assessments

- id
- household_id
- assessed_by
- assessment_date
- income_score
- vulnerability_score
- recommendation
- status
- approved_by
- approved_at
- notes

### welfare_documents

- id
- household_id
- document_type
- file_url
- uploaded_by
- uploaded_at

## 9. Ration Management

### ration_packages

- id
- name
- description
- active

### ration_package_items

- id
- ration_package_id
- inventory_item_id
- quantity

### ration_cycles

- id
- name
- period_start
- period_end
- distribution_start
- distribution_end
- status

### ration_allocations

- id
- ration_cycle_id
- household_id
- ration_package_id
- eligibility_snapshot
- approval_status
- approved_by

Unique constraint:

- ration_cycle_id
- household_id

### ration_distributions

- id
- ration_allocation_id
- distribution_date
- distribution_type
- status
- issued_by
- received_by_name
- receiver_identifier
- acknowledgment_url
- reason_not_issued
- notes

## 10. Inventory and Material Support

### inventory_categories

- id
- name
- description

### inventory_items

- id
- category_id
- sku
- name
- unit
- size
- class_level
- gender_option
- minimum_stock
- active

### warehouses

- id
- name
- location
- active

### stock_transactions

- id
- inventory_item_id
- warehouse_id
- transaction_type
- quantity
- unit_cost
- reference_type
- reference_id
- performed_by
- transaction_date
- notes

Transaction types may include:

- receipt
- issue
- transfer_in
- transfer_out
- adjustment_in
- adjustment_out
- damage
- loss

### student_distributions

- id
- student_id
- inventory_item_id
- quantity
- distribution_type
- distribution_date
- issued_by
- received_by_name
- reason
- approval_status
- notes

Distribution types:

- uniform
- book
- notebook
- bag
- stationery
- other

## 11. Communication

### announcements

- id
- title
- body
- priority
- publish_at
- expires_at
- created_by
- status

### announcement_targets

- id
- announcement_id
- target_type
- target_id

## 12. Audit and Files

### audit_logs

- id
- actor_user_id
- action
- entity_type
- entity_id
- old_values
- new_values
- ip_address
- user_agent
- created_at

### attachments

- id
- entity_type
- entity_id
- file_name
- file_url
- mime_type
- size_bytes
- uploaded_by
- created_at

## 13. Suggested Indexes

Add indexes for:

- students.student_number
- students.full_name
- enrollments.student_id
- enrollments.class_id, section_id, academic_year_id
- attendance_sessions.attendance_date
- attendance_records.student_id
- homework.class_subject_id, due_date
- student_marks.student_id
- households.household_code
- households.eligibility_status
- ration_allocations.ration_cycle_id, household_id
- stock_transactions.inventory_item_id, warehouse_id, transaction_date
- student_distributions.student_id, distribution_date
- audit_logs.entity_type, entity_id
- audit_logs.actor_user_id
- audit_logs.created_at

## 14. Row-Level Security

If Supabase Row-Level Security is used directly, policies must be carefully designed.

However, the Express backend remains the primary authorization layer for business operations.

Never expose the Supabase service-role key to the frontend.
