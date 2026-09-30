const API_URL = "https://resumeai-tmw1.onrender.com";

let selectedFile = null;
let resumeText = "";


/* =========================================================
   ELEMENTS
========================================================= */

const resumeFile =
    document.getElementById("resumeFile");

const fileStatus =
    document.getElementById("fileStatus");

const uploadStatus =
    document.getElementById("uploadStatus");

const analyzeResumeButton =
    document.getElementById("analyzeResumeButton");

const jobDescription =
    document.getElementById("jobDescription");

const analyzeJobButton =
    document.getElementById("analyzeJobButton");


/* =========================================================
   RESUME FILE SELECTION
========================================================= */

if (resumeFile) {

    resumeFile.addEventListener(
        "change",
        function () {

            if (!resumeFile.files.length) {

                selectedFile = null;

                if (fileStatus) {
                    fileStatus.textContent =
                        "No file selected";
                }

                if (uploadStatus) {
                    uploadStatus.textContent = "";
                }

                return;
            }

            const file =
                resumeFile.files[0];


            if (
                file.type !== "application/pdf" &&
                !file.name
                    .toLowerCase()
                    .endsWith(".pdf")
            ) {

                selectedFile = null;

                if (fileStatus) {
                    fileStatus.textContent =
                        "No file selected";
                }

                showToast(
                    "Please select a PDF resume."
                );

                return;
            }


            selectedFile = file;


            if (fileStatus) {

                fileStatus.textContent =
                    "✓ " + selectedFile.name;

            }


            if (uploadStatus) {

                uploadStatus.textContent =
                    "Resume selected successfully";

            }


            showToast(
                "Resume selected successfully"
            );

        }
    );

}


/* =========================================================
   DRAG AND DROP
========================================================= */

const uploadZone =
    document.querySelector(".upload-zone");


if (uploadZone) {

    uploadZone.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadZone.classList.add(
                "dragging"
            );

        }
    );


    uploadZone.addEventListener(
        "dragleave",
        function () {

            uploadZone.classList.remove(
                "dragging"
            );

        }
    );


    uploadZone.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            uploadZone.classList.remove(
                "dragging"
            );


            const files =
                event.dataTransfer.files;


            if (
                !files ||
                !files.length
            ) {

                return;

            }


            const file =
                files[0];


            if (
                file.type !== "application/pdf" &&
                !file.name
                    .toLowerCase()
                    .endsWith(".pdf")
            ) {

                showToast(
                    "Please select a PDF resume."
                );

                return;

            }


            selectedFile =
                file;


            if (fileStatus) {

                fileStatus.textContent =
                    "✓ " + selectedFile.name;

            }


            if (uploadStatus) {

                uploadStatus.textContent =
                    "Resume selected successfully";

            }


            showToast(
                "Resume selected successfully"
            );

        }
    );

}


/* =========================================================
   ANALYZE RESUME
========================================================= */

