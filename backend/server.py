from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()
from openai import OpenAI
from pypdf import PdfReader

app = Flask(__name__)
CORS(app)
client = OpenAI()

SKILLS = [
    "Python",
    "Java",
    "JavaScript",
    "HTML",
    "CSS",
    "React",
    "Node.js",
    "SQL",
    "MySQL",
    "MongoDB",
    "Git",
    "GitHub",
    "C",
    "C++",
    "AWS",
    "Docker",
    "Linux",
    "Flask",
    "Django",
    "Communication",
    "Problem Solving",
    "Machine Learning",
    "Artificial Intelligence",
    "Data Structures",
    "Algorithms"
]


def extract_resume_text(file):
    reader = PdfReader(file)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text.strip()


def detect_skills(text):
    detected = []
    text_lower = text.lower()
    for skill in SKILLS:
        if skill.lower() in text_lower:
            detected.append(skill)
    return detected


def calculate_ats_score(text, skills):
    score = 0
    if text:
        score += 25
    if len(text) > 500:
        score += 20
    if len(text) > 1000:
        score += 15
    if len(skills) >= 3:
        score += 15
    if len(skills) >= 6:
        score += 10
    important_sections = [
        "experience",
        "education",
        "skills",
        "projects"
    ]
    for section in important_sections:
        if section in text.lower():
            score += 3
    return min(score, 100)


def generate_strengths(text):
    strengths = []
    if len(text) > 500:
        strengths.append(
            "Resume contains substantial professional information."
        )
    if "experience" in text.lower():
        strengths.append(
            "Work experience section is present."
        )
    if "project" in text.lower():
        strengths.append(
            "Projects demonstrate practical experience."
        )
    if "education" in text.lower():
        strengths.append(
            "Education details are included."
        )
    return strengths


def generate_improvements(text):
    improvements = []
    if "summary" not in text.lower():
        improvements.append(
            "Add a concise professional summary."
        )
    if "skills" not in text.lower():
        improvements.append(
            "Add a dedicated technical skills section."
        )
    if "github" not in text.lower():
        improvements.append(
            "Consider adding a GitHub profile."
        )
    if "linkedin" not in text.lower():
        improvements.append(
            "Consider adding a LinkedIn profile."
        )
    return improvements


def generate_ai_analysis(
    resume_text,
    job_description=""
):
    prompt = f"""
You are an expert ATS resume analyzer and professional career advisor.

Analyze the candidate's resume using ONLY the information supplied below.

================ RESUME ================
{resume_text}

================ JOB DESCRIPTION ================
{job_description}

==============================================

Provide the analysis using these exact sections:

1. Resume Strengths
2. Resume Weaknesses
3. Missing Skills
4. ATS Keyword Suggestions
5. Specific Resume Improvements
6. Professional Summary
7. Three Recommended Next Steps

Rules:
- Do not invent experience.
- Do not invent skills.
- Do not invent projects.
- Do not invent education.
- Do not invent certifications.
- Only use information supported by the resume.
- If job description information is unavailable, analyze the resume independently.
- Keep recommendations practical.
- Keep the language professional and concise.
- Make the suggestions useful for an entry-level candidate.
"""

    response = client.responses.create(
        model="gpt-5.6-luna",
        input=prompt
    )

    return response.output_text


