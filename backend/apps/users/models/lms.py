import uuid
from django.db import models

class Trainers(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=False, blank=False, related_name='trainers_user')
    bio = models.TextField(null=True, blank=True)
    expertise = models.JSONField(null=True, blank=True)
    approval_status = models.CharField(max_length=255, null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'trainers'

class TrainerKycDocuments(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey('Trainers', on_delete=models.CASCADE, null=True, blank=True, related_name='trainer_kyc_documents_trainer')
    document_type = models.CharField(max_length=255, null=True, blank=True)
    file_url = models.TextField(null=True, blank=True)
    verification_status = models.CharField(max_length=255, null=True, blank=True)
    uploaded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'trainer_kyc_documents'

class TrainerBankDetails(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey('Trainers', on_delete=models.CASCADE, null=True, blank=True, related_name='trainer_bank_details_trainer')
    account_holder_name = models.CharField(max_length=255, null=True, blank=True)
    bank_name = models.CharField(max_length=255, null=True, blank=True)
    account_number = models.CharField(max_length=255, null=True, blank=True)
    ifsc_code = models.CharField(max_length=255, null=True, blank=True)
    tax_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'trainer_bank_details'

class Institutes(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='institutes_user')
    name = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    accreditation_number = models.CharField(max_length=255, null=True, blank=True)
    documents = models.JSONField(null=True, blank=True)
    verification_status = models.CharField(max_length=255, null=True, blank=True)
    verified_badge = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'institutes'

class Courses(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey('Trainers', on_delete=models.CASCADE, null=True, blank=True, related_name='courses_trainer')
    institute = models.ForeignKey('Institutes', on_delete=models.CASCADE, null=True, blank=True, related_name='courses_institute')
    title = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=255, null=True, blank=True)
    is_free = models.BooleanField(default=False)
    language = models.CharField(max_length=255, null=True, blank=True)
    certificate_available = models.BooleanField(default=False)
    approval_status = models.CharField(max_length=255, null=True, blank=True)
    preview_video_url = models.TextField(null=True, blank=True)
    learning_outcomes = models.TextField(null=True, blank=True)
    prerequisites = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'courses'

class CourseSkills(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey('Courses', on_delete=models.CASCADE, null=True, blank=True, related_name='course_skills_course')
    skill = models.ForeignKey('Skills', on_delete=models.CASCADE, null=True, blank=True, related_name='course_skills_skill')
    skill_level = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'course_skills'

class CourseSections(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey('Courses', on_delete=models.CASCADE, null=True, blank=True, related_name='course_sections_course')
    title = models.CharField(max_length=255, null=True, blank=True)
    order_index = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'course_sections'

class Lectures(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey('CourseSections', on_delete=models.CASCADE, null=True, blank=True, related_name='lectures_section')
    title = models.CharField(max_length=255, null=True, blank=True)
    lecture_type = models.CharField(max_length=255, null=True, blank=True)
    content_url = models.TextField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'lectures'

class QuizQuestions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lecture = models.ForeignKey('Lectures', on_delete=models.CASCADE, null=True, blank=True, related_name='quiz_questions_lecture')
    question_text = models.TextField(null=True, blank=True)
    question_type = models.CharField(max_length=255, null=True, blank=True)
    passing_score = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'quiz_questions'

class QuizOptions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey('QuizQuestions', on_delete=models.CASCADE, null=True, blank=True, related_name='quiz_options_question')
    option_text = models.TextField(null=True, blank=True)
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = 'quiz_options'

class QuizAttempts(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey('QuizQuestions', on_delete=models.CASCADE, null=True, blank=True, related_name='quiz_attempts_question')
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='quiz_attempts_job_seeker')
    enrollment = models.ForeignKey('Enrollments', on_delete=models.CASCADE, null=True, blank=True, related_name='quiz_attempts_enrollment')
    selected_option_id = models.UUIDField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)
    attempted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'quiz_attempts'

class Assignments(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lecture = models.ForeignKey('Lectures', on_delete=models.CASCADE, null=True, blank=True, related_name='assignments_lecture')
    instructions = models.TextField(null=True, blank=True)
    submission_type = models.CharField(max_length=255, null=True, blank=True)
    max_score = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'assignments'

class AssignmentSubmissions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey('Assignments', on_delete=models.CASCADE, null=True, blank=True, related_name='assignment_submissions_assignment')
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='assignment_submissions_job_seeker')
    enrollment = models.ForeignKey('Enrollments', on_delete=models.CASCADE, null=True, blank=True, related_name='assignment_submissions_enrollment')
    file_url = models.TextField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'assignment_submissions'

class CourseQuestions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey('Courses', on_delete=models.CASCADE, null=True, blank=True, related_name='course_questions_course')
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='course_questions_job_seeker')
    question_text = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'course_questions'

class CourseAnswers(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey('CourseQuestions', on_delete=models.CASCADE, null=True, blank=True, related_name='course_answers_question')
    responder_user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='course_answers_responder_user')
    answer_text = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'course_answers'

class Enrollments(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey('Courses', on_delete=models.CASCADE, null=True, blank=True, related_name='enrollments_course')
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='enrollments_job_seeker')
    payment = models.ForeignKey('Payments', on_delete=models.CASCADE, null=True, blank=True, related_name='enrollments_payment')
    enrolled_at = models.DateTimeField(null=True, blank=True)
    progress_percentage = models.IntegerField(null=True, blank=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    certificate_url = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'enrollments'

class CertificateTemplates(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    html_template = models.TextField(null=True, blank=True)
    thumbnail_url = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        db_table = 'certificate_templates'

class Certificates(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey('Courses', on_delete=models.CASCADE, null=True, blank=True, related_name='certificates_course')
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='certificates_job_seeker')
    template = models.ForeignKey('CertificateTemplates', on_delete=models.CASCADE, null=True, blank=True, related_name='certificates_template')
    file_url = models.TextField(null=True, blank=True)
    issued_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'certificates'

class CourseCoupons(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey('Courses', on_delete=models.CASCADE, null=True, blank=True, related_name='course_coupons_course')
    code = models.CharField(max_length=255, null=True, blank=True)
    discount_percentage = models.IntegerField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    usage_limit = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'course_coupons'

class TrainerEarnings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey('Trainers', on_delete=models.CASCADE, null=True, blank=True, related_name='trainer_earnings_trainer')
    course = models.ForeignKey('Courses', on_delete=models.CASCADE, null=True, blank=True, related_name='trainer_earnings_course')
    enrollment = models.ForeignKey('Enrollments', on_delete=models.CASCADE, null=True, blank=True, related_name='trainer_earnings_enrollment')
    gross_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    platform_commission = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'trainer_earnings'

class Payouts(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey('Trainers', on_delete=models.CASCADE, null=True, blank=True, related_name='payouts_trainer')
    period_start = models.DateTimeField(null=True, blank=True)
    period_end = models.DateTimeField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    transaction_reference = models.CharField(max_length=255, null=True, blank=True)
    payout_status = models.CharField(max_length=255, null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payouts'