if (analyzeResumeButton) {

    analyzeResumeButton.addEventListener(
        "click",
        async function () {

            if (!selectedFile) {

                showToast(
                    "Please select your resume first."
                );

                return;

            }


            analyzeResumeButton.disabled =
                true;


            analyzeResumeButton.innerHTML =
                "<span>✦</span> Analyzing...";


            if (uploadStatus) {

                uploadStatus.textContent =
                    "AI is analyzing your resume...";

            }


            try {

                const formData =
                    new FormData();


                formData.append(
                    "resume",
                    selectedFile
                );


                const response =
                    await fetch(
                        API_URL + "/upload",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Resume analysis failed"
                    );

                }


                resumeText =
                    data.resume_text || "";


                /* =================================================
                   MAIN SCORE
                ================================================= */

                const overallScore =
                    document.getElementById(
                        "overallScore"
                    );


                if (overallScore) {

                    overallScore.textContent =
                        data.ats_score || 0;

                }


                const atsScore =
                    document.getElementById(
                        "atsScore"
                    );


                if (atsScore) {

                    atsScore.textContent =
                        data.ats_score || 0;

                }


                const skillCounter =
                    document.getElementById(
                        "skillCounter"
                    );


                if (skillCounter) {

                    skillCounter.textContent =
                        data.skills
                            ? data.skills.length
                            : 0;

                }


                const jobMatchPercentage =
                    document.getElementById(
                        "jobMatchPercentage"
                    );


                if (jobMatchPercentage) {

                    jobMatchPercentage.textContent =
                        "--";

                }


                /* =================================================
                   SCORE BREAKDOWN
                ================================================= */

                const text =
                    resumeText.toLowerCase();


                const educationScore =
                    text.includes("education")
                        ? 85
                        : 30;


                const experienceScore =
                    text.includes("experience")
                        ? 80
                        : 25;


                const projectsScore =
                    text.includes("project")
                        ? 85
                        : 25;


                const skillsScore =
                    Math.min(
                        (
                            data.skills
                                ? data.skills.length
                                : 0
                        ) * 10,
                        100
                    );


                updateScore(
                    "breakdownEducation",
                    "educationProgress",
                    educationScore
                );


                updateScore(
                    "breakdownExperience",
                    "experienceProgress",
                    experienceScore
                );


                updateScore(
                    "breakdownProjects",
                    "projectsProgress",
                    projectsScore
                );


                updateScore(
                    "breakdownSkills",
                    "skillsProgress",
                    skillsScore
                );


                const scoreProgressText =
                    document.getElementById(
                        "scoreProgressText"
                    );


                if (scoreProgressText) {

                    scoreProgressText.textContent =
                        "Analysis complete";

                }


                /* =================================================
                   DETECTED SKILLS
                ================================================= */

                const skillsContainer =
                    document.getElementById(
                        "detectedSkills"
                    );


                if (skillsContainer) {

                    skillsContainer.innerHTML =
                        "";


                    const skills =
                        data.skills || [];


                    skills.forEach(
                        function (skill) {

                            const element =
                                document.createElement(
                                    "span"
                                );


                            element.className =
                                "skill-tag";


                            element.textContent =
                                skill;


                            skillsContainer.appendChild(
                                element
                            );

                        }
                    );

                }


                const skillHeader =
                    document.getElementById(
                        "skillCountHeader"
                    );


                if (skillHeader) {

                    skillHeader.textContent =
                        (
                            data.skills
                                ? data.skills.length
                                : 0
                        ) +
                        " skills";

                }


                /* =================================================
                   STRENGTHS
                ================================================= */

                updateList(
                    "strengthsList",
                    data.strengths || []
                );


                /* =================================================
                   IMPROVEMENTS
                ================================================= */

                updateList(
                    "improvementsList",
                    data.improvements || []
                );


                /* =================================================
                   STATUS
                ================================================= */

                if (uploadStatus) {

                    uploadStatus.textContent =
                        "✓ Resume analyzed successfully";

                }


                showToast(
                    "Resume analysis completed successfully."
                );


                /* =================================================
                   SAVE HISTORY
                ================================================= */

                saveResumeHistory({

                    id:
                        Date.now(),

                    fileName:
                        selectedFile.name,

                    score:
                        data.ats_score || 0,

                    resumeText:
                        resumeText,

                    skills:
                        data.skills || [],

                    date:
                        new Date().toLocaleString()

                });


                if (
                    typeof renderResumeHistory ===
                    "function"
                ) {

                    renderResumeHistory();

                }


            } catch (error) {

                console.error(
                    "UPLOAD ERROR:",
                    error
                );


                if (uploadStatus) {

                    uploadStatus.textContent =
                        "✕ " +
                        error.message;

                }


                showToast(
                    error.message
                );

            }


            analyzeResumeButton.disabled =
                false;


            analyzeResumeButton.innerHTML =
                "<span>✦</span> Analyze Resume <span>→</span>";

        }
    );

}


/* =========================================================
   JOB MATCHER
========================================================= */

if (analyzeJobButton) {

    analyzeJobButton.addEventListener(
        "click",
        async function () {

            if (!resumeText) {

                showToast(
                    "Analyze your resume before matching a job."
                );

                return;

            }


            const jobText =
                jobDescription
                    ? jobDescription.value.trim()
                    : "";


            if (!jobText) {

                showToast(
                    "Please paste a job description."
                );

                return;

            }


            analyzeJobButton.disabled =
                true;


            analyzeJobButton.innerHTML =
                "✦ Analyzing Job...";


            try {

                const response =
                    await fetch(
                        API_URL + "/match-job",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    resume_text:
                                        resumeText,

                                    job_description:
                                        jobText
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Job matching failed"
                    );

                }


                const score =
                    data.match_percentage !==
                    undefined

                        ? data.match_percentage

                        : (
                            data.match_score ||
                            0
                        );


                /* =================================================
                   MATCH SCORE
                ================================================= */

                const jobMatch =
                    document.getElementById(
                        "jobMatchPercentage"
                    );


                if (jobMatch) {

                    jobMatch.textContent =
                        score + "%";

                }


                const matchScore =
                    document.getElementById(
                        "matchScore"
                    );


                if (matchScore) {

                    matchScore.textContent =
                        score + "%";

                }


                /* =================================================
                   SCORE RING
                ================================================= */

                const scoreRing =
                    document.getElementById(
                        "scoreRing"
                    );


                if (scoreRing) {

                    const degrees =
                        score * 3.6;


                    scoreRing.style.background =
                        "conic-gradient(" +
                        "#2997ff 0deg " +
                        degrees +
                        "deg, " +
                        "rgba(255,255,255,0.08) " +
                        degrees +
                        "deg 360deg)";

                }


                /* =================================================
                   MATCH MESSAGE
                ================================================= */

                const matchMessage =
                    document.getElementById(
                        "matchMessage"
                    );


                if (matchMessage) {

                    matchMessage.textContent =
                        data.message ||
                        "Job match analysis completed.";

                }


                /* =================================================
                   MATCHING SKILLS
                ================================================= */

                const matchingSkills =
                    data.matching_skills ||
                    data.matched_skills ||
                    [];


                const matchingCount =
                    document.getElementById(
                        "matchingCount"
                    );


                if (matchingCount) {

                    matchingCount.textContent =
                        matchingSkills.length;

                }


                const matchingContainer =
                    document.getElementById(
                        "matchingSkills"
                    );


                if (matchingContainer) {

                    matchingContainer.innerHTML =
                        "";


                    if (
                        matchingSkills.length ===
                        0
                    ) {

                        matchingContainer.innerHTML =
                            '<span class="empty-state">' +
                            "No matching skills detected" +
                            "</span>";

                    } else {

                        matchingSkills.forEach(
                            function (skill) {

                                const element =
                                    document.createElement(
                                        "span"
                                    );


                                element.className =
                                    "skill-tag";


                                element.textContent =
                                    skill;


                                matchingContainer.appendChild(
                                    element
                                );

                            }
                        );

                    }

                }


                /* =================================================
                   MISSING SKILLS
                ================================================= */

                const missingSkills =
                    data.missing_skills ||
                    [];


                const missingCount =
                    document.getElementById(
                        "missingCount"
                    );


                if (missingCount) {

                    missingCount.textContent =
                        missingSkills.length;

                }


                const missingContainer =
                    document.getElementById(
                        "missingSkills"
                    );


                if (missingContainer) {

                    missingContainer.innerHTML =
                        "";


                    if (
                        missingSkills.length ===
                        0
                    ) {

                        missingContainer.innerHTML =
                            '<span class="empty-state">' +
                            "No missing skills detected" +
                            "</span>";

                    } else {

                        missingSkills.forEach(
                            function (skill) {

                                const element =
                                    document.createElement(
                                        "span"
                                    );


                                element.className =
                                    "skill-tag missing-skill";


                                element.textContent =
                                    skill;


                                missingContainer.appendChild(
                                    element
                                );

                            }
                        );

                    }

                }


                showToast(
                    "Job description analyzed successfully!"
                );


            } catch (error) {

                console.error(
                    "JOB MATCH ERROR:",
                    error
                );


                showToast(
                    "Job match failed: " +
                    error.message
                );

            }


            analyzeJobButton.disabled =
                false;


            analyzeJobButton.innerHTML =
                "<span>✦</span> Analyze Job Match <span>→</span>";

        }
    );

}