@app.route(
    "/upload",
    methods=["POST"]
)
def upload_resume():
    if "resume" not in request.files:
        return jsonify({
            "error": "No resume file uploaded"
        }), 400

    file = request.files["resume"]

    try:
        resume_text = extract_resume_text(file)
        skills = detect_skills(resume_text)
        ats_score = calculate_ats_score(
            resume_text,
            skills
        )
        strengths = generate_strengths(resume_text)
        improvements = generate_improvements(resume_text)

        return jsonify({
            "success": True,
            "resume_text": resume_text,
            "skills": skills,
            "ats_score": ats_score,
            "strengths": strengths,
            "improvements": improvements
        })

    except Exception as error:
        print(
            "UPLOAD ERROR:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500


@app.route(
    "/match-job",
    methods=["POST"]
)
def match_job():
    data = request.get_json()
    resume_text = data.get(
        "resume_text",
        ""
    )
    job_description = data.get(
        "job_description",
        ""
    )

    if not resume_text:
        return jsonify({
            "error": "Resume text is required"
        }), 400

    if not job_description:
        return jsonify({
            "success": True,
            "match_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "message": "No job description provided."
        })

    resume_skills = detect_skills(resume_text)
    job_skills = detect_skills(job_description)

    matched_skills = [
        skill
        for skill in job_skills
        if skill in resume_skills
    ]

    missing_skills = [
        skill
        for skill in job_skills
        if skill not in resume_skills
    ]

    if len(job_skills) > 0:
        match_score = round(
            len(matched_skills)
            /
            len(job_skills)
            * 100
        )
    else:
        match_score = 0

    return jsonify({
        "success": True,
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    })


@app.route(
    "/ai-analysis",
    methods=["POST"]
)
def ai_analysis():
    data = request.get_json()
    resume_text = data.get(
        "resume_text",
        ""
    )
    job_description = data.get(
        "job_description",
        ""
    )

    if not resume_text:
        return jsonify({
            "error": "Resume text is required"
        }), 400

    try:
        analysis = generate_ai_analysis(
            resume_text,
            job_description
        )

        return jsonify({
            "success": True,
            "analysis": analysis
        })

    except Exception as error:
        print(
            "AI ERROR:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500


def generate_resume_rewrite(
    resume_text,
    job_description=""
):
    prompt = f"""
You are an expert professional resume writer and ATS optimization specialist.

Rewrite and improve the resume using the information provided below.

================ RESUME ================
{resume_text}

================ JOB DESCRIPTION ================
{job_description}

==============================================

Create an improved resume draft with these sections:

1. PROFESSIONAL SUMMARY
2. TECHNICAL SKILLS
3. EXPERIENCE
4. PROJECTS
5. EDUCATION
6. CERTIFICATIONS

Important rules:
- Never invent experience.
- Never invent education.
- Never invent certifications.
- Never invent companies.
- Never invent projects.
- Never invent technologies the candidate has not mentioned.
- Improve grammar and professional wording.
- Make bullet points concise and ATS-friendly.
- Use strong action verbs where appropriate.
- Naturally include relevant keywords from the job description only when supported by the resume.
- Keep the candidate's original facts accurate.
- If a section is not available in the resume, write "Not provided" rather than inventing information.
- Return only the rewritten resume.
"""

    response = client.responses.create(
        model="gpt-5.6-luna",
        input=prompt
    )

    return response.output_text


@app.route(
    "/rewrite-resume",
    methods=["POST"]
)
def rewrite_resume():
    data = request.get_json()
    resume_text = data.get(
        "resume_text",
        ""
    )
    job_description = data.get(
        "job_description",
        ""
    )

    if not resume_text:
        return jsonify({
            "error": "Resume text is required"
        }), 400

    try:
        rewritten_resume = generate_resume_rewrite(
            resume_text,
            job_description
        )

        return jsonify({
            "success": True,
            "rewritten_resume": rewritten_resume
        })

    except Exception as error:
        print(
            "REWRITE ERROR:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500



def generate_interview_questions(resume_text, job_description=""):

    prompt = f"""
You are an expert technical interviewer and career coach.

Create a personalized interview preparation set using ONLY information supported by the candidate's resume and the target job description.

================ RESUME ================

{resume_text}

================ JOB DESCRIPTION ================

{job_description}

================ OUTPUT FORMAT ================

Return valid JSON with exactly these keys:

{{
  "technical_questions": [
    {{
      "question": "Question text",
      "suggested_answer": "A concise suggested answer based only on the resume and job description"
    }}
  ],
  "hr_questions": [
    {{
      "question": "Question text",
      "suggested_answer": "A concise suggested answer based only on the resume"
    }}
  ]
}}

Rules:

- Generate 8 technical questions.
- Generate 5 HR/behavioral questions.
- Make the technical questions relevant to the target job.
- Include questions about technologies, projects, concepts, and responsibilities that are actually supported by the resume or job description.
- Never claim the candidate has experience with a technology that is not supported by the resume.
- Never invent projects, companies, internships, certifications, achievements, metrics, or skills.
- HR answers should sound natural and interview-ready.
- Keep suggested answers concise and easy for a fresher to understand and speak.
- If information is missing, do not invent it.
- Return JSON only. Do not use markdown fences.
"""

    response = client.responses.create(
        model="gpt-5.6-luna",
        input=prompt
    )

    return response.output_text


@app.route(
    "/generate-interview",
    methods=["POST"]
)
def generate_interview_route():

    data = request.get_json() or {}

    resume_text = data.get(
        "resume_text",
        ""
    )

    job_description = data.get(
        "job_description",
        ""
    )

    if not resume_text:
        return jsonify({
            "error": "Resume text is required"
        }), 400

    try:
        interview_text = generate_interview_questions(
            resume_text,
            job_description
        )

        import json

        interview_data = json.loads(interview_text)

        return jsonify({
            "success": True,
            "interview": interview_data
        })

    except Exception as error:

        print(
            "INTERVIEW PREP ERROR:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500



def generate_mock_interview_question(
    resume_text,
    job_description="",
    question_number=1
):

    prompt = f"""
You are an expert technical interviewer and career coach.

Conduct a realistic mock interview for the candidate.

================ RESUME ================

{resume_text}

================ JOB DESCRIPTION ================

{job_description}

================ QUESTION NUMBER ================

{question_number}

Generate ONE interview question.

Rules:

- Base the question on the resume and target job description.
- The question can be technical, project-related, or HR/behavioral.
- Adjust the difficulty for a fresher.
- Never assume experience that is not supported by the resume.
- Do not reveal the answer.
- Return only the interview question.
"""

    response = client.responses.create(
        model="gpt-5.6-luna",
        input=prompt
    )

    return response.output_text.strip()


def evaluate_mock_answer(
    resume_text,
    job_description,
    question,
    answer
):
    prompt = f"""
You are an expert interview coach.

Evaluate the candidate's answer fairly and help them improve.

================ RESUME ================
{resume_text}

================ JOB DESCRIPTION ================
{job_description}

================ INTERVIEW QUESTION ================
{question}

================ CANDIDATE ANSWER ================
{answer}

Return ONLY valid JSON in exactly this format:

{{
  "score": 0,
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "improvements": [
    "improvement 1",
    "improvement 2"
  ],
  "better_answer": "A concise improved answer that stays truthful to the resume."
}}

Rules:
- Score from 0 to 10.
- Evaluate clarity, relevance, structure, confidence, and technical accuracy where applicable.
- Do not invent skills, projects, jobs, or experience.
- Keep the better answer appropriate for a fresher.
- Give practical and encouraging feedback.
- Return valid JSON only.
"""

    response = client.responses.create(
        model="gpt-5.6-luna",
        input=prompt
    )

    import json
    return json.loads(response.output_text.strip())


@app.route(
    "/evaluate-mock-answer",
    methods=["POST"]
)
def evaluate_mock_answer_route():

    data = request.get_json() or {}

    resume_text = data.get(
        "resume_text",
        ""
    )

    job_description = data.get(
        "job_description",
        ""
    )

    question = data.get(
        "question",
        ""
    )

    answer = data.get(
        "answer",
        ""
    )

    if not resume_text:
        return jsonify({
            "error": "Resume text is required"
        }), 400

    if not question:
        return jsonify({
            "error": "Interview question is required"
        }), 400

    if not answer:
        return jsonify({
            "error": "Answer is required"
        }), 400

    try:
        result = evaluate_mock_answer(
            resume_text,
            job_description,
            question,
            answer
        )

        return jsonify({
            "success": True,
            **result
        })

    except Exception as error:
        print(
            "MOCK ANSWER EVALUATION ERROR:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500


@app.route(
    "/start-mock-interview",
    methods=["POST"]
)
def start_mock_interview():

    data = request.get_json() or {}

    resume_text = data.get(
        "resume_text",
        ""
    )

    job_description = data.get(
        "job_description",
        ""
    )

    question_number = data.get("question_number", 1)

    try:
        question_number = int(question_number)
    except (TypeError, ValueError):
        question_number = 1

    if question_number < 1:
        question_number = 1

    if not resume_text:
        return jsonify({
            "error": "Resume text is required"
        }), 400

    try:

        question = generate_mock_interview_question(
            resume_text,
            job_description,
            question_number
        )

        return jsonify({
            "success": True,
            "question": question,
            "question_number": question_number
        })

    except Exception as error:

        print(
            "MOCK INTERVIEW ERROR:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500



def generate_cover_letter(
    resume_text,
    job_description="",
    tone="Professional"
):
    prompt = f"""
You are an expert professional career writer.

Create a tailored cover letter using ONLY information supported by the resume and job description.

================ RESUME ================
{resume_text}

================ JOB DESCRIPTION ================
{job_description}

================ TONE ================
{tone}

Rules:
- Never invent experience, skills, projects, education, certifications, employers, achievements, or metrics.
- Use only facts supported by the resume.
- Tailor the letter to the job description when relevant.
- Keep it professional and concise.
- Do not mention that AI generated it.
- If the job description is missing, write a strong general cover letter based only on the resume.
- Return only the cover letter.
"""

    response = client.responses.create(
        model="gpt-5.6-luna",
        input=prompt
    )

    return response.output_text


@app.route(
    "/generate-cover-letter",
    methods=["POST"]
)
def generate_cover_letter_route():
    data = request.get_json() or {}

    resume_text = data.get(
        "resume_text",
        ""
    )

    job_description = data.get(
        "job_description",
        ""
    )

    tone = data.get(
        "tone",
        "Professional"
    )

    if not resume_text:
        return jsonify({
            "error": "Resume text is required"
        }), 400

    try:
        cover_letter = generate_cover_letter(
            resume_text,
            job_description,
            tone
        )

        return jsonify({
            "success": True,
            "cover_letter": cover_letter
        })

    except Exception as error:
        print(
            "COVER LETTER ERROR:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500


@app.route("/")
def home():
    return jsonify({
        "message": "ResumeAI backend is running 🚀"
    })


if __name__ == "__main__":
    print("")
    print(
        "===================================="
    )
    print(
        "      ResumeAI Backend Started"
    )
    print(
        "===================================="
    )
    print("")
    print(
        "Server: http://127.0.0.1:5000"
    )
    print("")
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
