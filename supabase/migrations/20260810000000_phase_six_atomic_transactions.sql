-- Migration: 20260810000000_phase_six_atomic_transactions.sql
-- Description: Implement atomic PostgreSQL RPC stored functions for Phase 6 bulk marks entry, result approval, and result publication.

create or replace function public.rpc_bulk_enter_marks(
  p_component_id uuid,
  p_records jsonb,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_comp record;
  v_rec record;
  v_student_id uuid;
  v_marks numeric(5,2);
  v_is_absent boolean;
  v_remarks text;
  v_grade text;
  v_desc_result text;
  v_pct numeric(5,2);
  v_inserted_count integer := 0;
begin
  select * into v_comp from public.exam_components where id = p_component_id;
  if not found then
    raise exception 'EXAM_COMPONENT_NOT_FOUND: Component % does not exist', p_component_id;
  end if;

  for v_rec in select * from jsonb_to_recordset(p_records) as x(
    "studentId" uuid,
    "marksObtained" numeric,
    "isAbsent" boolean,
    "remarks" text
  )
  loop
    v_student_id := v_rec."studentId";
    v_is_absent := coalesce(v_rec."isAbsent", false) or v_rec."marksObtained" is null;
    
    if not v_is_absent then
      v_marks := v_rec."marksObtained";
      if v_marks < 0 then
        raise exception 'INVALID_MARKS: Marks obtained (%) cannot be negative for student %', v_marks, v_student_id;
      end if;
      if v_marks > v_comp.maximum_marks then
        raise exception 'INVALID_MARKS: Marks obtained (%) exceeds maximum allowed (%) for student %', v_marks, v_comp.maximum_marks, v_student_id;
      end if;
      
      v_pct := (v_marks / v_comp.maximum_marks) * 100.0;
      if v_marks >= v_comp.passing_marks then
        v_desc_result := 'PASSED';
      else
        v_desc_result := 'FAILED';
      end if;

      if v_pct >= 80 then v_grade := 'A+';
      elsif v_pct >= 70 then v_grade := 'A';
      elsif v_pct >= 60 then v_grade := 'B';
      elsif v_pct >= 50 then v_grade := 'C';
      elsif v_pct >= 40 then v_grade := 'D';
      else v_grade := 'F';
      end if;
    else
      v_marks := null;
      v_grade := 'F';
      v_desc_result := 'ABSENT';
    end if;

    insert into public.student_results (
      exam_component_id,
      student_id,
      marks_obtained,
      grade,
      descriptive_result,
      remarks,
      entered_by,
      approval_status
    )
    values (
      p_component_id,
      v_student_id,
      v_marks,
      v_grade,
      v_desc_result,
      v_rec.remarks,
      p_actor_id,
      'submitted'
    )
    on conflict (exam_component_id, student_id) do update set
      marks_obtained = excluded.marks_obtained,
      grade = excluded.grade,
      descriptive_result = excluded.descriptive_result,
      remarks = excluded.remarks,
      entered_by = excluded.entered_by,
      approval_status = 'submitted',
      updated_at = now();

    v_inserted_count := v_inserted_count + 1;
  end loop;

  return jsonb_build_object('success', true, 'count', v_inserted_count);
end;
$$;

create or replace function public.rpc_approve_exam_results(
  p_exam_id uuid,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_exam record;
  v_comp_ids uuid[];
  v_unsubmitted_count integer;
begin
  select * into v_exam from public.exams where id = p_exam_id for update;
  if not found then
    raise exception 'EXAM_NOT_FOUND: Exam % does not exist', p_exam_id;
  end if;

  select array_agg(id) into v_comp_ids from public.exam_components where exam_id = p_exam_id;
  if v_comp_ids is null or array_length(v_comp_ids, 1) is null then
    raise exception 'INCOMPLETE_EXAM: Cannot approve exam without subject components';
  end if;

  select count(*) into v_unsubmitted_count
  from public.student_results
  where exam_component_id = any(v_comp_ids)
    and approval_status = 'pending';

  if v_unsubmitted_count > 0 then
    raise exception 'UNSUBMITTED_RESULTS: Exam contains % pending result records that must be submitted prior to approval', v_unsubmitted_count;
  end if;

  update public.student_results
  set approval_status = 'approved',
      updated_at = now()
  where exam_component_id = any(v_comp_ids);

  update public.exams
  set status = 'approved',
      updated_at = now()
  where id = p_exam_id;

  return jsonb_build_object('success', true, 'examId', p_exam_id, 'status', 'approved');
end;
$$;

create or replace function public.rpc_publish_exam_results(
  p_exam_id uuid,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_exam record;
  v_comp_ids uuid[];
  v_unapproved_count integer;
begin
  select * into v_exam from public.exams where id = p_exam_id for update;
  if not found then
    raise exception 'EXAM_NOT_FOUND: Exam % does not exist', p_exam_id;
  end if;

  select array_agg(id) into v_comp_ids from public.exam_components where exam_id = p_exam_id;
  if v_comp_ids is null or array_length(v_comp_ids, 1) is null then
    raise exception 'INCOMPLETE_EXAM: Cannot publish exam without subject components';
  end if;

  select count(*) into v_unapproved_count
  from public.student_results
  where exam_component_id = any(v_comp_ids)
    and approval_status != 'approved'
    and approval_status != 'published';

  if v_unapproved_count > 0 then
    raise exception 'UNAPPROVED_RESULTS: Exam contains % results that have not been approved by administration', v_unapproved_count;
  end if;

  update public.student_results
  set approval_status = 'published',
      published_at = coalesce(published_at, now()),
      updated_at = now()
  where exam_component_id = any(v_comp_ids);

  update public.exams
  set status = 'published',
      updated_at = now()
  where id = p_exam_id;

  return jsonb_build_object('success', true, 'examId', p_exam_id, 'status', 'published');
end;
$$;

grant execute on function public.rpc_bulk_enter_marks(uuid, jsonb, uuid) to service_role;
grant execute on function public.rpc_approve_exam_results(uuid, uuid) to service_role;
grant execute on function public.rpc_publish_exam_results(uuid, uuid) to service_role;