/* =========================================================
   REAL AI SUGGESTIONS
========================================================= */

async function getAISuggestions() {

    if (!resumeText) {

        showToast(
            "Analyze your resume first."
        );

        return;

    }


    const jobText =
        jobDescription
            ? jobDescription.value.trim()
            : "";


    const button =
        document.getElementById(
            "aiSuggestionsButton"
        );


    if (button) {

        button.disabled =
            true;


        button.innerHTML =
            "<span>✦</span> AI is thinking...";

    }


    showToast(
        "AI is analyzing your resume..."
    );


    try {

        const response =
            await fetch(
                API_URL + "/ai-analysis",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            resume_text:
                                resumeText,

                            job_description:
                                jobText
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "AI analysis failed"
            );

        }


        displayAIAnalysis(
            data.analysis || ""
        );


        showToast(
            "Real AI analysis generated successfully!"
        );


    } catch (error) {

        console.error(
            "AI ERROR:",
            error
        );


        showToast(
            "AI analysis failed: " +
            error.message
        );

    }


    if (button) {

        button.disabled =
            false;


        button.innerHTML =
            "<span>✦</span> Generate AI Suggestions <span>→</span>";

    }

}


/* =========================================================
   PREMIUM AI ANALYSIS
========================================================= */

function displayAIAnalysis(
    analysis
) {

    const container =
        document.getElementById(
            "aiInsightsGrid"
        );


    if (container) {

        container.innerHTML =
            "";


        const sections =
            parseAISections(
                analysis
            );


        sections.forEach(
            function (section) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "premium-ai-card " +
                    section.type;


                let contentHTML =
                    "";


                /* =================================================
                   SKILLS / KEYWORDS
                ================================================= */

                if (
                    section.type === "skills" ||
                    section.type === "keywords"
                ) {

                    contentHTML =
                        '<div class="ai-chip-container">';


                    section.items.forEach(
                        function (item) {

                            contentHTML +=
                                '<span class="ai-chip">' +
                                escapeHTML(item) +
                                "</span>";

                        }
                    );


                    contentHTML +=
                        "</div>";

                }


                /* =================================================
                   SUMMARY
                ================================================= */

                else if (
                    section.type ===
                    "summary"
                ) {

                    contentHTML =
                        '<p class="ai-summary-text">' +
                        escapeHTML(
                            section.content
                        ) +
                        "</p>";

                }


                /* =================================================
                   NORMAL LIST
                ================================================= */

                else {

                    contentHTML =
                        '<div class="ai-card-list">';


                    section.items.forEach(
                        function (
                            item,
                            index
                        ) {

                            contentHTML +=
                                '<div class="ai-card-item">' +

                                '<span class="ai-card-number">' +

                                String(
                                    index + 1
                                ).padStart(
                                    2,
                                    "0"
                                ) +

                                "</span>" +

                                '<span class="ai-card-text">' +

                                escapeHTML(
                                    item
                                ) +

                                "</span>" +

                                "</div>";

                        }
                    );


                    contentHTML +=
                        "</div>";

                }


                card.innerHTML =
                    '<div class="premium-ai-card-header">' +

                    '<div class="premium-ai-icon">' +

                    escapeHTML(
                        section.icon
                    ) +

                    "</div>" +

                    "<div>" +

                    '<span class="premium-ai-label">' +
                    "AI ANALYSIS" +
                    "</span>" +

                    "<h3>" +

                    escapeHTML(
                        section.title
                    ) +

                    "</h3>" +

                    "</div>" +

                    "</div>" +

                    contentHTML;


                container.appendChild(
                    card
                );

            }
        );


        return;

    }


    /* =================================================
       FALLBACK
    ================================================= */

    const recommendationsList =
        document.getElementById(
            "recommendationsList"
        );


    if (!recommendationsList) {

        return;

    }


    recommendationsList.innerHTML =
        "";


    const lines =
        analysis
            .split("\n")
            .map(
                function (line) {

                    return line
                        .replace(
                            /\*\*/g,
                            ""
                        )
                        .replace(
                            /^#+\s*/,
                            ""
                        )
                        .replace(
                            /^[-•]\s*/,
                            ""
                        )
                        .replace(
                            /^\d+\.\s*/,
                            ""
                        )
                        .trim();

                }
            )
            .filter(
                function (line) {

                    return line.length > 0;

                }
            );


    lines.forEach(
        function (
            line,
            index
        ) {

            const li =
                document.createElement(
                    "li"
                );


            li.innerHTML =
                "<span>" +

                String(
                    index + 1
                ).padStart(
                    2,
                    "0"
                ) +

                "</span>" +

                escapeHTML(
                    line
                );


            recommendationsList.appendChild(
                li
            );

        }
    );

}


/* =========================================================
   PARSE AI SECTIONS
========================================================= */

function parseAISections(
    analysis
) {

    const lines =
        analysis
            .split("\n")
            .map(
                function (line) {

                    return line
                        .replace(
                            /\*\*/g,
                            ""
                        )
                        .replace(
                            /^#+\s*/,
                            ""
                        )
                        .trim();

                }
            );


    const sections =
        [];


    let current =
        null;


    const sectionMap = {

        "resume strengths": {

            title:
                "Resume Strengths",

            type:
                "strengths",

            icon:
                "✓"

        },


        "resume weaknesses": {

            title:
                "Resume Weaknesses",

            type:
                "weaknesses",

            icon:
                "!"

        },


        "missing skills": {

            title:
                "Missing Skills",

            type:
                "skills",

            icon:
                "⚡"

        },


        "ats keyword suggestions": {

            title:
                "ATS Keywords",

            type:
                "keywords",

            icon:
                "#"

        },


        "specific resume improvements": {

            title:
                "Resume Improvements",

            type:
                "improvements",

            icon:
                "↗"

        },


        "professional summary": {

            title:
                "Professional Summary",

            type:
                "summary",

            icon:
                "✦"

        },


        "three recommended next steps": {

            title:
                "Recommended Next Steps",

            type:
                "next-steps",

            icon:
                "→"

        },


        "positive signals": {

            title:
                "Positive Signals",

            type:
                "strengths",

            icon:
                "✓"

        }

    };


    lines.forEach(
        function (line) {

            const normalized =
                line
                    .replace(
                        /[:：]$/,
                        ""
                    )
                    .trim()
                    .toLowerCase();


            if (
                sectionMap[
                    normalized
                ]
            ) {

                if (current) {

                    sections.push(
                        current
                    );

                }


                const config =
                    sectionMap[
                        normalized
                    ];


                current = {

                    title:
                        config.title,

                    type:
                        config.type,

                    icon:
                        config.icon,

                    items:
                        [],

                    content:
                        ""

                };


                return;

            }


            if (!current) {

                return;

            }


            const cleaned =
                line
                    .replace(
                        /^[-•]\s*/,
                        ""
                    )
                    .replace(
                        /^\d+\.\s*/,
                        ""
                    )
                    .replace(
                        /^\*\s*/,
                        ""
                    )
                    .trim();


            if (!cleaned) {

                return;

            }


            if (
                current.type ===
                "summary"
            ) {

                current.content +=
                    (
                        current.content
                            ? " "
                            : ""
                    ) +
                    cleaned;

            } else {

                current.items.push(
                    cleaned
                );

            }

        }
    );


    if (current) {

        sections.push(
            current
        );

    }


    return sections;

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text == null
            ? ""
            : String(text);


    return div.innerHTML;

}


/* =========================================================
   UPDATE SCORE
========================================================= */

function updateScore(
    textId,
    progressId,
    score
) {

    const textElement =
        document.getElementById(
            textId
        );


    const progressElement =
        document.getElementById(
            progressId
        );


    if (textElement) {

        textElement.textContent =
            score + "%";

    }


    if (progressElement) {

        progressElement.style.width =
            score + "%";

    }

}


/* =========================================================
   UPDATE LIST
========================================================= */

function updateList(
    elementId,
    items
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    (items || []).forEach(
        function (
            item,
            index
        ) {

            const li =
                document.createElement(
                    "li"
                );


            li.innerHTML =
                "<span>" +

                String(
                    index + 1
                ).padStart(
                    2,
                    "0"
                ) +

                "</span>" +

                escapeHTML(
                    item
                );


            container.appendChild(
                li
            );

        }
    );

}


/* =========================================================
   SKILL DETECTION
========================================================= */

function detectSkillsFromText(
    text
) {

    const skills = [

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
        "Machine Learning",
        "Artificial Intelligence",
        "Data Structures",
        "Algorithms",
        "Communication",
        "Problem Solving"

    ];


    const lowerText =
        (text || "").toLowerCase();


    return skills.filter(
        function (skill) {

            return lowerText.includes(
                skill.toLowerCase()
            );

        }
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !toastMessage
    ) {

        return;

    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}


/* =========================================================
   RESUME HISTORY
========================================================= */

function getResumeHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "resumeAIHistory"
            )
        ) || [];

    } catch (error) {

        return [];

    }

}


function saveResumeHistory(
    resume
) {

    try {

        let history =
            getResumeHistory();


        history.unshift(
            resume
        );


        history =
            history.slice(
                0,
                10
            );


        localStorage.setItem(
            "resumeAIHistory",
            JSON.stringify(
                history
            )
        );


    } catch (error) {

        console.error(
            "History save error:",
            error
        );

    }

}


function renderResumeHistory() {

    const container =
        document.getElementById(
            "resumeHistoryList"
        );


    if (!container) {

        return;

    }


    const history =
        getResumeHistory();


    container.innerHTML =
        "";


    if (!history.length) {

        container.innerHTML =
            '<div class="empty-state">' +
            "No resume history yet." +
            "</div>";

        return;

    }


    history.forEach(
        function (resume) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "history-item";


            item.innerHTML =
                "<strong>" +

                escapeHTML(
                    resume.fileName ||
                    "Resume"
                ) +

                "</strong>" +

                "<span>" +

                escapeHTML(
                    String(
                        resume.date ||
                        ""
                    )
                ) +

                "</span>" +

                "<span>" +

                "ATS: " +

                escapeHTML(
                    String(
                        resume.score ||
                        0
                    )
                ) +

                "</span>";


            container.appendChild(
                item
            );

        }
    );

}


function clearResumeHistory() {

    localStorage.removeItem(
        "resumeAIHistory"
    );


    renderResumeHistory();


    showToast(
        "Resume history cleared."
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

if (
    typeof renderResumeHistory ===
    "function"
) {

    renderResumeHistory();

}

async function generateCoverLetter() {
    const output = document.getElementById("coverLetterText");
    const result = document.getElementById("coverLetterResult");
    const button = document.getElementById("generateCoverLetterButton");

    const tone = document.querySelector(
        'input[name="coverLetterTone"]:checked'
    )?.value || "Professional";

    const currentResumeText = resumeText || "";

    const currentJobDescription =
        typeof jobDescription !== "undefined"
            ? jobDescription
            : "";

    if (!currentResumeText.trim()) {
        alert("Please upload and analyze your resume first.");
        return;
    }

    button.disabled = true;
    button.innerHTML = "Generating...";

    try {
        const response = await fetch(
            "https://resumeai-tmw1.onrender.com/generate-cover-letter",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    resume_text: currentResumeText,
                    job_description: currentJobDescription,
                    tone: tone
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Failed to generate cover letter."
            );
        }

        output.textContent = data.cover_letter;
        result.style.display = "block";

    } catch (error) {
        console.error("Cover Letter Error:", error);
        alert("Cover letter generation failed: " + error.message);

    } finally {
        button.disabled = false;
        button.innerHTML =
            "<span>✦</span> Generate Cover Letter <span>→</span>";
    }
}

function copyCoverLetter() {
    const text =
        document.getElementById("coverLetterText")?.textContent || "";

    if (!text.trim()) {
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        const button =
            document.getElementById("copyCoverLetterButton");

        if (button) {
            button.innerHTML = "✓ Copied";

            setTimeout(() => {
                button.innerHTML = "<span>⧉</span> Copy";
            }, 1500);
        }
    });
}

function downloadCoverLetterPDF() {
    const text =
        document.getElementById("coverLetterText")?.textContent || "";

    if (!text.trim()) {
        alert("Please generate a cover letter first.");
        return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Please allow pop-ups to download the PDF.");
        return;
    }

    const escapedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cover Letter - K. Jagadeesh</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 0 40px;
                    color: #222;
                    line-height: 1.7;
                    font-size: 14px;
                }

                h1 {
                    font-size: 24px;
                    margin-bottom: 30px;
                }

                .letter {
                    white-space: normal;
                }

                @media print {
                    body {
                        margin: 30px;
                    }
                }
            </style>
        </head>
        <body>
            <h1>Cover Letter</h1>
            <div class="letter">${escapedText}</div>
        </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
    };
}


/* =========================================================
   AI INTERVIEW PREPARATION
========================================================= */

const generateInterviewButton =
    document.getElementById("generateInterviewButton");

const interviewPrepResults =
    document.getElementById("interviewPrepResults");

if (generateInterviewButton) {

    generateInterviewButton.addEventListener(
        "click",
        async function () {

            if (!resumeText) {
                showToast(
                    "Analyze your resume before generating interview questions."
                );
                return;
            }

            const jobText =
                jobDescription
                    ? jobDescription.value.trim()
                    : "";

            generateInterviewButton.disabled = true;

            generateInterviewButton.innerHTML =
                "✦ Generating Questions...";

            if (interviewPrepResults) {
                interviewPrepResults.style.display = "block";
                interviewPrepResults.innerHTML =
                    "<p>✦ Creating your personalized interview questions...</p>";
            }

            try {

                const response = await fetch(
                    API_URL + "/generate-interview",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            resume_text: resumeText,
                            job_description: jobText
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Interview preparation failed"
                    );
                }

                const interview =
                    data.interview || {};

                const technicalQuestions =
                    interview.technical_questions || [];

                const hrQuestions =
                    interview.hr_questions || [];

                let html = "";

                html += `
                    <div class="glass-card" style="margin-bottom:20px;">
                        <h3>💻 Technical Questions</h3>
                        <p style="opacity:0.75;">
                            Questions tailored to your resume and target job.
                        </p>
                `;

                technicalQuestions.forEach(
                    function (item, index) {

                        html += `
                            <div style="
                                margin-top:18px;
                                padding:18px;
                                border-radius:14px;
                                background:rgba(255,255,255,0.04);
                            ">
                                <strong>
                                    ${index + 1}. ${item.question || ""}
                                </strong>

                                <p style="margin-top:10px;">
                                    <strong>Suggested Answer:</strong>
                                </p>

                                <p style="opacity:0.9;">
                                    ${item.suggested_answer || ""}
                                </p>
                            </div>
                        `;
                    }
                );

                html += `</div>`;

                html += `
                    <div class="glass-card">
                        <h3>🤝 HR & Behavioral Questions</h3>
                        <p style="opacity:0.75;">
                            Practice common HR questions with personalized answers.
                        </p>
                `;

                hrQuestions.forEach(
                    function (item, index) {

                        html += `
                            <div style="
                                margin-top:18px;
                                padding:18px;
                                border-radius:14px;
                                background:rgba(255,255,255,0.04);
                            ">
                                <strong>
                                    ${index + 1}. ${item.question || ""}
                                </strong>

                                <p style="margin-top:10px;">
                                    <strong>Suggested Answer:</strong>
                                </p>

                                <p style="opacity:0.9;">
                                    ${item.suggested_answer || ""}
                                </p>
                            </div>
                        `;
                    }
                );

                html += `</div>`;

                if (interviewPrepResults) {
                    interviewPrepResults.innerHTML = html;
                    interviewPrepResults.style.display = "block";
                }

                showToast(
                    "Interview questions generated successfully!"
                );

            } catch (error) {

                console.error(
                    "INTERVIEW PREP ERROR:",
                    error
                );

                if (interviewPrepResults) {
                    interviewPrepResults.innerHTML = `
                        <div style="padding:16px;">
                            <strong>Unable to generate interview questions.</strong>
                            <p>${error.message}</p>
                        </div>
                    `;
                }

                showToast(
                    "Interview preparation failed."
                );

            } finally {

                generateInterviewButton.disabled = false;

                generateInterviewButton.innerHTML =
                    "<span>✦</span> Generate Interview Questions <span>→</span>";
            }
        }
    );
}



/* =========================================================
   AI MOCK INTERVIEW
========================================================= */

const startMockInterviewButton =
    document.getElementById("startMockInterviewButton");

const mockInterviewArea =
    document.getElementById("mockInterviewArea");

let mockInterviewResults = [];
const MAX_MOCK_INTERVIEW_QUESTIONS = 5;

if (startMockInterviewButton) {

    startMockInterviewButton.addEventListener(
        "click",
        async function () {

            if (!resumeText) {
                showToast(
                    "Analyze your resume before starting the mock interview."
                );
                return;
            }

            const jobText =
                jobDescription
                    ? jobDescription.value.trim()
                    : "";

            startMockInterviewButton.disabled = true;

            startMockInterviewButton.innerHTML =
                "🎤 Starting Interview...";

            if (mockInterviewArea) {
                mockInterviewArea.style.display = "block";
                mockInterviewArea.innerHTML = `
                    <div style="
                        padding:22px;
                        border-radius:16px;
                        background:rgba(255,255,255,0.04);
                    ">
                        <p>✦ Preparing your first interview question...</p>
                    </div>
                `;
            }

            try {

                const response = await fetch(
                    API_URL + "/start-mock-interview",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            resume_text: resumeText,
                            job_description: jobText
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Could not start mock interview"
                    );
                }

                if (mockInterviewArea) {
                    mockInterviewArea.innerHTML = `
                        <div style="
                            padding:24px;
                            border-radius:16px;
                            background:rgba(255,255,255,0.04);
                        ">

                            <div style="
                                font-size:11px;
                                letter-spacing:2px;
                                opacity:0.55;
                                margin-bottom:10px;
                            ">
                                QUESTION 1
                            </div>

                            <h3 style="margin-top:0;">
                                ${data.question || ""}
                            </h3>

                            <textarea
                                id="mockInterviewAnswer"
                                placeholder="Type your answer here..."
                                style="
                                    width:100%;
                                    min-height:140px;
                                    margin-top:18px;
                                    padding:16px;
                                    border-radius:12px;
                                    resize:vertical;
                                "
                            ></textarea>

                            <button
                                id="submitMockAnswerButton"
                                class="primary-button small"
                                type="button"
                                style="margin-top:16px;"
                            >
                                Submit Answer
                                <span>→</span>
                            </button>

                            <div
                                id="mockInterviewFeedback"
                                style="margin-top:20px;"
                            ></div>

                        </div>
                    `;
                }

                showToast(
                    "Mock interview started!"
                );

            } catch (error) {

                console.error(
                    "MOCK INTERVIEW ERROR:",
                    error
                );

                if (mockInterviewArea) {
                    mockInterviewArea.innerHTML = `
                        <div style="padding:18px;">
                            <strong>
                                Unable to start the mock interview.
                            </strong>
                            <p>${error.message}</p>
                        </div>
                    `;
                }

                showToast(
                    "Mock interview failed."
                );

            } finally {

                startMockInterviewButton.disabled = false;

                startMockInterviewButton.innerHTML =
                    "<span>🎤</span> Start Mock Interview <span>→</span>";
            }
        }
    );
}


    // MOCK INTERVIEW SUBMIT ANSWER
    document.addEventListener("click", async function(event) {
        const button = event.target.closest("#submitMockAnswerButton");

        if (!button) return;

        const answerBox = document.getElementById("mockInterviewAnswer");
        const feedbackBox = document.getElementById("mockInterviewFeedback");

        if (!answerBox || !feedbackBox) return;

        const answer = answerBox.value.trim();

        if (!answer) {
            showToast("Please type your answer first.");
            answerBox.focus();
            return;
        }

        button.disabled = true;
        button.innerHTML = "Evaluating...";

        feedbackBox.innerHTML = `
            <div style="padding:18px; opacity:0.7;">
                AI is evaluating your answer...
            </div>
        `;

        try {
            const response = await fetch(API_URL + "/evaluate-mock-answer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    resume_text: resumeText,
                    job_description: jobDescription ? jobDescription.value.trim() : "",
                    question: document.querySelector("#mockInterviewArea h3")?.innerText || "",
                    answer: answer
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to evaluate answer.");
            }

            mockInterviewResults.push({
                score: Number(data.score) || 0,
                question: document.querySelector("#mockInterviewArea h3")?.innerText || "",
                strengths: data.strengths || [],
                improvements: data.improvements || []
            });

            feedbackBox.innerHTML = `
                <div style="
                    padding:22px;
                    border-radius:16px;
                    background:rgba(255,255,255,0.05);
                ">
                    <h3 style="margin-top:0;">AI Feedback</h3>

                    <div style="font-size:28px; font-weight:700; margin-bottom:18px;">
                        ${data.score}/10
                    </div>

                    <h4>Strengths</h4>
                    <ul>
                        ${(data.strengths || []).map(item => `<li>${item}</li>`).join("")}
                    </ul>

                    <h4>Areas to Improve</h4>
                    <ul>
                        ${(data.improvements || []).map(item => `<li>${item}</li>`).join("")}
                    </ul>

                    <h4>Better Answer</h4>
                    <p>${data.better_answer || ""}</p>
                </div>

                <div style="
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                    margin-top:16px;
                ">
                    <button
                        id="nextMockQuestionButton"
                        class="primary-button small"
                        type="button"
                        style="display:${mockInterviewResults.length >= MAX_MOCK_INTERVIEW_QUESTIONS ? "none" : "inline-flex"};"
                    >
                        Next Question
                        <span>→</span>
                    </button>

                    <button
                        id="finishMockInterviewButton"
                        class="primary-button small"
                        type="button"
                    >
                        Finish Interview
                        <span>✓</span>
                    </button>
                </div>
            `;

            button.disabled = false;
            button.innerHTML = "Answer Evaluated ✓";

        } catch (error) {
            console.error("MOCK ANSWER ERROR:", error);

            feedbackBox.innerHTML = `
                <div style="padding:18px;">
                    <strong>Unable to evaluate your answer.</strong>
                    <p>${error.message}</p>
                </div>
            `;

            button.disabled = false;
            button.innerHTML = 'Submit Answer <span>→</span>';
        }
    });

/* =========================================================
   AI MOCK INTERVIEW FINAL REPORT
========================================================= */

document.addEventListener("click", function(event) {

    const button = event.target.closest("#finishMockInterviewButton");

    if (!button) return;

    const area = document.getElementById("mockInterviewArea");

    if (!area) return;

    if (!mockInterviewResults.length) {
        showToast("Complete at least one answer first.");
        return;
    }

    const totalScore = mockInterviewResults.reduce(
        (sum, item) => sum + item.score,
        0
    );

    const averageScore =
        totalScore / mockInterviewResults.length;

    const allStrengths = mockInterviewResults.flatMap(
        item => item.strengths || []
    );

    const allImprovements = mockInterviewResults.flatMap(
        item => item.improvements || []
    );

    const uniqueStrengths = [...new Set(allStrengths)];
    const uniqueImprovements = [...new Set(allImprovements)];

    area.innerHTML = `
        <div style="
            padding:28px;
            border-radius:18px;
            background:rgba(255,255,255,0.05);
        ">

            <div style="
                font-size:11px;
                letter-spacing:2px;
                opacity:0.55;
                margin-bottom:10px;
            ">
                MOCK INTERVIEW REPORT
            </div>

            <h2 style="margin-top:0;">
                Your Interview Performance
            </h2>

            <div style="
                font-size:42px;
                font-weight:700;
                margin:20px 0;
            ">
                ${averageScore.toFixed(1)}/10
            </div>

            <p>
                Questions evaluated:
                <strong>${mockInterviewResults.length}</strong>
            </p>

            <h3>💪 Strengths</h3>
            <ul>
                ${
                    uniqueStrengths.length
                        ? uniqueStrengths.map(item => `<li>${item}</li>`).join("")
                        : "<li>No strengths recorded.</li>"
                }
            </ul>

            <h3>🛠️ Areas to Improve</h3>
            <ul>
                ${
                    uniqueImprovements.length
                        ? uniqueImprovements.map(item => `<li>${item}</li>`).join("")
                        : "<li>No improvement areas recorded.</li>"
                }
            </ul>

            <h3>📊 Question Scores</h3>

            <ul>
                ${
                    mockInterviewResults.map(
                        (item, index) =>
                            `<li>Question ${index + 1}: <strong>${item.score}/10</strong></li>`
                    ).join("")
                }
            </ul>

            <button
                id="restartMockInterviewButton"
                class="primary-button small"
                type="button"
                style="margin-top:18px;"
            >
                Start New Interview
                <span>→</span>
            </button>

        </div>
    `;

    showToast("Interview report generated!");

});

document.addEventListener("click", function(event) {

    const button = event.target.closest("#restartMockInterviewButton");

    if (!button) return;

    mockInterviewResults = [];

    const startButton =
        document.getElementById("startMockInterviewButton");

    if (startButton) {
        startButton.click();
    }

});

/* =========================================================
   AI MOCK INTERVIEW - NEXT QUESTION
========================================================= */

document.addEventListener("click", async function(event) {

    const button = event.target.closest("#nextMockQuestionButton");

    if (!button) return;

    const area = document.getElementById("mockInterviewArea");

    if (!area) return;

    const nextQuestionNumber = mockInterviewResults.length + 1;

    if (nextQuestionNumber > MAX_MOCK_INTERVIEW_QUESTIONS) {
        showToast("You have completed all 5 questions!");
        return;
    }

    button.disabled = true;
    button.innerHTML = "Loading...";

    area.innerHTML = `
        <div style="
            padding:22px;
            border-radius:16px;
            background:rgba(255,255,255,0.04);
        ">
            <p>✦ Preparing your next interview question...</p>
        </div>
    `;

    try {

        const response = await fetch(
            API_URL + "/start-mock-interview",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    resume_text: resumeText,
                    job_description: jobDescription
                        ? jobDescription.value.trim()
                        : "",
                    question_number: nextQuestionNumber
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error || "Could not generate next question."
            );
        }

        area.innerHTML = `
            <div style="
                padding:24px;
                border-radius:16px;
                background:rgba(255,255,255,0.04);
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    font-size:11px;
                    letter-spacing:2px;
                    opacity:0.55;
                    margin-bottom:10px;
                ">
                    <span>
                        QUESTION ${data.question_number} OF ${MAX_MOCK_INTERVIEW_QUESTIONS}
                    </span>
                    <span>
                        ${Math.round((data.question_number / MAX_MOCK_INTERVIEW_QUESTIONS) * 100)}%
                    </span>
                </div>

                <div style="
                    width:100%;
                    height:6px;
                    border-radius:10px;
                    background:rgba(255,255,255,0.10);
                    overflow:hidden;
                    margin-bottom:18px;
                ">
                    <div style="
                        width:${Math.min(
                            100,
                            Math.round(
                                (data.question_number /
                                MAX_MOCK_INTERVIEW_QUESTIONS) * 100
                            )
                        )}%;
                        height:100%;
                        border-radius:10px;
                        background:currentColor;
                    "></div>
                </div>

                <h3 style="margin-top:0;">
                    ${data.question || ""}
                </h3>

                <textarea
                    id="mockInterviewAnswer"
                    placeholder="Type your answer here..."
                    style="
                        width:100%;
                        min-height:140px;
                        margin-top:18px;
                        padding:16px;
                        border-radius:12px;
                        resize:vertical;
                    "
                ></textarea>

                <button
                    id="submitMockAnswerButton"
                    class="primary-button small"
                    type="button"
                    style="margin-top:16px;"
                >
                    Submit Answer
                    <span>→</span>
                </button>

                <div
                    id="mockInterviewFeedback"
                    style="margin-top:20px;"
                ></div>

            </div>
        `;

        showToast(
            `Question ${data.question_number} ready!`
        );

    } catch (error) {

        console.error(
            "NEXT MOCK QUESTION ERROR:",
            error
        );

        area.innerHTML = `
            <div style="padding:18px;">
                <strong>
                    Unable to load the next question.
                </strong>
                <p>${error.message}</p>

                <button
                    id="retryMockQuestionButton"
                    class="primary-button small"
                    type="button"
                >
                    Try Again
                    <span>↻</span>
                </button>
            </div>
        `;

    }

});
